<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0xF1075f20fB9457cF5B64d8AE94AecF05AFAA3071"
      tokenAddress="0xD34E89f1750200559B574F0AD69dBcB268beD4bb"
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
