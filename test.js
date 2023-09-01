require('dotenv').config()
const ethers = require("ethers")
const bridge = require("./index")
const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/2cE18kiOcFP1Lp5hfPMesvM5K9WfjUY-')
const rootErc20PredicateAbi = require("./rootErc20Predicate.json")
const rootChainTokenAbi = require("./ChainTokenMatic.json")
const rootErc20PredicateContractAddress = "0xA8C90Fc6C38d4Ec2225deFf93B68eD77aDE391c6"
const senderWallet = new ethers.Wallet(process.env.privateKey, provider)
const rootErc20PredicateInterface = new ethers.utils.Interface(rootErc20PredicateAbi)
const rootChainTokenContractAddress = "0x783288fb03079238dd917794ec16F812eB25B390"
const rootChainTokenInterface = new ethers.utils.Interface(rootChainTokenAbi)
const userAddress = "0xE1f2597b5E1e05f303a1f8C29cDBA0Eb29d9eE4e"
const amount = 10

async function testDeposit() {

    await bridge.approve (
        senderWallet,
        rootChainTokenContractAddress,
        rootChainTokenInterface,
        rootErc20PredicateContractAddress
    )
    
    await bridge.deposit (
        senderWallet, 
        userAddress, 
        amount, 
        rootChainTokenContractAddress,  
        rootErc20PredicateContractAddress,
        rootErc20PredicateInterface
    )

}

testDeposit()