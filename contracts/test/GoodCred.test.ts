import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { GoodCredScore } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GoodCred Protocol", function () {
  // Fixture to deploy all contracts
  async function deployGoodCredFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy MockGDollar
    const MockGDollarFactory = await ethers.getContractFactory("MockGDollar");
    const gDollar = await MockGDollarFactory.deploy();

    // Deploy QuestRegistry
    const QuestRegistryFactory = await ethers.getContractFactory(
      "QuestRegistry"
    );
    const questRegistry = await QuestRegistryFactory.deploy();

    // Deploy GoodCredScore
    const GoodCredScoreFactory = await ethers.getContractFactory(
      "GoodCredScore"
    );
    const goodCredScore = await GoodCredScoreFactory.deploy(
      await questRegistry.getAddress()
    );

    // Deploy LendingPool
    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy(
      await gDollar.getAddress(),
      await goodCredScore.getAddress()
    );

    // Mint some G$ to users for testing
    await gDollar
      .connect(owner)
      .mint(user1.address, ethers.parseEther("10000"));
    await gDollar
      .connect(owner)
      .mint(user2.address, ethers.parseEther("10000"));
    await gDollar
      .connect(owner)
      .mint(await lendingPool.getAddress(), ethers.parseEther("100000"));

    return {
      gDollar,
      questRegistry,
      goodCredScore,
      lendingPool,
      owner,
      user1,
      user2,
      user3,
    };
  }

  describe("QuestRegistry", function () {
    it("Should allow owner to add quests", async function () {
      const { questRegistry, owner } = await loadFixture(deployGoodCredFixture);

      const questId = ethers.id("provide-liquidity");
      await questRegistry.addQuest(
        questId,
        "Provide G$ liquidity on Ubeswap",
        100,
        0, // ON_CHAIN
        ethers.ZeroAddress,
        "",
        ""
      );

      const quest = await questRegistry.getQuest(questId);
      expect(quest.description).to.equal("Provide G$ liquidity on Ubeswap");
      expect(quest.scorePoints).to.equal(100);
    });

    it("Should not allow non-owner to add quests", async function () {
      const { questRegistry, user1 } = await loadFixture(deployGoodCredFixture);

      const questId = ethers.id("test-quest");
      await expect(
        questRegistry
          .connect(user1)
          .addQuest(questId, "Test Quest", 50, 0, ethers.ZeroAddress, "", "")
      ).to.be.reverted;
    });
  });

  describe("GoodCredScore", function () {
    it("Should allow user to register", async function () {
      const { goodCredScore, user1 } = await loadFixture(deployGoodCredFixture);

      await goodCredScore.connect(user1).register();

      const hasProfile = await goodCredScore.hasUserProfile(user1.address);
      expect(hasProfile).to.be.true;
    });

    it("Should not allow duplicate registration", async function () {
      const { goodCredScore, user1 } = await loadFixture(deployGoodCredFixture);

      await goodCredScore.connect(user1).register();

      await expect(goodCredScore.connect(user1).register()).to.be.revertedWith(
        "Profile already exists"
      );
    });

    it("Should allow owner to verify user via GoodID", async function () {
      const { goodCredScore, owner, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      await goodCredScore.connect(user1).register();
      await goodCredScore
        .connect(owner)
        .confirmGoodIdVerification(user1.address);

      const isVerified = await goodCredScore.isVerified(user1.address);
      expect(isVerified).to.be.true;

      const score = await goodCredScore.getScore(user1.address);
      expect(score).to.equal(100); // GOODID_VERIFICATION_POINTS
    });

    it("Should allow verified user to complete on-chain quest", async function () {
      const { goodCredScore, questRegistry, owner, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      // Setup
      await goodCredScore.connect(user1).register();
      await goodCredScore
        .connect(owner)
        .confirmGoodIdVerification(user1.address);

      // Add quest
      const questId = ethers.id("first-trade");
      await questRegistry.addQuest(
        questId,
        "Complete first trade",
        50,
        0, // ON_CHAIN
        ethers.ZeroAddress,
        "",
        ""
      );

      // Complete quest
      await goodCredScore.connect(user1).completeOnChainQuest(questId);

      const score = await goodCredScore.getScore(user1.address);
      expect(score).to.equal(150); // 100 (verification) + 50 (quest)

      const hasCompleted = await goodCredScore.hasCompletedQuest(
        user1.address,
        questId
      );
      expect(hasCompleted).to.be.true;
    });

    it("Should not allow unverified user to complete quests", async function () {
      const { goodCredScore, questRegistry, owner, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      await goodCredScore.connect(user1).register();

      const questId = ethers.id("test-quest");
      await questRegistry.addQuest(
        questId,
        "Test Quest",
        50,
        0,
        ethers.ZeroAddress,
        "",
        ""
      );

      await expect(
        goodCredScore.connect(user1).completeOnChainQuest(questId)
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("LendingPool", function () {
    async function setupVerifiedUser(
      goodCredScore: GoodCredScore,
      owner: SignerWithAddress,
      user: SignerWithAddress
    ) {
      await goodCredScore.connect(user).register();
      await goodCredScore
        .connect(owner)
        .confirmGoodIdVerification(user.address);
    }

    it("Should allow deposit to lending pool", async function () {
      const { gDollar, lendingPool, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      const depositAmount = ethers.parseEther("1000");
      await gDollar
        .connect(user1)
        .approve(await lendingPool.getAddress(), depositAmount);
      await lendingPool.connect(user1).deposit(depositAmount);

      const poolBalance = await gDollar.balanceOf(
        await lendingPool.getAddress()
      );
      expect(poolBalance).to.be.gte(depositAmount);
    });

    it("Should allow eligible user to borrow", async function () {
      const { gDollar, goodCredScore, lendingPool, owner, user1 } =
        await loadFixture(deployGoodCredFixture);

      // Setup verified user
      await setupVerifiedUser(goodCredScore, owner, user1);

      // Get user score (should be 100 from verification)
      const score = await goodCredScore.getScore(user1.address);
      expect(score).to.equal(100);

      // Borrow amount based on score (score * 100)
      const borrowAmount = ethers.parseEther("5000"); // User can borrow up to 10,000 G$

      const balanceBefore = await gDollar.balanceOf(user1.address);
      await lendingPool.connect(user1).borrow(borrowAmount);
      const balanceAfter = await gDollar.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(borrowAmount);

      // Check active loan
      const activeLoan = await lendingPool.getActiveLoan(user1.address);
      expect(activeLoan.principal).to.equal(borrowAmount);
    });

    it("Should not allow borrowing without sufficient credit score", async function () {
      const { goodCredScore, lendingPool, owner, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      await setupVerifiedUser(goodCredScore, owner, user1);

      const borrowAmount = ethers.parseEther("20000"); // Too much for score of 100

      await expect(
        lendingPool.connect(user1).borrow(borrowAmount)
      ).to.be.revertedWith("Loan amount exceeds credit limit");
    });

    it("Should allow loan repayment", async function () {
      const { gDollar, goodCredScore, lendingPool, owner, user1 } =
        await loadFixture(deployGoodCredFixture);

      await setupVerifiedUser(goodCredScore, owner, user1);

      const borrowAmount = ethers.parseEther("5000");
      await lendingPool.connect(user1).borrow(borrowAmount);

      const activeLoan = await lendingPool.getActiveLoan(user1.address);
      const amountDue = activeLoan.amountDue;

      // Approve and repay
      await gDollar
        .connect(user1)
        .approve(await lendingPool.getAddress(), amountDue);
      await lendingPool.connect(user1).repay(activeLoan.loanId);

      // Check loan is repaid
      const loanAfter = await lendingPool.loans(activeLoan.loanId);
      expect(loanAfter.isRepaid).to.be.true;
    });

    it("Should calculate max loan amount correctly", async function () {
      const { goodCredScore, lendingPool, owner, user1 } = await loadFixture(
        deployGoodCredFixture
      );

      await setupVerifiedUser(goodCredScore, owner, user1);

      const score = await goodCredScore.getScore(user1.address);
      const maxLoan = await lendingPool.getMaxLoanAmount(user1.address);

      expect(maxLoan).to.equal(score * 100n); // score * SCORE_TO_LOAN_MULTIPLIER
    });

    it("Should return pool statistics", async function () {
      const { lendingPool } = await loadFixture(deployGoodCredFixture);

      const stats = await lendingPool.getPoolStats();
      expect(stats._availableFunds).to.be.gt(0);
    });
  });

  describe("Integration Tests", function () {
    it("Should handle full user journey: register -> verify -> quest -> borrow -> repay", async function () {
      const {
        gDollar,
        goodCredScore,
        questRegistry,
        lendingPool,
        owner,
        user1,
      } = await loadFixture(deployGoodCredFixture);

      // 1. Register
      await goodCredScore.connect(user1).register();

      // 2. Verify
      await goodCredScore
        .connect(owner)
        .confirmGoodIdVerification(user1.address);
      let score = await goodCredScore.getScore(user1.address);
      expect(score).to.equal(100);

      // 3. Complete quest
      const questId = ethers.id("provide-liquidity");
      await questRegistry.addQuest(
        questId,
        "Provide liquidity",
        100,
        0,
        ethers.ZeroAddress,
        "",
        ""
      );
      await goodCredScore.connect(user1).completeOnChainQuest(questId);
      score = await goodCredScore.getScore(user1.address);
      expect(score).to.equal(200);

      // 4. Borrow
      const borrowAmount = ethers.parseEther("10000");
      await lendingPool.connect(user1).borrow(borrowAmount);

      const activeLoan = await lendingPool.getActiveLoan(user1.address);
      expect(activeLoan.principal).to.equal(borrowAmount);

      // 5. Repay
      await gDollar
        .connect(user1)
        .approve(await lendingPool.getAddress(), activeLoan.amountDue);
      await lendingPool.connect(user1).repay(activeLoan.loanId);

      const loanAfter = await lendingPool.loans(activeLoan.loanId);
      expect(loanAfter.isRepaid).to.be.true;
    });
  });
});
