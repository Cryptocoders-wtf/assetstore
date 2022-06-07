<template>
  <div class="flex justify-center items-center space-x-8">
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ tokenGate }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ tokenGate }}</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
    <div v-else>
      <div v-if="tokenBalance > 0">
        <p>Hello a member</p>
      </div>
      <div v-else>
        <p>You need to have a Nounsville token to play with this app</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const NounsVille = {
  wabi: require("../abis/NounsvilleToken.json"), // wrapped abi
  address: "0x163B3906884df904EFF51bf21E7Ee3D3f87098D3"
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const store = useStore();
    const tokenBalance = ref(0);
    const account = computed(() => {
      return store.state.account;
    });
    const fetchBalance = async () => {
      const provider = new ethers.providers.Web3Provider(store.state.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NounsVille.address, NounsVille.wabi.abi, signer);
      const count = await contract.functions.balanceOf(account.value);
      console.log("**** count", count[0].toNumber());
      tokenBalance.value = count[0].toNumber();
    };
    const tokenGate = computed(()=>{
      if (!account.value) {
        return "noAccount"
      }
      if (store.state.chainId != expectedNetwork) {
        return "invalidNetwork"
      }
      fetchBalance();
      return "valid";      
    });
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }

    return {
      tokenGate,
      tokenBalance,
      switchToValidNetwork
    }
  }
});
</script>
