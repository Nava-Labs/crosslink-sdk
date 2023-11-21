const assert = require('assert');
const CrossLink = require('../src/CrossLink')
const { createWalletClient, custom, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { polygonMumbai } = require('viem/chains');
require('dotenv').config()


describe('CrossLink SDK', function () {
  let crosslink;
  before(async function (){
    const account = privateKeyToAccount(process.env.PK) 
    const client = createWalletClient({
      chain: polygonMumbai,
      account,
      transport: http() //harusnya pake custom(window.ethereum)
    })
    // console.log("wallet client ", client)
    let crosslink = new CrossLink(client);
    console.log( "Awawawa ", await crosslink.fetchBestRoutes('op-testnet', 'polygon-testnet') )
  })

  it('should complete this test', function (done) {
    console.log("yoo")
    return new Promise(function (resolve) {
      assert.ok(true);
      resolve();
    }).then(done);
  });
})
