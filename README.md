# OpenCCIP SDK README

The OpenCCIP SDK serves as a SDK for developers seeking to integrate with CRC1, CRC1Syncable, CRC20 and Fee Automation in [OpenCCIP Contract](https://github.com/Nava-Labs/openccip-contracts/tree/main#crc1--crc20). It integrates with Viem Wallet, ensuring a smooth and cohesive dev experience in managing wallets.

## Table of Contents

- [Installation](#installation)
- [Functions](#functions)
  - [1. `hopThenExecute`](#1-hopthenexecute)
  - [2. `fetchBestRoutes`](#2-fetchBestRoutes)
  - [3. `getAllSyncTimestamps`](#3-getAllSyncTimetamps)
- [Example](#example)
- [Contributing](#contributing)

---

## Installation

To get started with the OpenCCIP SDK, you can install it via npm:

`
npm install openccip-sdk
`
or
`yarn add openccip-sdk
`

### Functions
1. ```hopThenExecute(source, destination, sourceDetails)```
This function allows you to perform a multichain transaction with multihop features. Under the hood, it'll fetch the best routes and simulate the transaction to ensure the best user and developer experience. It returns a transaction hash upon success.
  - `source`: The source chain identifier. See the [supported network](#supported-networks)
  - `destination`: The destination chain identifier. See the [supported network](#supported-networks)
  - `sourceDetails`: An object containing details about the transaction on the source chain. It should have the following structure:
```javascript
const sourceDetails = {
  contractAddr: contractAddr,
  contractABI: contractABI,
  functionName: functionName,
  args: []
};
```

2. fetchBestRoutes(FROM, TO)
This function retrieves the best possible routes to execute multichain transactions via Chainlink CCIP. See 
```javascript
const bestRoutes = await openccip.fetchBestRoutes(FROM, TO);
```

3. getAllSyncTimestamp(chain, contractAddr, contractABI)
This function retrieves all the synced timestamps between all smart contracts that **implements CRC1Syncable**
```javascript
const timestamps = await openccip.getAllSyncTimestamp('base-testnet',crc1SyncableAddr, CRC1SyncableABI );
```

## Supported Networks
The source and destination variables are used to specify the `source` and `destination` chain identifiers for multichain transactions. These identifiers determine the blockchain networks involved in the transaction. Here are the valid options for these variables:

- `sepolia-testnet`: This represents the Ethereum Sepolia Testnet blockchain network.
- `op-testnet`: This represents the Optimism Testnet blockchain network.
- `fuji-testnet`: This represents the Avalanche Fuji Testnet blockchain network.
- `polygon-testnet`: This represents the Polygon Testnet blockchain network.
- `base-testnet`: This represents Base testnet blockchain network 
- `bsc-testnet`: This represents the Binance Smart Chain Testnet blockchain network. *NOT RECOMENDED DUE TO LACK OF GOOD RPC*

### How to find the best routes
Following the principle of Dijkstra's Shortest Path Algorithm, we assigned "weight" to each possible direct lane supported by CCIP which is calculated based on each blockchain Time-To-Finality, 5-day average gas price, and Transaction per Second.
With the assigned "weight", the best route can be found. To make things easy from the front end, we build this into an SDK, so the front end only needs to pass the "from" and "to" chains. The SDK will find the best possible routes, which then will be passed to the smart contract for the cross-chain transaction to be executed.


## Example
Follow this example to use the SDK. You'll need to deploy either CRC1, CRC1Syncable, or CRC20 smart contracts. See the smart contract examples [here](https://github.com/Nava-Labs/openccip-contracts/tree/main/src/examples)

```javascript
const OpenCCIP = require('openccip-sdk');
const { createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseGoerli } = require('viem/chains');

const account = privateKeyToAccount(process.env.PK); // Replace with your private key
const walletAccount = createWalletClient({
  chain: baseGoerli, // Replace with your desired source chain configuration
  account,
  transport: http(),
});
const openccip = new OpenCCIP(walletAccount);
let contractDetails = {
      contractAddr: "0x84335647DB15CeBe5b313b6D3D883b13652115f2",
      contractABI: MarketplaceMockABI,
      functionName: "buy",
      args: [
        1,
        "0xeD7B73A82dB4D2406c0a25c55122fc317f2e6Afd", //tokenAddr
        "1" //tokenId
      ]
    }
const FROM = 'base-testnet';
const TO = 'polygon-testnet';
const txHash = await openccip.hopThenExecute(FROM, TO, sourceDetails);
const bestRoutes = await openccip.fetchBestRoutes(FROM, TO); //if you'd like to know the best routes
let timestamps = await openccip.getAllSyncTimestamps('polygon-testnet', crc1SyncableAddr, CRC1SyncableABI ); // make sure it is a Syncable contract
```

## Contributing
Contributions to the OpenCCIP SDK are welcome. If you find any issues or have suggestions for improvements, please open an issue or create a pull request on the GitHub repository.

