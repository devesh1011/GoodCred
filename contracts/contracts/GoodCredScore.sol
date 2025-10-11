// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./QuestRegistry.sol";

/**
 * @title GoodCredScore
 * @dev Core contract that manages user profiles, calculates scores, and verifies Quest completion
 */
contract GoodCredScore is Ownable, ReentrancyGuard {
    struct UserProfile {
        address userAddress;
        bool isVerified; // Verified via GoodID
        uint256 score;
        uint256 registrationTime;
        mapping(bytes32 => bool) completedQuests;
    }

    // State variables
    mapping(address => UserProfile) private profiles;
    mapping(address => bool) private hasProfile;
    QuestRegistry public questRegistry;

    // GoodID verification (simplified - in production, integrate with actual GoodID SDK)
    mapping(address => bool) public goodIdVerified;

    // Reclaim Protocol verifier address (placeholder - replace with actual Reclaim contract)
    address public reclaimVerifier;

    // Constants
    uint256 public constant GOODID_VERIFICATION_POINTS = 100;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_SCORE = 850;

    // Events
    event ProfileCreated(address indexed user, uint256 timestamp);
    event ProfileVerified(address indexed user, uint256 score);
    event ScoreUpdated(address indexed user, uint256 newScore, bytes32 questId);
    event QuestCompleted(
        address indexed user,
        bytes32 indexed questId,
        uint256 pointsEarned
    );

    constructor(address _questRegistry) Ownable(msg.sender) {
        require(_questRegistry != address(0), "Invalid quest registry address");
        questRegistry = QuestRegistry(_questRegistry);
    }

    /**
     * @dev Register a new user profile
     */
    function register() external nonReentrant {
        require(!hasProfile[msg.sender], "Profile already exists");

        hasProfile[msg.sender] = true;
        UserProfile storage profile = profiles[msg.sender];
        profile.userAddress = msg.sender;
        profile.isVerified = false;
        profile.score = MIN_SCORE;
        profile.registrationTime = block.timestamp;

        emit ProfileCreated(msg.sender, block.timestamp);
    }

    /**
     * @dev Confirm GoodID verification
     * In production, this would verify a proof from the GoodID SDK
     * For now, we'll use a simplified admin-approved approach
     */
    function confirmGoodIdVerification(address user) external onlyOwner {
        require(hasProfile[user], "User profile does not exist");
        require(!profiles[user].isVerified, "User already verified");

        profiles[user].isVerified = true;
        goodIdVerified[user] = true;

        // Award verification points
        _updateScore(user, GOODID_VERIFICATION_POINTS, bytes32(0));

        emit ProfileVerified(user, profiles[user].score);
    }

    /**
     * @dev Complete an on-chain quest
     * @param questId The ID of the quest to complete
     */
    function completeOnChainQuest(bytes32 questId) external nonReentrant {
        require(hasProfile[msg.sender], "Profile does not exist");
        require(profiles[msg.sender].isVerified, "User not verified");
        require(
            !profiles[msg.sender].completedQuests[questId],
            "Quest already completed"
        );

        // Get quest details from registry
        QuestRegistry.Quest memory quest = questRegistry.getQuest(questId);
        require(quest.isActive, "Quest is not active");
        require(
            quest.questType == QuestRegistry.QuestType.ON_CHAIN,
            "Not an on-chain quest"
        );

        // Verify quest completion (simplified - in production, check actual on-chain state)
        // For example, check LP token balance, governance participation, etc.
        bool verified = _verifyOnChainQuest(msg.sender, quest);
        require(verified, "Quest requirements not met");

        // Mark quest as completed and update score
        profiles[msg.sender].completedQuests[questId] = true;
        _updateScore(msg.sender, quest.scorePoints, questId);

        emit QuestCompleted(msg.sender, questId, quest.scorePoints);
    }

    /**
     * @dev Complete an off-chain quest using Reclaim Protocol
     * @param questId The ID of the quest to complete
     * @param reclaimProof The zero-knowledge proof from Reclaim Protocol
     */
    function completeOffChainQuest(
        bytes32 questId,
        bytes memory reclaimProof
    ) external nonReentrant {
        require(hasProfile[msg.sender], "Profile does not exist");
        require(profiles[msg.sender].isVerified, "User not verified");
        require(
            !profiles[msg.sender].completedQuests[questId],
            "Quest already completed"
        );

        // Get quest details from registry
        QuestRegistry.Quest memory quest = questRegistry.getQuest(questId);
        require(quest.isActive, "Quest is not active");
        require(
            quest.questType == QuestRegistry.QuestType.OFF_CHAIN,
            "Not an off-chain quest"
        );

        // Verify Reclaim proof (simplified - in production, call actual Reclaim verifier)
        bool verified = _verifyReclaimProof(msg.sender, quest, reclaimProof);
        require(verified, "Invalid Reclaim proof");

        // Mark quest as completed and update score
        profiles[msg.sender].completedQuests[questId] = true;
        _updateScore(msg.sender, quest.scorePoints, questId);

        emit QuestCompleted(msg.sender, questId, quest.scorePoints);
    }

    /**
     * @dev Internal function to update user score
     */
    function _updateScore(
        address user,
        uint256 points,
        bytes32 questId
    ) internal {
        uint256 newScore = profiles[user].score + points;
        if (newScore > MAX_SCORE) {
            newScore = MAX_SCORE;
        }
        profiles[user].score = newScore;
        emit ScoreUpdated(user, newScore, questId);
    }

    /**
     * @dev Internal function to verify on-chain quest completion
     * This is a simplified placeholder - in production, implement actual verification logic
     */
    function _verifyOnChainQuest(
        address user,
        QuestRegistry.Quest memory quest
    ) internal view returns (bool) {
        // Placeholder verification
        // In production, check:
        // - LP token balances for liquidity provision quests
        // - Governance votes for voting quests
        // - Transaction history for trading quests
        // etc.

        // For now, always return true (admin will need to verify manually)
        return true;
    }

    /**
     * @dev Internal function to verify Reclaim Protocol proof
     * This is a placeholder - in production, integrate with actual Reclaim verifier contract
     */
    function _verifyReclaimProof(
        address user,
        QuestRegistry.Quest memory quest,
        bytes memory proof
    ) internal view returns (bool) {
        // Placeholder verification
        // In production, call the Reclaim Protocol verifier contract
        // to validate the zero-knowledge proof

        // For now, always return true (admin will need to verify manually)
        return true;
    }

    /**
     * @dev Set the Reclaim verifier contract address
     */
    function setReclaimVerifier(address _reclaimVerifier) external onlyOwner {
        require(_reclaimVerifier != address(0), "Invalid verifier address");
        reclaimVerifier = _reclaimVerifier;
    }

    /**
     * @dev Get user's score
     */
    function getScore(address user) external view returns (uint256) {
        require(hasProfile[user], "Profile does not exist");
        return profiles[user].score;
    }

    /**
     * @dev Check if user is verified
     */
    function isVerified(address user) external view returns (bool) {
        return hasProfile[user] && profiles[user].isVerified;
    }

    /**
     * @dev Check if user has completed a quest
     */
    function hasCompletedQuest(
        address user,
        bytes32 questId
    ) external view returns (bool) {
        if (!hasProfile[user]) return false;
        return profiles[user].completedQuests[questId];
    }

    /**
     * @dev Get user profile info (without mapping data)
     */
    function getUserProfile(
        address user
    )
        external
        view
        returns (
            address userAddress,
            bool isVerified,
            uint256 score,
            uint256 registrationTime
        )
    {
        require(hasProfile[user], "Profile does not exist");
        UserProfile storage profile = profiles[user];
        return (
            profile.userAddress,
            profile.isVerified,
            profile.score,
            profile.registrationTime
        );
    }

    /**
     * @dev Check if user has a profile
     */
    function hasUserProfile(address user) external view returns (bool) {
        return hasProfile[user];
    }
}
