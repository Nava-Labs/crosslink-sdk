const { createPublicClient, http } = require('viem')
const {
  polygonMumbai,
  avalancheFuji,
  arbitrumGoerli,
  sepolia,
  baseGoerli,
  optimismGoerli,
  bscTestnet
} = require('viem/chains')
const axios = require('axios').default

class OpenCCIP {
  SUPPORTED_NETWORKS = [
    'op-testnet',
    'fuji-testnet',
    'polygon-testnet',
    'base-testnet',
    'bsc-testnet'
  ]
  CHAIN_METADATA = {
    'op-testnet': {
      name: 'OP Testnet',
      rpc: optimismGoerli,
      routerAddr: '0xEB52E9Ae4A9Fb37172978642d4C141ef53876f26',
      chainSelector: '2664363617261496610'
    },
    'fuji-testnet': {
      name: 'Fuji Testnet',
      rpc: avalancheFuji,
      routerAddr: '0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8',
      chainSelector: '14767482510784806043'
    },
    'sepolia-testnet': {
      name: 'Sepolia Testnet',
      rpc: sepolia,
      routerAddr: '0xD0daae2231E9CB96b94C8512223533293C3693Bf',
      chainSelector: '16015286601757825753'
    },
    'polygon-testnet': {
      name: 'Polygon Testnet',
      rpc: polygonMumbai,
      routerAddr: '0x70499c328e1E2a3c41108bd3730F6670a44595D1',
      chainSelector: '12532609583862916517'
    },
    'arbitrum-testnet': {
      name: 'Arbitrum Testnet',
      rpc: arbitrumGoerli,
      routerAddr: '0x88E492127709447A5ABEFdaB8788a15B4567589E',
      chainSelector: '6101244977088475029'
    },
    'base-testnet': {
      name: 'Base Testnet',
      rpc: baseGoerli,
      routerAddr: '0xa8c0c11bf64af62cdca6f93d3769b88bdd7cb93d',
      chainSelector: '5790810961207155433'
    },
    'bsc-testnet': {
      name: 'BSC Testnet',
      rpc: bscTestnet,
      routerAddr: '0x9527e2d01a3064ef6b50c1da1c0cc523803bcff2',
      chainSelector: '13264668187771770619'
    }
  }

  constructor (walletClient) {
    this.walletClient = walletClient
    this.client = createPublicClient({
      chain: baseGoerli,
      transport: http()
    })
    // this.crossLinkBaseAPI = "https://crosslink-dev-app.vercel.app"
    this.openCCIPBaseAPI = 'https://openccip-app.vercel.app'
    // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app"
    // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app/api/best-routes?_vercel_share=UOM7qyACZQxA3OjHeIGi5ODFrsI1kJ1x"
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
    if (!res) throw new Error('The contract is not implement OpenCCIPSyncLayer')
    return res
  }

  getRPC (chain) {
    return this.CHAIN_METADATA[chain].rpc
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
      if (!useCRC1Syncable) {
        throw new Error(`the contract is not implement CRC1 Syncable`)
      }
      let trustedSenders = await client.readContract({
        address: contractAddr,
        abi: contractABI,
        functionName: 'getAllNetworksConfig', //supportsExtInterface
        args: []
      })
      let promises = []
      let latestSyncTimestamps = []
      for (let i = 0; i < trustedSenders.length; i++) {
        let rpc
        let tempMetadata
        for (const chainName in this.CHAIN_METADATA) {
          const metadata = this.CHAIN_METADATA[chainName]
          if (
            trustedSenders[i].chainIdSelector.toString() ==
            metadata.chainSelector
          ) {
            tempMetadata = metadata
            break
          }
        }
        let publicClient = createPublicClient({
          chain: tempMetadata.rpc,
          transport: http()
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
        `The provided contract is not extending CRC1 Syncable ${error.message}`
      )
    }
  }
}

module.exports = OpenCCIP
