const assert = require('assert');
const OpenCCIP = require('../src/OpenCCIP')
const MarketplaceMockABI = require('./mock/MarketplaceMockABI.json')
const CRC1SyncableABI = require('./mock/CRC1Syncable/CRC1SyncableABI.json')
const { createWalletClient, custom, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { polygonMumbai, mainnet, avalancheFuji, baseGoerli } = require('viem/chains');
require('dotenv').config()

describe('OpenCCIP SDK', function () {
  let openccip, account;
  const FROM = 'base-testnet'
  const TO = 'polygon-testnet'
  const mockContractAddr = '0x27bB6AA05244730B1CA31Fe71C1616A68b60A9B3'
  const crc1ContractAddr = '0x3b8a9c94c406f08Be7997136dF273FE652bc3612'
  const mockInterfaceId = '0x00000000';

  const SUPPORTED_NETWORKS = [
    // 'op-testnet',
    'fuji-testnet',
    'polygon-testnet',
    'base-testnet',
    'bsc-testnet'
  ]
  before(async function (){
    account = privateKeyToAccount(process.env.PK) 
    walletAccount = createWalletClient({
      chain: baseGoerli,
      account,
      transport: http() //harusnya pake custom(window.ethereum)
    })
    openccip = new OpenCCIP(walletAccount);
  })

  it('should able to get all supported networks', async function () {
    let supportedNetworks = openccip.getSupportedNetworks();
    assert.deepEqual(supportedNetworks, SUPPORTED_NETWORKS, "the supported network is not correct")
  });
  
  it('should able to get best routes', async function () {
    let bestRoutes = await openccip.fetchBestRoutes(FROM, TO);
    bestRoutes = bestRoutes.data;
    assert.equal(bestRoutes[0].slug, FROM, "source is not right")
    assert.equal(bestRoutes[bestRoutes.length-1].slug, TO, "destination is not right")
  });

  it('should able to hop and execute based on route', async function () {
    this.timeout(5000)
    let contractDetails = {
      mockContractAddr: mockContractAddr,
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
    let hash = await openccip.getAllSyncTimestamps('polygon-testnet', crc1ContractAddr, CRC1SyncableABI );

    console.log("ahash ", hash)
  });
})
