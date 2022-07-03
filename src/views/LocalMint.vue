<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x114e375B6FCC6d6fCb68c7A1d407E652C54F25FB"
      tokenAddress="0xcD0048A5628B37B8f743cC2FeA18817A29e97270"
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
    const expectedNetwork = ChainIds.Localhost;
    return {
      expectedNetwork
    }
  }
});
</script>
