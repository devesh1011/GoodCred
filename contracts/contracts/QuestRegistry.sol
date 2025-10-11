// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title QuestRegistry
 * @dev Manages the definitions and parameters of all available quests
 */
contract QuestRegistry is Ownable {
    enum QuestType {
        ON_CHAIN,
        OFF_CHAIN
    }

    struct Quest {
        bytes32 questId;
        string description;
        uint256 scorePoints;
        QuestType questType;
        address targetContract; // For on-chain quests
        string reclaimProvider; // For off-chain quests (e.g., "Coursera")
        string reclaimClaimData; // Expected claim data from Reclaim
        bool isActive;
    }

    // Mapping from questId to Quest details
    mapping(bytes32 => Quest) private quests;

    // Array to keep track of all quest IDs
    bytes32[] private questIds;

    // Events
    event QuestAdded(
        bytes32 indexed questId,
        string description,
        uint256 scorePoints
    );
    event QuestUpdated(
        bytes32 indexed questId,
        string description,
        uint256 scorePoints
    );
    event QuestDeactivated(bytes32 indexed questId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Add a new quest to the registry
     * @param questId Unique identifier for the quest
     * @param description Human-readable description of the quest
     * @param scorePoints Points awarded for completing the quest
     * @param questType Type of quest (ON_CHAIN or OFF_CHAIN)
     * @param targetContract Contract address for on-chain verification (0x0 for off-chain)
     * @param reclaimProvider Provider name for Reclaim Protocol (empty for on-chain)
     * @param reclaimClaimData Expected claim data from Reclaim (empty for on-chain)
     */
    function addQuest(
        bytes32 questId,
        string calldata description,
        uint256 scorePoints,
        QuestType questType,
        address targetContract,
        string calldata reclaimProvider,
        string calldata reclaimClaimData
    ) external onlyOwner {
        require(quests[questId].questId == bytes32(0), "Quest already exists");
        require(scorePoints > 0, "Score points must be greater than 0");

        quests[questId] = Quest({
            questId: questId,
            description: description,
            scorePoints: scorePoints,
            questType: questType,
            targetContract: targetContract,
            reclaimProvider: reclaimProvider,
            reclaimClaimData: reclaimClaimData,
            isActive: true
        });

        questIds.push(questId);

        emit QuestAdded(questId, description, scorePoints);
    }

    /**
     * @dev Update an existing quest
     */
    function updateQuest(
        bytes32 questId,
        string calldata description,
        uint256 scorePoints,
        QuestType questType,
        address targetContract,
        string calldata reclaimProvider,
        string calldata reclaimClaimData
    ) external onlyOwner {
        require(quests[questId].questId != bytes32(0), "Quest does not exist");
        require(scorePoints > 0, "Score points must be greater than 0");

        Quest storage quest = quests[questId];
        quest.description = description;
        quest.scorePoints = scorePoints;
        quest.questType = questType;
        quest.targetContract = targetContract;
        quest.reclaimProvider = reclaimProvider;
        quest.reclaimClaimData = reclaimClaimData;

        emit QuestUpdated(questId, description, scorePoints);
    }

    /**
     * @dev Deactivate a quest
     */
    function deactivateQuest(bytes32 questId) external onlyOwner {
        require(quests[questId].questId != bytes32(0), "Quest does not exist");
        quests[questId].isActive = false;
        emit QuestDeactivated(questId);
    }

    /**
     * @dev Get quest details
     */
    function getQuest(bytes32 questId) external view returns (Quest memory) {
        require(quests[questId].questId != bytes32(0), "Quest does not exist");
        return quests[questId];
    }

    /**
     * @dev Get all quest IDs
     */
    function getAllQuestIds() external view returns (bytes32[] memory) {
        return questIds;
    }

    /**
     * @dev Check if a quest is active
     */
    function isQuestActive(bytes32 questId) external view returns (bool) {
        return quests[questId].isActive;
    }
}
