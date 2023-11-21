const { createWalletClient, custom, privateKeyToAccount } = require('viem');
const { mainnet } = require('viem/chains');
const axios = require('axios').default;

class CrossLink {
    constructor(walletClient) {
        this.walletClient = walletClient;
        // this.crossLinkBaseAPI = "https://crosslink-dev-app.vercel.app"
        this.crossLinkBaseAPI = "https://crosslink-app.vercel.app"
        // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app"
        // this.crossLinkBaseAPI = "https://crosslink-app-git-feat-best-routes-nava-labs.vercel.app/api/best-routes?_vercel_share=UOM7qyACZQxA3OjHeIGi5ODFrsI1kJ1x"   
    }

    async fetchBestRoutes(source, destination) {
        try {
            let link = `${this.crossLinkBaseAPI}/api/best-routes?_vercel_share=clOyS5wLuWIHUgtFGAaM6ebSsEjRApho&from=${source}&to=${destination}`
            console.log("link ",link)
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
            argsRoutes.push(bestRoutes[i].chainSelector);
        }

        let newArgs = [argsChainSelectors, ...sourceDetails.args];
        try{
            this.walletClient.simulateContract({
                address: sourceDetails.contactAddr,
                abi: sourceDetails.contractABI,
                functionName: sourceDetails.functionName,
                args: newArgs
            })
        }catch(error){
            throw new Error(`Error while simulate the contract: ${error}`);
        }
    }

    // source
    // contactAddr: ,
    // contactABI: ,
    // functionName: ,
    // args: [],
    // value

    //op: 
    //polygon : 
    //marketplaceAddr: 
    //marketplaceABI:
    //args: 
    //- id: 
    //- tokenAddr: 
    //value

    async hopThenExecute(source, destination, sourceDetails) {
        let bestRoutes;
        try {
            bestRoutes = await this.fetchBestRoutes(source, destination)
        } catch (error) {
            throw new Error(`Error fetching routes: ${error}. Check whether source and destination are correct`);
        }

        try {
            await simulate(sourceDetails, bestRoutes);
            const transactionHash = await this.walletClient.sendTransaction({
                account: this.account,
                to: to,
                value: value, // Value in wei
                data: this.inputData,
            });
            return transactionHash;
        } catch (error) {
            throw new Error(`Error sending transaction: ${error.message}`);
        }


    }

    // Additional methods...
}

module.exports = CrossLink;
