<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost" 
      :expectedNetwork="expectedNetwork"
      :storeAddress="addresses.storeAddress"
      :tokenAddress="addresses.tokenAddress"
      />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintView.vue";
import { ChainIds } from "../utils/MetaMask";
import { addresses } from "../generated/addresses_localhost";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView
  },
  setup() {
    const expectedNetwork = ChainIds.Localhost;
    return {
      expectedNetwork,
      addresses
    }
  }
});
</script>
