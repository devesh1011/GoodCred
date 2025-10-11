// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GoodDollarConfig
 * @dev Configuration contract for G$ token addresses on different networks
 * Reference: https://docs.gooddollar.org/
 */
library GoodDollarConfig {
    // Production addresses
    address public constant G$_CELO_MAINNET =
        0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A;
    address public constant G$_FUSE_MAINNET =
        0x495d133B938596C9984d462F007B676bDc57eCEC;

    // Staging addresses (for testing)
    address public constant G$_CELO_STAGING =
        0x61FA0fB802fd8345C06da558240E0651886fec69;
    address public constant G$_FUSE_STAGING =
        0xe39236a9Cf13f65DB8adD06BD4b834C65c523d2b;

    // Development addresses
    address public constant G$_CELO_DEV =
        0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475;
    address public constant G$_FUSE_DEV =
        0x79BeecC4b165Ccf547662cB4f7C0e83b3796E5b3;

    // Alfajores Testnet (Celo)
    address public constant G$_ALFAJORES =
        0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A; // Use staging for testnet

    /**
     * @dev Get G$ token address for a specific network
     * @param chainId The chain ID
     * @param environment 0=production, 1=staging, 2=development
     */
    function getGDollarAddress(
        uint256 chainId,
        uint8 environment
    ) internal pure returns (address) {
        // Celo Mainnet
        if (chainId == 42220) {
            if (environment == 0) return G$_CELO_MAINNET;
            if (environment == 1) return G$_CELO_STAGING;
            if (environment == 2) return G$_CELO_DEV;
        }
        // Celo Alfajores Testnet
        else if (chainId == 44787) {
            return G$_ALFAJORES;
        }
        // Fuse Mainnet
        else if (chainId == 122) {
            if (environment == 0) return G$_FUSE_MAINNET;
            if (environment == 1) return G$_FUSE_STAGING;
            if (environment == 2) return G$_FUSE_DEV;
        }

        revert("Unsupported network");
    }
}
