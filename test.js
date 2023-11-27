const {OpenCCIP} = require('openccip-sdk');
const { polygonMumbai, mainnet, avalancheFuji, baseGoerli } = require('viem/chains');
const { createWalletClient, custom, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config()

let account = privateKeyToAccount(process.env.PK) 
let walletAccount = createWalletClient({
  chain: baseGoerli,
  account,
  transport: http() //harusnya pake custom(window.ethereum)
})
openccip = new OpenCCIP(walletAccount);

openccip.fetchBestRoutes("base-testnet", "polygon-testnet").then(console.log);



