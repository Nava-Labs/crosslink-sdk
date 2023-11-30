const { createPublicClient, http } = require('viem')
const {
  polygonMumbai,
  avalancheFuji,
  arbitrumGoerli,
  sepolia,
  baseGoerli,
  optimismGoerli,
  optimismSepolia,
  bscTestnet
} = require('viem/chains')
const axios = require('axios').default

class OpenCCIP {
  SUPPORTED_NETWORKS = [
    // 'op-testnet',
    'fuji-testnet',
    'polygon-testnet',
    'base-testnet',
    // 'bsc-testnet'
  ]
  CHAIN_METADATA = {
    // 'op-testnet': {
    //   name: 'OP Testnet',
    //   rpc: optimismGoerli,
    //   routerAddr: '0xEB52E9Ae4A9Fb37172978642d4C141ef53876f26',
    //   chainSelector: '2664363617261496610',
    //   transport: http("https://optimism-goerli.blockpi.network/v1/rpc/public")
    // },
    'fuji-testnet': {
      name: 'Fuji Testnet',
      rpc: avalancheFuji,
      routerAddr: '0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8',
      chainSelector: '14767482510784806043',
      transport: http()
    },
    'sepolia-testnet': {
      name: 'Sepolia Testnet',
      rpc: sepolia,
      routerAddr: '0xD0daae2231E9CB96b94C8512223533293C3693Bf',
      chainSelector: '16015286601757825753',
      transport: http()
    },
    'polygon-testnet': {
      name: 'Polygon Testnet',
      rpc: polygonMumbai,
      routerAddr: '0x70499c328e1E2a3c41108bd3730F6670a44595D1',
      chainSelector: '12532609583862916517',
      transport: http()
    },
    'arbitrum-testnet': {
      name: 'Arbitrum Testnet',
      rpc: arbitrumGoerli,
      routerAddr: '0x88E492127709447A5ABEFdaB8788a15B4567589E',
      chainSelector: '6101244977088475029',
      transport: http()
    },
    'base-testnet': {
      name: 'Base Testnet',
      rpc: baseGoerli,
      routerAddr: '0xa8c0c11bf64af62cdca6f93d3769b88bdd7cb93d',
      chainSelector: '5790810961207155433',
      transport: http()
    },
    // 'bsc-testnet': {
    //   name: 'BSC Testnet',
    //   rpc: bscTestnet,
    //   routerAddr: '0x9527e2d01a3064ef6b50c1da1c0cc523803bcff2',
    //   chainSelector: '13264668187771770619',
    //   transport: http("https://bsc-testnet.public.blastapi.io")
    // }
  }

  constructor (walletClient) {
    this.walletClient = walletClient
    this.client = createPublicClient({
      chain: baseGoerli,
      transport: http()
    })
    this.openCCIPBaseAPI = 'https://openccip-app.vercel.app'
  }

  async fetchBestRoutes (source, destination) {
    try {
      let link = `${this.openCCIPBaseAPI}/api/best-routes?from=${source}&to=${destination}`
      const response = await axios.get(link)
      return response.data
    } catch (error) {
      throw new Error(`Error fetching routes: ${error}`)
    }
  }

  async simulate (contractDetails, bestRoutes) {
    let argsChainSelectors = []
    for (let i = 0; i < bestRoutes.length; i++) {
      argsChainSelectors.push(BigInt(bestRoutes[i].chainSelector))
    }

    let newArgs = [argsChainSelectors, ...contractDetails.args]
    let details = {
      address: contractDetails.contractAddr,
      abi: contractDetails.contractABI,
      functionName: contractDetails.functionName,
      args: newArgs,
      account: this.walletClient.account
    }
    try {
      let { request } = await this.client.simulateContract(details)
      return request
    } catch (error) {
      throw new Error(`Error while simulate the contract: ${error}`)
    }
  }

  async hopThenExecute (source, destination, contractDetails) {
    if (!this.SUPPORTED_NETWORKS.includes(source, destination)) {
      throw new Error(
        'the source or destination currently is not supported. Check getSupportedNetworks()'
      )
    }
    let bestRoutes
    try {
      bestRoutes = await this.fetchBestRoutes(source, destination)
      bestRoutes = bestRoutes.data
    } catch (error) {
      throw new Error(
        `Error fetching routes: ${error}. Check whether source and destination are correct`
      )
    }

    try {
      let request = await this.simulate(contractDetails, bestRoutes)
      const hash = await this.walletClient.writeContract(request)
      return hash
    } catch (error) {
      throw new Error(`Error sending transaction: ${error.message}`)
    }
  }

  getSupportedNetworks () {
    return this.SUPPORTED_NETWORKS
  }

  setWallet (walletClient) {
    this.walletClient = walletClient
  }

  async supportsCRC1Syncable (chain, contractAddr, contractABI) {
    let rpc = this.getRPC(chain)
    let client = createPublicClient({
      chain: rpc,
      transport: http()
    })
    let res = await client.readContract({
      address: contractAddr,
      abi: contractABI,
      functionName: 'supportsExtInterface', //supportsExtInterface
      args: ['0x44617461']
    })
    if (!res) throw new Error('The contract is not implement CRC1Syncable')
    return res
  }

  getRPC (chain) {
    try{
        return this.CHAIN_METADATA[chain].rpc
    }catch(err){
        throw new Error("the chain is not supported.", err)
    }
  }

  async getAllSyncTimestamps (chain, contractAddr, contractABI) {
    try {
      let rpc = this.getRPC(chain)
      let client = createPublicClient({
        chain: rpc,
        transport: http()
      })
      let useCRC1Syncable = await this.supportsCRC1Syncable(
        chain,
        contractAddr,
        contractABI
      )
      if (!useCRC1Syncable) { //check if the CRC1Syncable
        throw new Error(`the contract is not implement CRC1 Syncable`)
      }
      let trustedSenders = await client.readContract({ //get all trusted senders
        address: contractAddr,
        abi: contractABI,
        functionName: 'getAllNetworksConfig',
        args: []
      })
      let promises = []
      let latestSyncTimestamps = []

      for (let i = 0; i < trustedSenders.length; i++) {
        let found = false;
        let tempMetadata
        for (const chainName in this.CHAIN_METADATA) { //check the trusted sender with current chain metadata
          const metadata = this.CHAIN_METADATA[chainName]
          if (
            trustedSenders[i].chainIdSelector.toString() ==
            metadata.chainSelector 
          ) { //if we detect the metadata, save it
            tempMetadata = metadata
            found = true;
            break
          }
        }
        if (found == false ) continue; //the blockchain is not supported yet. Probably op due to lack of good rpcs

        let publicClient = createPublicClient({ //create public client based on the rpc
          chain: tempMetadata.rpc,
          transport: tempMetadata.transport
        })
        let crossChainAppAddr = trustedSenders[i].crossChainApp
        tempMetadata.contractAddr = crossChainAppAddr
        let contractCall = publicClient.readContract({
          address: crossChainAppAddr,
          abi: contractABI,
          functionName: 'latestSyncTimestamp'
        })
        promises.push(contractCall)
        latestSyncTimestamps.push(tempMetadata)
      }
      let data = await Promise.all(promises)
      for (let i = 0; i < data.length; i++) {
        latestSyncTimestamps[i].latestSyncTimestamp = data[i]
      }
      return latestSyncTimestamps
    } catch (error) {
      throw new Error(
        `Error: ${error.message}`
      )
    }
  }
}

module.exports = OpenCCIP