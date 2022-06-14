<template>
  <div class="max-w-lg mx-auto text-left p-2">
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ tokenGate }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ tokenGate }}</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
    <div v-else>
      <div v-if="tokenBalance == 0">
        <div v-if="justMinted">
          <p>Thank you for minting. Please wait a little bit...</p>
        </div>
        <div v-else>
          <p>You need to have a contract token to play with this app</p>
          <p>Please <button @click="mint" class="underline">mint</button> (free, but you need to pay a gas).</p>
        </div>
      </div>
      <div v-else>
        <div>
          <p>Thank you for being a member of Pride Squiggle community.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const PrideSquiggle = {
  wabi: require("../abis/PrideSquiggle.json"), // wrapped abi
  address: "0x182FE3EF25F8f559C22620Fa6c64fFB6Aa2BaDf8"
};

const shorten = (address: string) => {
  return address.substring(0,6) + "..." + address.substring(38);
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const store = useStore();
    const tokenBalance = ref(0);
    const justMinted = ref(false);

    let prevProvider:ethers.providers.Web3Provider | null = null;
    const networkContext = computed(() => {
      if (prevProvider) {
        console.log("Calling removeAllListners()");
        prevProvider.removeAllListeners();
        prevProvider = null;
      }

      if (store.state.account && store.state.chainId == expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(PrideSquiggle.address, PrideSquiggle.wabi.abi, signer);
        const mintFilter = contract.filters.NounBought();
        provider.on(mintFilter, (log, event) => {
          console.log("**** got mint event", log, event);
          justMinted.value = false;
          fetchBalance();
        });
        prevProvider = provider;

        return { provider, signer, contract };
      }
      return null;
    });

    const fetchBalance = async () => {
      if (!networkContext.value) return;
      const count = await networkContext.value.contract.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = count[0].toNumber();
    };

    const mint = async () => {
      if (!networkContext.value) return;
      await networkContext.value.contract.functions.mint();
      justMinted.value = true;
    };
    const tokenGate = computed(()=>{
      if (!store.state.account) {
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
    const account = computed(()=>{
      if (store.state.account) {
        return store.state.account.toLowerCase();
      }
      return null;
    });    
    return {
      account,
      mint, justMinted,
      tokenGate,
      tokenBalance,
      switchToValidNetwork
    }
  }
});
</script>
