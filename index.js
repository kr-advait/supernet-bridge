require("dotenv").config
const ethers = require("ethers")
const axios = require("axios")
const childErc20PredicateAbi = require("./childErc20Predicate.json")
const exitHelperAbi = require("./exitHelper.json")
const l2StateSenderAbi = require("./L2StateSender.json")
const childErc20Abi = require("./childErc20.json")
const rpcUrl = "http://34.100.181.54:10002"
const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
const wallet = new ethers.Wallet(process.env.privateKey, provider)
const childErc20PredicateContractAddress = "0x0000000000000000000000000000000000001004"
const exitHelperContractAddress = "0xbc004F6F2a18E4BdE04B4622B2204037D60c045B"
const childNativeChainTokenContractAddress = "0x0000000000000000000000000000000000001010"
const childErc20PredicateContract = new ethers.Contract(childErc20PredicateContractAddress, childErc20PredicateAbi, wallet)
const childErc20PredicateContractInterface = new ethers.utils.Interface(childErc20PredicateAbi)
const l2StateSenderInterface = new ethers.utils.Interface(l2StateSenderAbi)
const childErc20Interface = new ethers.utils.Interface(childErc20Abi)


async function withdraw(userAddress, amount, childNativeChainTokenContractAddress, childErc20PredicateContract, signer) {
    try {
        
        let exitID
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

        // L2StateSynced event
        let stateSyncData = l2StateSenderInterface.parseLog({ data: receipt.logs[1].data, topics: receipt.logs[1].topics })

        exitID = parseInt(stateSyncData.args[0], 10)

        // L2ERC20Withdraw event
        let withdrawData = childErc20PredicateContractInterface.parseLog({ data: receipt.logs[2].data, topics: receipt.logs[2].topics })

        // Get proof from exitID
        const generateProof = (resolve) => {
            axios({
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
                .then(res => {
                    return resolve(res.data.result)
                })
                .catch(error => console.log('error', error))
        }

        let proof = await new Promise((resolve, reject) => {
            setTimeout(generateProof, 30000, resolve)    // wait 30 seconds for checkPointBlock
        })

        return proof

    } catch (error) {
        console.log("🚀 ~ file: bridge.js:75 ~ withdraw ~ error:", error)
        return error
    }
}

async function callExitHelper(blockNumber, leafIndex, unhashedLeaf, proof, maticSigner) {
    unhashedLeaf = "0x" + unhashedLeaf

    const exitHelperContract = new ethers.Contract(exitHelperContractAddress, exitHelperAbi, maticSigner)
    exitHelperContract.functions.exit(blockNumber, leafIndex, unhashedLeaf, proof)
        .then(response => {
            console.log("🚀 ~ file: index.js:61 ~ response:", response)

        })
        .catch(error => {
            console.log("🚀 ~ file: index.js:65 ~ error:", error)

        })
}


withdraw("0x39e215Dd69e27a7aa6909363866B8876f43C3587", 0.1, childNativeChainTokenContractAddress, childErc20PredicateContract, wallet)
    .then(proof => {
        console.log("🚀 ~ file: index.js:166 ~ proof:", proof)
        const maticRpc = "https://rpc-mumbai.maticvigil.com/"
        const maticProvider = new ethers.providers.JsonRpcProvider(maticRpc)
        const maticSigner = new ethers.Wallet(process.env.privateKey, maticProvider)
        callExitHelper(proof.Metadata.CheckpointBlock, proof.Metadata.LeafIndex, proof.Metadata.ExitEvent, proof.Data, maticSigner)
    })

// let blockNumber = 5640
// let leafIndex = 0
// let unhashedLeaf = "00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000001004000000000000000000000000a10e389541102ee29de6bcc0ea0f88fc3212326b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a07a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869000000000000000000000000783288fb03079238dd917794ec16f812eb25b39000000000000000000000000039e215dd69e27a7aa6909363866b8876f43c358700000000000000000000000039e215dd69e27a7aa6909363866b8876f43c35870000000000000000000000000000000000000000000000000de0b6b3a7640000"
// let proof = []

