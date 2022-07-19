import { createStore } from "vuex";
import { startMonitoringMetamask } from "../utils/MetaMask";

interface State {
  ethereum: any | null;
  chainId: string | null;
  account: undefined | null | string;
}

export default createStore<State>({
  state: {
    ethereum: null,
    chainId: null,
    account: undefined,
  },
  mutations: {
    setEthereum(state: State, ethereum: any | null) {
      state.ethereum = ethereum;
      if (state.ethereum) {
        startMonitoringMetamask();
      }
    },
    setChainId(state: State, chainId: string | null) {
      state.chainId = chainId;
    },
    setAccount(state: State, account: string | null) {
      state.account = account && account.toLowerCase();
    },
  },
  getters: {
    hasMetaMask: (state: State) => {
      return state.ethereum && state.ethereum.isMetaMask;
    },
    displayAccount: (state: State) => {
      const account = state.account;
      if (!account) {
        return "";
      }
      return account.substring(0, 6) + "..." + account.substring(38);
    },
  },
  actions: {},
  modules: {},
});
