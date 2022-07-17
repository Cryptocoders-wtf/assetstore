<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="rinkeby" 
      :expectedNetwork="expectedNetwork"
      :storeAddress="addresses.storeAddress"
      :tokenAddress="addresses.tokenAddress"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintKamon.vue";
import { ChainIds } from "../utils/MetaMask";
import { addresses } from "../../../contract/cache/addresses_rinkeby";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    return {
      expectedNetwork,
      addresses
    }
  }
});
</script>
