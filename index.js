const ethers = require("ethers")


async function approve(senderWallet, rootChainTokenContractAddress, rootChainTokenInterface, rootErc20PredicateContractAddress) {
    const amount = ethers.utils.parseEther(0xfffffffffffffff.toString())
    // approve
    let approveSignature = rootChainTokenInterface.encodeFunctionData("approve", [rootErc20PredicateContractAddress, amount])

    transaction = {
        from: senderWallet.address,
        to: rootChainTokenContractAddress,
        data: approveSignature,
        gasLimit: 250000
    }

    txHash = await senderWallet.sendTransaction(transaction)
        .then(txDetails => {
            console.log()
            console.log(txDetails)
            return txDetails.hash
        })
        .catch((err) => {
            throw new Error(`Error in sendTransaction : ${JSON.stringify(err)}`)
        })

    await senderWallet.provider.getTransaction(txHash)
        .then(console.log)
}


async function deposit(senderWallet, userAddress, amount, rootChainTokenContractAddress, rootErc20PredicateContractAddress, rootErc20PredicateInterface) {
    let txHash;
    let transaction;

    amount = ethers.utils.parseEther(String(amount))

    // deposit
    let depositSignature = rootErc20PredicateInterface.encodeFunctionData("depositTo", [rootChainTokenContractAddress, userAddress, amount])

    transaction = {
        from: senderWallet.address,
        to: rootErc20PredicateContractAddress,
        data: depositSignature,
        gasLimit: 250000
    }

    txHash = await senderWallet.sendTransaction(transaction)
        .then(txDetails => {
            console.log()
            console.log(txDetails)
            return txDetails.hash
        })
        .catch((err) => {
            throw new Error(`Error in sendTransaction : ${JSON.stringify(err)}`)
        })

    await senderWallet.provider.getTransaction(txHash)
        .then(console.log)

}


module.exports = {
    approve,
    deposit
}