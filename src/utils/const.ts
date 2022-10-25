export const getAddresses = (
  network: string,
  storeAddress: string,
  contentAddress: string
) => {
  const EtherscanBase = (() => {
    if (network == "rinkeby") {
      return "https://rinkeby.etherscan.io/address";
    } else if (network == "goerli") {
      return "https://goerli.etherscan.io/address";
    } else if (network == "matic") {
      return "https://polygonscan.com/address";
    }
    return "https://etherscan.io/address";
  })();
  const OpenSeaBase = (() => {
    if (network == "rinkeby") {
      return "https://testnets.opensea.io/assets/rinkeby";
    } else if (network == "goerli") {
      return "https://testnets.opensea.io/assets/goerli";
    }
    return "https://opensea.io/assets/ethereum";
  })();
  const EtherscanStore = `${EtherscanBase}/${storeAddress}`;
  const EtherscanToken = `${EtherscanBase}/${contentAddress}`;
  const OpenSeaPath = `${OpenSeaBase}/${contentAddress}`;

  return {
    EtherscanBase,
    OpenSeaBase,
    EtherscanStore,
    EtherscanToken,
    OpenSeaPath,
  };
};
