const { createWalletClient, custom, privateKeyToAccount } = require('viem');
const { mainnet } = require('viem/chains');

class CrossLink {
    constructor(walletClient) {
        this.rpc = rpc;
        this.walletClient = walletClient;
        this.crossLinkBaseAPI = "https://crosslink-app.vercel.app"
    }

    async fetchBestRoutes(source, destination) {
        try {
            const response = await axios.get(`${this.crossLinkBaseAPI}/api/best-routes?from=${source}&to=${destination}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching routes: ${error}`);
        }
    }

    async simulate(sourceMultihopAddr, sourceMultihopABI, functionName , inputData, value){
        //encode decode
        try{
            this.walletClient.simulateContract({
                address: sourceMultihopAddr,
                abi: sourceMultihopABI,
                functionName,
                inpu
            })
        }catch(error){
            throw new Error(`Error while simulate the contract: ${error}`);
        }

    }

    // source
    // multihopAddr: ,
    // multihopABI: ,
    // functionName: ,
    // args: [],
    // value

    // destination
    // multihopAddr: ,
    // multihopABI: ,
    // functionName: ,
    // args: [],
    // value

    async hopThenExecute(source, destination, sourceDetails, destinationDetails) {
        let bestRoutes;
        try {
            bestRoutes = await this.fetchBestRoutes(source, destination)
        } catch (error) {
            throw new Error(`Error fetching routes: ${error}. Check whether source and destination are correct`);
        }

        try {
            await simulate(source);
            // const transactionHash = await this.walletClient.sendTransaction({
            //     account: this.account,
            //     to: to,
            //     value: value, // Value in wei
            //     data: this.inputData,
            // });
            // return transactionHash;
        } catch (error) {
            throw new Error(`Error sending transaction: ${error.message}`);
        }
    }

    // Additional methods...
}

module.exports = CrossLink;
