// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IERC677
 * @dev Interface for ERC677 token standard (GoodDollar G$ token)
 * Allows tokens to be transferred and a contract to be called in a single transaction
 */
interface IERC677 is IERC20 {
    /**
     * @dev Transfer tokens to a contract address and call a function on the recipient
     * @param to The address to transfer to
     * @param value The amount to be transferred
     * @param data Additional data to be passed to the receiving contract
     * @return success True if the operation was successful
     */
    function transferAndCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success);
}

/**
 * @title IERC677Receiver
 * @dev Interface that contracts must implement to receive ERC677 tokens
 */
interface IERC677Receiver {
    /**
     * @dev Called when tokens are transferred using transferAndCall
     * @param from The address that sent the tokens
     * @param value The amount of tokens transferred
     * @param data Additional data passed with the transfer
     * @return success True if the tokens were accepted
     */
    function onTokenTransfer(
        address from,
        uint256 value,
        bytes calldata data
    ) external returns (bool success);
}
