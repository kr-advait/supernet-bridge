const ethers = require("ethers")
const axios = require("axios")
const childErc20PredicateAbi = require("./childErc20Predicate.json")
const rootErc20PredicateAbi = require("./rootErc20Predicate.json")
const exitHelperAbi = require("./exitHelper.json")
const l2StateSenderAbi = require("./L2StateSender.json")
const childErc20Abi = require("./childErc20.json")
const checkpointManagerAbi = require("./checkpointManager.json")
const rpcUrl = "http://34.100.181.54:10002"
const maticRpc = "https://rpc-mumbai.maticvigil.com/"
const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
const wallet = new ethers.Wallet("ef0dba5d515c0ba58fe1c940826cd49397d851b6d2e74f959ae5cc5b80b8277c", provider)
const maticProvider = new ethers.providers.JsonRpcProvider(maticRpc) 
console.log("🚀 ~ file: index.js:16 ~ wallet:", wallet)

// wallet.provider.JsonRpcProvider = maticProvider.JsonRpcProvider 
console.log("🚀 ~ file: index.js:16 ~ wallet:", wallet)

// console.log("🚀 ~ file: index.js:12 ~ wallet:", wallet)
const childErc20PredicateContractAddress = "0x0000000000000000000000000000000000001004"
const rootErc20PredicateContractAddress = "0x1d5A76934421e9e4d2a74C160743fd0E64D5E1eC"
const exitHelperContractAddress = "0x3991d221dE53363F81bba609EA7608A5ED156019"
const childErc20PredicateContract = new ethers.Contract(childErc20PredicateContractAddress, childErc20PredicateAbi, wallet)
const rootErc20PredicateContract = new ethers.Contract(rootErc20PredicateContractAddress, rootErc20PredicateAbi, wallet)

// console.log("🚀 ~ file: index.js:19 ~ exitHelperContract:", exitHelperContract.provider.connection.url)
// console.log("🚀 ~ file: index.js:19 ~ exitHelperContract:", exitHelperContract.signer.provider.connection.url)
const rootErc20PredicateContractInterface = new ethers.utils.Interface(rootErc20PredicateAbi)
const childErc20PredicateContractInterface = new ethers.utils.Interface(childErc20PredicateAbi)
const l2StateSenderInterface = new ethers.utils.Interface(l2StateSenderAbi)
const checkpointManagerInterface = new ethers.utils.Interface(checkpointManagerAbi)
const childErc20Interface = new ethers.utils.Interface(childErc20Abi)

let exitID
// let unhashedLeaf


// provider.getTransactionReceipt("0x721486b57168bb0ae19be83e663fe1ad5bc7b152f3a25a078357bb96623d3b28")
//     .then(async response => {

//         // Transfer event
//         let transferData = childErc20Interface.parseLog({ data: response.logs[0].data, topics: response.logs[0].topics })
//         // console.log("🚀 ~ file: index.js:28 ~ transferData:", transferData)


//         // L2StateSynced event
//         let stateSyncData = l2StateSenderInterface.parseLog({ data: response.logs[1].data, topics: response.logs[1].topics })
//         exitID = parseInt(stateSyncData.args[0], 10)
//         // console.log("🚀 ~ file: index.js:36 ~ exitId:", exitID)
//         // console.log("🚀 ~ file: index.js:33 ~ stateSyncData:", stateSyncData)


//         // L2ERC20Withdraw event
//         let withdrawData = childErc20PredicateContractInterface.parseLog({ data: response.logs[2].data, topics: response.logs[2].topics })
//         // console.log("🚀 ~ file: index.js:38 ~ withdrawData:", withdrawData)

//         // Get proof from exitID
//         const proof = await axios({
//             method: "POST",
//             url: rpcUrl,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             data: JSON.stringify({
//                 "method": "bridge_generateExitProof",
//                 "params": [exitID],
//                 "id": 1
//             })
//         })
//             .then(res => res.data.result)
//             .catch(error => console.log('error', error))
//         // console.log("🚀 ~ file: index.js:56 ~ proof:",  proof.Metadata.ExitEvent.toString("utf-8"))

//     })



async function withdraw(userAddress, amount, childNativeChainTokenContractAddress, childErc20PredicateContract, signer) {
    try {

        let txHash;
        let transaction;

        amount = ethers.utils.parseEther(String(amount))

        // withdraw
        let withdrawSignature = childErc20PredicateContract.interface.encodeFunctionData("withdrawTo", [childNativeChainTokenContractAddress, userAddress, amount])

        transaction = {
            from: signer.address,
            to: childErc20PredicateContract.address,
            data: withdrawSignature,
            gasLimit: 250000
        }

        txHash = await signer.sendTransaction(transaction)
            .then(async txDetails => {
                console.log()
                console.log(txDetails)
                await txDetails.wait()
                return txDetails.hash
            })
            .catch((err) => {
                throw new Error(`Error in sendTransaction : ${JSON.stringify(err)}`)
            })

        let receipt = await provider.getTransactionReceipt(txHash)


        // Transfer event
        let transferData = childErc20Interface.parseLog({ data: receipt.logs[0].data, topics: receipt.logs[0].topics })
        // console.log("🚀 ~ file: index.js:28 ~ transferData:", transferData)


        // L2StateSynced event
        let stateSyncData = l2StateSenderInterface.parseLog({ data: receipt.logs[1].data, topics: receipt.logs[1].topics })
        exitID = parseInt(stateSyncData.args[0], 10)
        // console.log("🚀 ~ file: index.js:36 ~ exitId:", exitID)
        // console.log("🚀 ~ file: index.js:33 ~ stateSyncData:", stateSyncData)


        // L2ERC20Withdraw event
        let withdrawData = childErc20PredicateContractInterface.parseLog({ data: receipt.logs[2].data, topics: receipt.logs[2].topics })
        // console.log("🚀 ~ file: index.js:38 ~ withdrawData:", withdrawData)

        // Get proof from exitID
        const proof = await axios({
            method: "POST",
            url: rpcUrl,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "method": "bridge_generateExitProof",
                "params": [exitID],
                "id": exitID
            })
        })
            .then(res => res.data.result)
            .catch(error => console.log('error', error))
        //         .then(response => {
        //             let data = l2StateSenderInterface.parseLog({data : response.logs[1].data, topics : response.logs[1].topics})
        // console.log("🚀 ~ file: index.js:68 ~ response:", data)
        //         })

        // return txHash

        // const response = await rootErc20PredicateContract.functions.exitHelper()
        // console.log("🚀 ~ file: index.js:50 ~ withdraw ~ response:", response)

    } catch (error) {
        console.log("🚀 ~ file: bridge.js:75 ~ withdraw ~ error:", error)
        return error
    }
}

async function callExitHelper(blockNumber, leafIndex, unhashedLeaf, proof, signer) {
    unhashedLeaf = "0x" + unhashedLeaf
    const maticRpc = "https://rpc-mumbai.maticvigil.com/"
    const maticProvider = new ethers.providers.JsonRpcProvider(maticRpc) 
    // const maticSigner = new ethers.Wallet("ef0dba5d515c0ba58fe1c940826cd49397d851b6d2e74f959ae5cc5b80b8277c", maticProvider)
    signer.provider = maticProvider
    console.log("🚀 ~ file: index.js:156 ~ callExitHelper ~ maticProvider:", maticProvider)
    console.log("🚀 ~ file: index.js:156 ~ callExitHelper ~ signer:", signer)
    const exitHelperContract = new ethers.Contract(exitHelperContractAddress, exitHelperAbi, signer)
    // exitHelperContract.provider.connection.url = maticRpc
    // exitHelperContract.signer.provider.connection.url = maticRpc
    // exitHelperContract.functions.exit(blockNumber, leafIndex, unhashedLeaf, proof)
    //     .then(response => {
    //         console.log("🚀 ~ file: index.js:61 ~ response:", response)

    //     })
    //     .catch(error => {
    //         console.log("🚀 ~ file: index.js:65 ~ error:", error)

    //     })
}

// exitHelperContract.on("ExitProcessed", (data) => {
//     console.log("🚀 ~ file: index.js:62 ~ data:", data)
// })

// withdraw("0x39e215Dd69e27a7aa6909363866B8876f43C3587", 0.1, "0x0000000000000000000000000000000000001010", childErc20PredicateContract, wallet)

// let unhashedLeaf = {
//     withdrawSignature : "",
//     rootToken: '0x783288fb03079238dd917794ec16F812eB25B390',
//     childToken: '0x0000000000000000000000000000000000001010',
//     withdrawer: '0x39e215Dd69e27a7aa6909363866B8876f43C3587',
//     receiver: '0x39e215Dd69e27a7aa6909363866B8876f43C3587',
//     amount: 0.1
// }


let blockNumber = 40800
let leafIndex = 0
let unhashedLeaf = "000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000010040000000000000000000000001d5a76934421e9e4d2a74c160743fd0e64d5e1ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000010040000000000000000000000001d5a76934421e9e4d2a74c160743fd0e64d5e1ec000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a07a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000783288fb03079238dd917794ec16f812eb25b39000000000000000000000000039e215dd69e27a7aa6909363866b8876f43c358700000000000000000000000039e215dd69e27a7aa6909363866b8876f43c3587000000000000000000000000000000000000000000000000016345785d8a00008000000000000000000000000000000000000000000000000000000000000000a07a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000783288fb03079238dd917794ec16f812eb25b39000000000000000000000000039e215dd69e27a7aa6909363866b8876f43c358700000000000000000000000039e215dd69e27a7aa6909363866b8876f43c3587000000000000000000000000000000000000000000000000016345785d8a0000"
// let unhashedLeaf = JSON.stringify({
//     id: exitID,
//     sender: '0x0000000000000000000000000000000000001004',
//     receiver: '0x1d5A76934421e9e4d2a74C160743fd0E64D5E1eC',
//     data: '0x7a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000783288fb03079238dd917794ec16f812eb25b39000000000000000000000000039e215dd69e27a7aa6909363866b8876f43c358700000000000000000000000039e215dd69e27a7aa6909363866b8876f43c3587000000000000000000000000000000000000000000000000016345785d8a0000'
// })
let proof = []

callExitHelper(blockNumber, leafIndex, unhashedLeaf, proof, wallet)


// console.log(`${rootErc20PredicateContract.functions.exitHelper}`)

// provider.getTransactionReceipt("0xebf87ddc5dd5c0944c252d58279163081e374476dd23fdc0b313b0b34e7ca358")
//     .then(console.log)