<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      storeAddress="0x8698639B0055F8846f0996fF2AEE8F2A1f896102"
      tokenAddress="0xe6069aa13FBff6b6CD0760590D6C712B8bE3cB7a"
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
