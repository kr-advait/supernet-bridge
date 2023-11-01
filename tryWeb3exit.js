require("dotenv").config()
const Web3 = require("web3")
const maticRpc = "https://polygon-mumbai.g.alchemy.com/v2/2cE18kiOcFP1Lp5hfPMesvM5K9WfjUY-"
const provider = new Web3.providers.HttpProvider(maticRpc)
const web3 = new Web3(provider)
const exitHelperContractAddress = "0xbc004F6F2a18E4BdE04B4622B2204037D60c045B"
const exitHelperAbi = require("./exitHelper.json")
const HDWalletProvider = require("@truffle/hdwallet-provider")
const walletAddress = process.env.ethAddress
const privateKey = process.env.privateKey
const Web3Clients = {
    child: new Web3(new HDWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: maticRpc,
        numberOfAddresses: 64
    }))
}

const exitHelperContract = new web3.eth.Contract(exitHelperAbi, exitHelperContractAddress)

async function callExitHelper(blockNumber, leafIndex, unhashedLeaf, proof) {

    return new Promise((resolve, reject) => {
        unhashedLeaf = "0x" + unhashedLeaf
    
        const signature = exitHelperContract.methods.exit(blockNumber, leafIndex, unhashedLeaf, proof).encodeABI()
    
        Web3Clients.child.eth.sendTransaction({
            from : walletAddress,
            to : exitHelperContractAddress,
            data: signature
        })
        .once('transactionHash', async (txHash) => {
                console.log("🚀 ~ file: tryWeb3exit.js:41 ~ .once ~ txHash:", txHash)
                resolve(txHash)
        })
        .once('receipt', async (receipt) => {
            console.log("🚀 ~ file: tryWeb3exit.js:39 ~ .once ~ receipt:", receipt)
        })
        .on('error', async (err) => {
            console.log("🚀 ~ file: tryWeb3exit.js:42 ~ .on ~ err:", err)
            
        })
    })

}

let proof = {
    "Data": [],
    "Metadata": {
        "CheckpointBlock": 7240,
        "ExitEvent": "000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000001004000000000000000000000000a10e389541102ee29de6bcc0ea0f88fc3212326b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a07a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000783288fb03079238dd917794ec16f812eb25b39000000000000000000000000039e215dd69e27a7aa6909363866b8876f43c358700000000000000000000000039e215dd69e27a7aa6909363866b8876f43c3587000000000000000000000000000000000000000000000000016345785d8a0000",
        "LeafIndex": 0
    }
}

callExitHelper(proof.Metadata.CheckpointBlock, proof.Metadata.LeafIndex, proof.Metadata.ExitEvent, proof.Data)
.then(txHash => {
    console.log("🚀 ~ file: tryWeb3exit.js:59 ~ txHash:", txHash)
    
})