// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GoodCredScore.sol";
import "./interfaces/IERC677.sol";

/**
 * @title LendingPool
 * @dev Manages the pool of loanable G$ tokens, handling deposits, borrowing, and repayments
 * Supports both ERC20 (approve/transferFrom) and ERC677 (transferAndCall) patterns
 */
contract LendingPool is Ownable, ReentrancyGuard, IERC677Receiver {
    using SafeERC20 for IERC20;

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principal;
        uint256 amountDue;
        uint256 dueDate;
        bool isRepaid;
        uint256 borrowTime;
    }

    // State variables
    IERC20 public gDollarToken;
    GoodCredScore public scoreContract;

    // Loan parameters
    uint256 public loanTerm = 30 days; // Duration of a loan
    uint256 public interestRateBasisPoints = 500; // 5% interest rate (500 basis points)

    // Minimum score thresholds for different loan amounts
    uint256 public constant MIN_SCORE_FOR_LENDING = 300;
    uint256 public constant SCORE_TO_LOAN_MULTIPLIER = 100; // 1 score point = 100 G$ max loan

    // Loan tracking
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public activeLoanId; // Track active loan per user
    uint256 public nextLoanId = 1;

    // Pool statistics
    uint256 public totalDeposited;
    uint256 public totalBorrowed;
    uint256 public totalRepaid;

    // Quest ID for loan repayment (to be set after deployment)
    bytes32 public loanRepaymentQuestId;

    // Events
    event Deposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );
    event Withdrawn(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );
    event LoanTaken(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 amountDue,
        uint256 dueDate
    );
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event ParametersUpdated(uint256 loanTerm, uint256 interestRate);

    constructor(
        address _gDollarToken,
        address _scoreContract
    ) Ownable(msg.sender) {
        require(_gDollarToken != address(0), "Invalid G$ token address");
        require(_scoreContract != address(0), "Invalid score contract address");

        gDollarToken = IERC20(_gDollarToken);
        scoreContract = GoodCredScore(_scoreContract);
    }

    /**
     * @dev Deposit G$ into the lending pool
     * @param amount Amount of G$ to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        gDollarToken.safeTransferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw G$ from the lending pool (owner only, for emergency)
     * @param amount Amount of G$ to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(getAvailableFunds() >= amount, "Insufficient available funds");

        gDollarToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Borrow G$ from the lending pool
     * @param amount Amount of G$ to borrow
     */
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(activeLoanId[msg.sender] == 0, "Active loan already exists");

        // Check user's credit score
        uint256 userScore = scoreContract.getScore(msg.sender);
        require(userScore >= MIN_SCORE_FOR_LENDING, "Credit score too low");
        require(scoreContract.isVerified(msg.sender), "User not verified");

        // Calculate maximum loan amount based on score
        uint256 maxLoanAmount = (userScore * SCORE_TO_LOAN_MULTIPLIER);
        require(amount <= maxLoanAmount, "Loan amount exceeds credit limit");

        // Check pool has sufficient funds
        uint256 availableFunds = getAvailableFunds();
        require(availableFunds >= amount, "Insufficient pool funds");

        // Calculate interest and total amount due
        uint256 interest = (amount * interestRateBasisPoints) / 10000;
        uint256 amountDue = amount + interest;
        uint256 dueDate = block.timestamp + loanTerm;

        // Create loan record
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            principal: amount,
            amountDue: amountDue,
            dueDate: dueDate,
            isRepaid: false,
            borrowTime: block.timestamp
        });

        activeLoanId[msg.sender] = loanId;
        totalBorrowed += amount;

        // Transfer G$ to borrower
        gDollarToken.safeTransfer(msg.sender, amount);

        emit LoanTaken(loanId, msg.sender, amount, amountDue, dueDate);
    }

    /**
     * @dev Repay a loan
     * @param loanId The ID of the loan to repay
     */
    function repay(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(!loan.isRepaid, "Loan already repaid");
        require(activeLoanId[msg.sender] == loanId, "Not the active loan");

        uint256 amountDue = loan.amountDue;

        // Transfer repayment from borrower
        gDollarToken.safeTransferFrom(msg.sender, address(this), amountDue);

        // Mark loan as repaid
        loan.isRepaid = true;
        activeLoanId[msg.sender] = 0;
        totalRepaid += amountDue;

        emit LoanRepaid(loanId, msg.sender, amountDue);

        // Award credit score points for repayment (if quest ID is set)
        if (loanRepaymentQuestId != bytes32(0)) {
            // Note: This will revert if the user has already completed this quest
            // In production, you might want to handle this more gracefully
            try scoreContract.completeOnChainQuest(loanRepaymentQuestId) {
                // Quest completed successfully
            } catch {
                // Quest already completed or other error, continue anyway
            }
        }
    }

    /**
     * @dev ERC677 receiver function - called when tokens are sent via transferAndCall
     * Supports two operations encoded in data:
     * - "deposit" (empty data or "deposit"): Deposit G$ into the lending pool
     * - "repay": Repay an active loan
     * @param from The address that sent the tokens
     * @param value The amount of tokens received
     * @param data Additional data (operation type)
     * @return success True if the tokens were accepted
     */
    function onTokenTransfer(
        address from,
        uint256 value,
        bytes calldata data
    ) external override nonReentrant returns (bool success) {
        // Only accept G$ tokens
        require(
            msg.sender == address(gDollarToken),
            "Only G$ token can call this"
        );
        require(value > 0, "Amount must be greater than 0");

        // Decode operation from data
        string memory operation = data.length > 0 ? string(data) : "deposit";

        if (
            keccak256(bytes(operation)) == keccak256(bytes("deposit")) ||
            data.length == 0
        ) {
            // Handle deposit
            totalDeposited += value;
            emit Deposited(from, value, block.timestamp);
        } else if (keccak256(bytes(operation)) == keccak256(bytes("repay"))) {
            // Handle loan repayment
            uint256 loanId = activeLoanId[from];
            require(loanId != 0, "No active loan");

            Loan storage loan = loans[loanId];
            require(!loan.isRepaid, "Loan already repaid");
            require(value >= loan.amountDue, "Insufficient repayment amount");

            // Mark loan as repaid
            loan.isRepaid = true;
            activeLoanId[from] = 0;
            totalRepaid += loan.amountDue;

            emit LoanRepaid(loanId, from, loan.amountDue);

            // Refund excess payment if any
            if (value > loan.amountDue) {
                uint256 excess = value - loan.amountDue;
                gDollarToken.safeTransfer(from, excess);
            }

            // Award credit score points for repayment (if quest ID is set)
            if (loanRepaymentQuestId != bytes32(0)) {
                try scoreContract.completeOnChainQuest(loanRepaymentQuestId) {
                    // Quest completed successfully
                } catch {
                    // Quest already completed or other error, continue anyway
                }
            }
        } else {
            revert("Invalid operation");
        }

        return true;
    }

    /**
     * @dev Check if a loan is defaulted
     * @param loanId The ID of the loan to check
     */
    function isLoanDefaulted(uint256 loanId) public view returns (bool) {
        Loan storage loan = loans[loanId];
        return !loan.isRepaid && block.timestamp > loan.dueDate;
    }

    /**
     * @dev Get available funds in the pool
     */
    function getAvailableFunds() public view returns (uint256) {
        return gDollarToken.balanceOf(address(this));
    }

    /**
     * @dev Get pool statistics
     */
    function getPoolStats()
        external
        view
        returns (
            uint256 _totalDeposited,
            uint256 _totalBorrowed,
            uint256 _totalRepaid,
            uint256 _availableFunds,
            uint256 _utilizationRate
        )
    {
        uint256 available = getAvailableFunds();
        uint256 outstanding = totalBorrowed - totalRepaid;
        uint256 utilization = 0;

        if (totalDeposited > 0) {
            utilization = (outstanding * 10000) / totalDeposited; // Basis points
        }

        return (
            totalDeposited,
            totalBorrowed,
            totalRepaid,
            available,
            utilization
        );
    }

    /**
     * @dev Get user's active loan details
     */
    function getActiveLoan(
        address user
    )
        external
        view
        returns (
            uint256 loanId,
            uint256 principal,
            uint256 amountDue,
            uint256 dueDate,
            bool isRepaid
        )
    {
        uint256 activeId = activeLoanId[user];
        if (activeId == 0) {
            return (0, 0, 0, 0, false);
        }

        Loan storage loan = loans[activeId];
        return (
            loan.loanId,
            loan.principal,
            loan.amountDue,
            loan.dueDate,
            loan.isRepaid
        );
    }

    /**
     * @dev Calculate maximum loan amount for a user based on their score
     */
    function getMaxLoanAmount(address user) external view returns (uint256) {
        if (!scoreContract.isVerified(user)) {
            return 0;
        }

        uint256 userScore = scoreContract.getScore(user);
        if (userScore < MIN_SCORE_FOR_LENDING) {
            return 0;
        }

        return userScore * SCORE_TO_LOAN_MULTIPLIER;
    }

    /**
     * @dev Update loan parameters (owner only)
     */
    function updateLoanParameters(
        uint256 _loanTerm,
        uint256 _interestRateBasisPoints
    ) external onlyOwner {
        require(_loanTerm > 0, "Loan term must be greater than 0");
        require(_interestRateBasisPoints <= 10000, "Interest rate too high");

        loanTerm = _loanTerm;
        interestRateBasisPoints = _interestRateBasisPoints;

        emit ParametersUpdated(_loanTerm, _interestRateBasisPoints);
    }

    /**
     * @dev Set the quest ID for loan repayment rewards
     */
    function setLoanRepaymentQuestId(bytes32 _questId) external onlyOwner {
        loanRepaymentQuestId = _questId;
    }
}
