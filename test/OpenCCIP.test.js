const assert = require('assert');
const OpenCCIP = require('../src/OpenCCIP')
const MarketplaceMockABI = require('./mock/MarketplaceMockABI.json')
const { createWalletClient, custom, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { polygonMumbai, mainnet, avalancheFuji, baseGoerli } = require('viem/chains');
require('dotenv').config()

describe('OpenCCIP SDK', function () {
  let openccip, account;
  const FROM = 'base-testnet'
  const TO = 'polygon-testnet'
  const contractAddr = '0xB8316EC19DF8F0FD4A8089C9dA437688B50F9b90'
  const mockInterfaceId = '0x00000000';

  before(async function (){
    account = privateKeyToAccount(process.env.PK) 
    walletAccount = createWalletClient({
      chain: baseGoerli,
      account,
      transport: http() //harusnya pake custom(window.ethereum)
    })
    openccip = new OpenCCIP(walletAccount);
  })
  
  it('should able to get best routes', async function () {
    let bestRoutes = await openccip.fetchBestRoutes(FROM, TO);
    bestRoutes = bestRoutes.data;
    assert.equal(bestRoutes[0].slug, FROM, "source is not right")
    assert.equal(bestRoutes[bestRoutes.length-1].slug, TO, "destination is not right")
  });

  it('should able to hop and execute based on route', async function () {
    this.timeout(5000)
    let contractDetails = {
      contractAddr: contractAddr,
      contractABI: MarketplaceMockABI,
      functionName: "buy",
      args: [
        1,
        "0xeD7B73A82dB4D2406c0a25c55122fc317f2e6Afd", //tokenAddr
        "1" //tokenId
      ]
    }
    // let hash = await openccip.hopThenExecute(FROM, TO, contractDetails);
    // assert.equal(hash.length, 66, "transaction failed")
  });

  it('should able to get all last sync timestamp', async function () {
    let hash = await openccip.isAllSynced( contractAddr, MarketplaceMockABI );

    assert.equal(hash.length, 66, "transaction failed")
  });
})
