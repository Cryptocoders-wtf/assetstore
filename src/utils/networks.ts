import { ChainIds } from "../utils/MetaMask";
import { addresses as mainnet } from "../../generated/addresses_mainnet";
import { addresses as localhost } from "../../generated/addresses_localhost";
import { addresses as rinkeby } from "../../generated/addresses_rinkeby";
import { addresses as goerli } from "../../generated/addresses_goerli";
import { addresses as matic } from "../../generated/addresses_matic";
import { kamon_addresses as kamon_mainnet } from "../../generated/addresses_kamon_mainnet";
import { kamon_addresses as kamon_localhost } from "../../generated/addresses_kamon_localhost";
import { kamon_addresses as kamon_rinkeby } from "../../generated/addresses_kamon_rinkeby";
import { kamon_addresses as kamon_goerli } from "../../generated/addresses_kamon_goerli";
import { token_addresses as flag_mainnet } from "../../generated/addresses_flag_mainnet";
import { token_addresses as flag_localhost } from "../../generated/addresses_flag_localhost";
import { token_addresses as flag_rinkeby } from "../../generated/addresses_flag_rinkeby";
import { token_addresses as flag_goerli } from "../../generated/addresses_flag_goerli";
import { token_addresses as draw_localhost } from "../../generated/addresses_draw_localhost";
import { token_addresses as draw_rinkeby } from "../../generated/addresses_draw_rinkeby";
import { token_addresses as draw_goerli } from "../../generated/addresses_draw_goerli";

export const getContractAddresses = (network: string) => {
  if (network == "localhost") {
    return {
      network,
      chainId: ChainIds.Localhost,
      storeAddress: localhost.storeAddress,
      materialAddress: localhost.tokenAddress,
      kamonAddress: kamon_localhost.kamonAddress,
      flagAddress: flag_localhost.emojiFlagAddress,
      drawAddress: draw_localhost.customTokenAddress,
      composerAddress: draw_localhost.composerAddress,
      registryAddress: draw_localhost.registryAddress,
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
      drawAddress: draw_rinkeby.customTokenAddress,
      composerAddress: draw_rinkeby.composerAddress,
      registryAddress: draw_rinkeby.registryAddress,
      tokenAddress: "",
    };
  }
  if (network == "goerli") {
    return {
      network,
      EtherscanBase: "https://rinkeby.etherscan.io/address",
      chainId: ChainIds.Goerli,
      storeAddress: goerli.storeAddress,
      materialAddress: goerli.tokenAddress,
      kamonAddress: kamon_goerli.kamonAddress,
      flagAddress: flag_goerli.emojiFlagAddress,
      drawAddress: draw_goerli.customTokenAddress,
      composerAddress: draw_goerli.composerAddress,
      registryAddress: draw_goerli.registryAddress,
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
      flagAddress: flag_mainnet.emojiFlagAddress,
      drawAddress: "to be determined", // MEMO: don't forget to change the category in Draw.vue as well
      composerAddress: "to be determined",
      registryAddress: "to be determined",
      tokenAddress: "",
    };
  }
  if (network == "matic") {
    return {
      network,
      EtherscanBase: "https://polygonscan.com/address",
      chainId: ChainIds.Polygon,
      storeAddress: mainnet.storeAddress,
      materialAddress: mainnet.tokenAddress,
      kamonAddress: "to be determined",
      flagAddress: "to be determined",
      drawAddress: "to be determined", // MEMO: don't forget to change the category in Draw.vue as well
      composerAddress: "to be determined",
      registryAddress: "to be determined",
      tokenAddress: "",
    };
  }
  console.error("**** unexpected");
};
