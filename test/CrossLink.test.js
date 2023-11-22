const assert = require('assert');
const CrossLink = require('../src/CrossLink')
const MarketplaceMockABI = require('./mock/MarketplaceMockABI.json')
const { createWalletClient, custom, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { polygonMumbai, mainnet, avalancheFuji } = require('viem/chains');
require('dotenv').config()


describe('CrossLink SDK', function () {
  let crosslink, account, client;
  const FROM = 'polygon-testnet'
  const TO = 'bsc-testnet'
  before(async function (){
    account = privateKeyToAccount(process.env.PK) 
    walletAccount = createWalletClient({
      chain: polygonMumbai,
      account,
      transport: http() //harusnya pake custom(window.ethereum)
    })
    crosslink = new CrossLink(walletAccount);
  })
  
  it('should able to get best routes', async function () {
    let bestRoutes = await crosslink.fetchBestRoutes(FROM, TO);
    bestRoutes = bestRoutes.data;
    assert.equal(bestRoutes[0].slug, FROM, "source is not right")
    assert.equal(bestRoutes[bestRoutes.length-1].slug, TO, "destination is not right")
  });

  it('should able to hop and execute based on route', async function () {
    this.timeout(5000)
    let contractDetails = {
      contractAddr: "0xd563E792dC7799ec0839209B2485F2492d3257bc",
      contractABI: MarketplaceMockABI,
      functionName: "buy",
      destinationArgs: [
        "0xeD7B73A82dB4D2406c0a25c55122fc317f2e6Afd", //tokenAddr
        "1" //tokenId
      ]
    }
    let hash = await crosslink.hopThenExecute(FROM, TO, contractDetails);

    assert.equal(hash.length, 66, "transaction failed")
  });
})
