<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x5FD8C5267dE0e207D4B01f97a7D9ae638e6A38D7"
      tokenAddress="0xE504AE809337c0DC552DDb59f54090E5B3fBC0F5"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintView.vue";
import { ChainIds } from "../utils/MetaMask";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    return {
      expectedNetwork
    }
  }
});
</script>
