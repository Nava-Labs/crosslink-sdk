const { createPublicClient, http } = require('viem');
const { polygonMumbai, avalancheFuji, mainnet } = require('viem/chains');
const axios = require('axios').default;

class CrossLink {
    constructor(walletClient) {
        this.walletClient = walletClient;
        this.client = createPublicClient({ 
            chain: avalancheFuji,
            transport: http()
          })
        // this.crossLinkBaseAPI = "https://crosslink-dev-app.vercel.app"
        this.crossLinkBaseAPI = "https://crosslink-app.vercel.app"
        // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app"
        // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app/api/best-routes?_vercel_share=UOM7qyACZQxA3OjHeIGi5ODFrsI1kJ1x"   
    }

    async fetchBestRoutes(source, destination) {
        try {
            let link = `${this.crossLinkBaseAPI}/api/best-routes?from=${source}&to=${destination}`
            const response = await axios.get(link);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching routes: ${error}`);
        }
    }

    async simulate(sourceDetails, bestRoutes){
        //encode decode input data to sourceDetails.args
        //masukin chainselector doang

        let argsChainSelectors = [];
        for(let i=0;i<bestRoutes.length;i++){
            argsChainSelectors.push(BigInt(bestRoutes[i].chainSelector));
        }

        let newArgs = [argsChainSelectors, ...sourceDetails.destinationArgs];
        let details = {
            address: sourceDetails.contractAddr,
            abi: sourceDetails.contractABI,
            functionName: sourceDetails.functionName,
            args: newArgs,
            account: this.walletClient.account
        }
        try{
            let {request}  = await this.client.simulateContract(details)
            return request;
        }catch(error){
            throw new Error(`Error while simulate the contract: ${error}`);
        }
    }

    async hopThenExecute(source, destination, sourceDetails) {
        let bestRoutes;
        try {
            bestRoutes = await this.fetchBestRoutes(source, destination)
            bestRoutes = bestRoutes.data;
            console.log("sdk best routes ", bestRoutes)
        } catch (error) {
            throw new Error(`Error fetching routes: ${error}. Check whether source and destination are correct`);
        }

        try {
            let request = await this.simulate(sourceDetails, bestRoutes);
            const hash = await this.walletClient.writeContract(request)
            return hash;
        } catch (error) {
            throw new Error(`Error sending transaction: ${error.message}`);
        }


    }
}

module.exports = CrossLink;
