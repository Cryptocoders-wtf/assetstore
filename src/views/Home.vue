<template>
  <div class="flex justify-center items-center space-x-8">
    <div v-if="isValidNetwork">
      <p>Hello World</p>
    </div>
    <div v-else>
      <p>Invalid Network</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const store = useStore();
    const isValidNetwork = computed(()=>{
      return store.state.chainId == expectedNetwork;
    });    
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }

    return {
      isValidNetwork,
      switchToValidNetwork
    }
  }
});
</script>
