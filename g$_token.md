# How to integrate the G$ token

## Integrating the G$ Token

The **G$ token** is an [ERC-677](https://github.com/ethereum/EIPs/issues/677) compliant token used to power Universal Basic Income (UBI) within the **GoodDollar** ecosystem. This guide helps you integrate G$ into your dApp, with practical examples using **Viem/Wagmi** (React) and **Ethers v6** (JavaScript). You'll learn how to use `transferAndCall` for streamlined contract interactions, and when to fall back on the standard `approve` + `transferFrom` method.

***

#### Contracts

```javascript
  g$Contract: {
    production: {
      celo: "https://celoscan.io/address/0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A",
      fuse: "https://explorer.fuse.io/address/0x495d133B938596C9984d462F007B676bDc57eCEC",
    },
    staging: {
      celo: "https://celoscan.io/address/0x61FA0fB802fd8345C06da558240E0651886fec69",
      fuse: "https://explorer.fuse.io/address/0xe39236a9Cf13f65DB8adD06BD4b834C65c523d2b",
    },
    development: {
      celo: "https://celoscan.io/address/0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475",
      fuse: "https://explorer.fuse.io/address/0x79BeecC4b165Ccf547662cB4f7C0e83b3796E5b3",
    },
  },
```

### Prerequisites

Before integrating, ensure you are familiar with:

* ERC-20 and ERC-677/ERC-777 token standards
* React & Wagmi hooks (for frontend apps)
* Ethers v6 (for browser or Node environments)
* The G$ token contract on supported chains (e.g. Celo, Fuse, Ethereum)

***

For making G$ transfers for your dapps users, below are some options to consider&#x20;

### Option 1: `transferAndCall` (Recommended)

#### Overview

Use `transferAndCall` to send G$ and call a contract function in a **single transaction**. This improves gas efficiency and simplifies the user experience when the receiving contract implements:

```solidity
function onTokenTransfer(address from, uint256 value, bytes calldata data) external returns (bool)
```

You can see an example implementation of this in our faucet contract: <https://github.com/GoodDollar/GoodProtocol/blob/cd82c575f7b78392a18e72f700a423f53b436f10/contracts/fuseFaucet/FuseFaucetV2.sol#L252>

#### Use Case Example

In a marketplace dApp, a user can pay 10 G$ and specify an item ID, completing a purchase in one click.

***

Example: Viem/Wagmi (React)

```tsx
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits, encodeAbiParameters } from 'viem';

const G$Address = '0x...'; // G$ token contract
const marketplaceAddress = '0x...';
const amount = parseUnits('10', 18); // 10 G$
const itemId = 1;
const data = encodeAbiParameters([{ type: 'uint256' }], [itemId]);

const { config } = usePrepareContractWrite({
  address: G$Address,
  abi: [{
    name: 'transferAndCall',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  }],
  functionName: 'transferAndCall',
  args: [marketplaceAddress, amount, data],
});

const { write } = useContractWrite(config);

return <button onClick={() => write?.()}>Buy Item with G$</button>;
```

***

#### Example: Ethers v6

```ts
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const G$Contract = new ethers.Contract(G$Address, abi, signer);
const marketplaceAddress = '0x...';
const amount = ethers.parseUnits('10', 18);
const itemId = 1;
const data = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [itemId]);

await G$Contract.transferAndCall(marketplaceAddress, amount, data);
```

***

### Option 2: Leveraging ERC-777 for Token Transfers

Overview

The GoodDollar token (G$) also embraces the ERC-777 standard, offering another advanced way to handle token interactions, particularly when sending tokens to smart contracts. Similar to ERC-677's `transferAndCall`, ERC-777 allows for a token transfer and a subsequent action on the recipient contract within a single transaction. This is achieved using the `send` function and a "tokens received hook."

**Key Benefits of using ERC-777 `send`:**

* **Single Transaction Efficiency**: Just like `transferAndCall`, the `send` function in ERC-777 transfers G$ tokens and notifies the recipient contract in one go, saving on gas and simplifying the user experience.
* **Standardized Reception**: Recipient contracts can implement the `tokensReceived` hook. This function is automatically called by the G$ token contract when it receives tokens via the `send` function.

**How it Works:**

When you use the `send` function from an ERC-777 compliant G$ token contract:

`send(address to, uint256 amount, bytes calldata data)`

1. The G$ tokens are transferred to the `to` address.
2. If the `to` address is a contract that implements the `IERC777Recipient` interface, its `tokensReceived` hook will be called with details of the transfer:

   ```solidity
   function tokensReceived(
       address operator,
       address from,
       address to,
       uint256 amount,
       bytes calldata userData,
       bytes calldata operatorData
   ) external;
   ```

   * `operator`: The address that initiated the token movement (could be the `from` address or an authorized operator).
   * `from`: The address that sent the tokens.
   * `to`: The recipient address (your contract).
   * `amount`: The amount of G$ tokens received.
   * `userData`: Arbitrary data passed by the sender, similar to the `data` in `transferAndCall`.
   * `operatorData`: Arbitrary data passed by the operator, if different from the sender.

**When to Consider ERC-777:**

* If you're building contracts that need to react to incoming G$ tokens in a standardized way.
* When you appreciate the broader features of ERC-777, such as operator approvals (which offer more flexibility than ERC-20 allowances) and sender/recipient hooks for various use cases.
* If you aim for compatibility with other protocols or tools that specifically leverage ERC-777 hooks.

**Example:**

While we showcased `transferAndCall` with our FuseFaucetV2 for ERC-677, a contract designed to work with ERC-777 G$ tokens would implement the `tokensReceived` Hook like this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
// Assuming your G$ token contract implements IERC777
// import "path/to/your/IERC777GoodDollar.sol";

contract MyGoodDollarAwareContract is IERC777Recipient {

    // Make sure your contract is registered with the ERC1820 registry
    // to declare that it implements the IERC777Recipient interface.
    // This is often done in the constructor.
    // See OpenZeppelin's ERC777Recipient documentation for details.

    // GoodDollar Token (G$)
    // IERC777GoodDollar public goodDollarToken;

    // constructor(address _goodDollarTokenAddress) {
    //     goodDollarToken = IERC777GoodDollar(_goodDollarTokenAddress);
    //     // Additional setup for ERC1820 registry might be needed here
    // }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        // Ensure this hook is only callable by the G$ token contract
        // require(msg.sender == address(goodDollarToken), "Only G$ token can call this");

        // Your custom logic here when G$ tokens are received
        // For example, log the reception, update state, or trigger another action.
        // The 'userData' can be used to pass instructions or parameters.
        // emit TokensReceived(from, amount, userData);
    }

    // Fallback function to receive plain Ether, if needed
    // receive() external payable {}
}
```

### Option 3: `approve` + `transferFrom`

#### Overview

Use this method when the receiving contract **does not** implement `onTokenTransfer`, or when the dApp needs explicit allowance control. This requires **two transactions**:

1. Approve the contract to spend G$
2. Call the function that uses `transferFrom` internally

***

#### Example: Viem/Wagmi (React)

**Step 1: Approve G$ spending**

```tsx
const amountToApprove = parseUnits('10', 18);

const { config: approveConfig } = usePrepareContractWrite({
  address: G$Address,
  abi: [{
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  }],
  functionName: 'approve',
  args: [marketplaceAddress, amountToApprove],
});

const { write: approve } = useContractWrite(approveConfig);

<button onClick={() => approve?.()}>Approve Marketplace</button>
```

**Step 2: Call buy function**

```tsx
const itemId = 1;

const { config: buyConfig } = usePrepareContractWrite({
  address: marketplaceAddress,
  abi: [{
    name: 'buyItem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'itemId', type: 'uint256' }],
    outputs: [],
  }],
  functionName: 'buyItem',
  args: [itemId],
});

const { write: buy } = useContractWrite(buyConfig);

<button onClick={() => buy?.()}>Buy Item</button>
```

***

#### Example: Ethers v6

```ts
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const G$Contract = new ethers.Contract(G$Address, abi, signer);
const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);

const amountToApprove = ethers.parseUnits('10', 18);
const itemId = 1;

await G$Contract.approve(marketplaceAddress, amountToApprove);
await marketplaceContract.buyItem(itemId);
```

***

### Additional Considerations

#### Transaction Fees

G$ transfers may include a **protocol fee** via the `_processFees` function. This can result in the recipient receiving slightly less than the sent amount. Always account for this in your logic or inform users ahead of time.

#### Token Decimals

G$ uses **18 decimals** on Celo, and **2 decimals** on Fuse . Use utilities like `parseUnits` or `formatUnits` for correct calculations.

#### Balance Checks

Check the user's balance with `balanceOf()` before calling transfer methods to reduce the risk of failed transactions.

#### Contract Compatibility

Ensure the recipient contract supports this function for `transferAndCall` to succeed:

```solidity
function onTokenTransfer(address from, uint256 value, bytes calldata data) external returns (bool);
```

If not, fall back to `approve + transferFrom` or add a wrapper contract that can handle the callback.

***

### Notes on Ethers v6

* **Provider updates**: Use `BrowserProvider` instead of `Web3Provider`
* **Signers**: `getSigner()` is now async
* **Utility changes**: Use `ethers.parseUnits`, `ethers.AbiCoder.defaultAbiCoder().encode`
* **BigInt usage**: Native BigInt replaces BigNumber throughout the library

***

### Example Use Case: Marketplace Checkout

| Method                   | Flow                         | Pros                                     | Cons                               |
| ------------------------ | ---------------------------- | ---------------------------------------- | ---------------------------------- |
| `transferAndCall`        | Send G$ + buy item in one tx | <p>✅ Gas-efficient<br>✅ One-click UX</p> | ⚠️ Requires `onTokenTransfer`      |
| `approve + transferFrom` | Approve first, then buy      | ✅ Compatible with most ERC20 apps        | <p>❌ Two steps<br>❌ Higher gas</p> |

***

### 📚 References

* [GoodDollar Token Docs](https://docs.gooddollar.org/)
* [ERC-677 Specification](https://github.com/ethereum/EIPs/issues/677)
* [Ethers v6 Docs](https://docs.ethers.org/v6/)

***
