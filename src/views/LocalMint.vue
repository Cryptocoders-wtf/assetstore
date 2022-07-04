<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x930b218f3e63eE452c13561057a8d5E61367d5b7"
      tokenAddress="0x721d8077771Ebf9B931733986d619aceea412a1C"
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
