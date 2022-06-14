<template>
  <div class="max-w-lg mx-auto text-left p-2">
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ $t("message."+tokenGate) }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ $t("message."+tokenGate) }}</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
    <div v-else>
      <div>
        Total Count: {{ limit }}
      </div>
      <div v-if="currentToken < limit">
        Next Token: {{ currentToken }}
      </div>
      <div v-else>
        Sold Out!
      </div>
      <div v-if="tokenBalance == 0">
        <div v-if="justMinted">
          <p>Thank you for minting. Please wait a little bit...</p>
        </div>
        <div v-else>
          <div v-if="currentToken < limit">
            <p>Please <button @click="mint" class="underline">mint</button> (free, but you need to pay a gas fee).</p>
          </div>
          <div v-else>
            Thank you for the interest, but it is sold out unfortunately.
          </div>
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
  address: "0xdb9Ae4A1CAE7D45f2601e8efeCDb07EF33635CC7"
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
    const limit = ref(0);
    const currentToken = ref(0);

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
      let contract = networkContext.value.contract;
      let result = await contract.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = result[0].toNumber();

      result = await contract.functions.limit();
      limit.value = result[0].toNumber();
      result = await contract.functions.getCurrentToken();
      currentToken.value = result[0].toNumber();
      console.log("**fetchBakabce", tokenBalance.value, limit.value, currentToken.value);
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
      limit, currentToken,
      tokenGate,
      tokenBalance,
      switchToValidNetwork
    }
  }
});
</script>
