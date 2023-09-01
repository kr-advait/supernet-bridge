export interface bridge {
    /**
   * Approve rootERC20PredicateContractAddress on rootChainTokenAddress
   *
   * @param senderWallet The wallet instance of sender from which transaction will take place.
   * @param rootChainTokenContractAddress The contract address of ERC-20 token on root chain (i.e; polygon)
   * @param rootChainTokenInterface The contract interface creadted using contract abi and provider.
   * @param rootERC20PredicateContractAddress The contract address of root ERC-20 predicate address obtained from genesis.json
   */
  approve (senderWallet : object, rootChainTokenContractAddress : string, rootChainTokenInterface : object, rootERC20PredicateContractAddress : string): void;

    /**
   * Deposit from root chain to child chain (i.e; Polygon to Supernet)
   *
   * @param senderWallet The wallet instance of sender from which transaction will take place.
   * @param userAddress The wallet address of user to which we want deposit the ERC-20 token on supernet.
   * @param amount The amount (in integer) which needs to be deposited on supernet.
   * @param rootChainTokenContractAddress The contract address of ERC-20 token on root chain (i.e; polygon)
   * @param rootERC20PredicateContractAddress The contract address of root ERC-20 predicate address obtained from genesis.json
   * @param rootErc20PredicateInterface The contract interface creadted using contract abi and provider.
   */
  deposit (senderWallet : object, userAddress : string, amount : number, rootChainTokenContractAddress : string, rootERC20PredicateContractAddress : string, rootErc20PredicateInterface: object): void;

}