# OpenCCIP SDK README

The OpenCCIP SDK is a powerful tool for developers to implement multichain transactions with multihop features supported by Chainlink CCIP. It is also compatible with Viem Wallet.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [SDK Functions](#sdk-functions)
  - [1. `hopThenExecute`](#1-hopthenexecute)
  - [2. `fetchBestRoutes`](#2-fetchBestRoutes)
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
1. hopThenExecute(source, destination, sourceDetails)
This function allows you to perform a multichain transaction with multihop features. It returns a transaction hash upon success.
  - `source`: The source chain identifier. It can be one of the following: 'op-testnet', 'polygon-testnet', 'base-testnet', or 'bsc-testnet'.
  - `destination`: The destination chain identifier. It can be one of the following: 'op-testnet', 'polygon-testnet', 'base-testnet', or 'bsc-testnet'.
  - `sourceDetails`: An object containing details about the transaction on the source chain. It should have the following structure:
```javascript
const sourceDetails = {
  contractAddr: contractAddr,
  contractABI: contractABI,
  functionName: functionName,
  args: [] // arguments/parameters will pass to the destination contract
};
```



2. fetchBestRoutes(FROM, TO)
This function retrieves the best possible routes for a transaction.
```javascript
const bestRoutes = await openccip.fetchBestRoutes(FROM, TO);
```

#### Source and Destination Chain Identifiers
The source and destination variables are used to specify the source and destination chain identifiers for multichain transactions. These identifiers determine the blockchain networks involved in the transaction. Here are the valid options for these variables:

- `op-testnet`: This represents the Opera Testnet blockchain network.
- `fuji-testnet`: This represents the Polygon Testnet blockchain network.
- `polygon-testnet`: This represents the Polygon Testnet blockchain network.
- `base-testnet`: This represents Base testnet blockchain network 
- `bsc-testnet`: This represents the Binance Smart Chain Testnet blockchain network



### Example
Follow this example to use the SDK

```javascript
const OpenCCIP = require('openccip-sdk');
const { createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseGoerli } = require('viem/chains');

const account = privateKeyToAccount(process.env.PK); // Replace with your private key
const walletAccount = createWalletClient({
  chain: baseGoerli, // Replace with your desired chain configuration
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
```

## Contributing
Contributions to the OpenCCIP SDK are welcome. If you find any issues or have suggestions for improvements, please open an issue or create a pull request on the GitHub repository.

