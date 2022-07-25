import { ChainIds } from "../utils/MetaMask";
import { addresses as mainnet } from "../../generated/addresses_mainnet";
import { addresses as localhost } from "../../../contract/cache/addresses_localhost";
import { addresses as rinkeby } from "../../../contract/cache/addresses_rinkeby";
import { kamon_addresses as kamon_mainnet } from "../../generated/addresses_kamon_mainnet";
import { kamon_addresses as kamon_localhost } from "../../../contract/cache/addresses_kamon_localhost";
import { kamon_addresses as kamon_rinkeby } from "../../../contract/cache/addresses_kamon_rinkeby";
import { token_addresses as flag_localhost } from "../../../contract/cache/addresses_flag_localhost";
import { token_addresses as flag_rinkeby } from "../../../contract/cache/addresses_flag_rinkeby";

export const getContractAddresses = (network: string) => {
  if (network == "localhost") {
    return {
      network,
      chainId: ChainIds.Localhost,
      storeAddress: localhost.storeAddress,
      materialAddress: localhost.tokenAddress,
      kamonAddress: kamon_localhost.kamonAddress,
      flagAddress: flag_localhost.emojiFlagAddress,
      tokenAddress: "",
    };
  }
  if (network == "rinkeby") {
    return {
      network,
      EtherscanBase: "https://rinkeby.etherscan.io/address",
      chainId: ChainIds.RinkebyTestNet,
      storeAddress: rinkeby.storeAddress,
      materialAddress: rinkeby.tokenAddress,
      kamonAddress: kamon_rinkeby.kamonAddress,
      flagAddress: flag_rinkeby.emojiFlagAddress,
      tokenAddress: "",
    };
  }
  if (network == "mainnet") {
    return {
      network,
      EtherscanBase: "https://etherscan.io/address",
      chainId: ChainIds.Mainnet,
      storeAddress: mainnet.storeAddress,
      materialAddress: mainnet.tokenAddress,
      kamonAddress: kamon_mainnet.kamonAddress,
      flagAddress: "",
      tokenAddress: "",
    };
  }
  console.error("**** unexpected");
};
