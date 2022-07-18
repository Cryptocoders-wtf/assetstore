<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      network="localhost"
      :expectedNetwork="expectedNetwork"
      :storeAddress="addresses.storeAddress"
      :tokenAddress="kamon_addresses.kamonAddress"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintView from "@/components/MintKamon.vue";
import { ChainIds } from "../utils/MetaMask";
import { addresses } from "../../../contract/cache/addresses_localhost";
import { kamon_addresses } from "../../../contract/cache/addresses_kamon_localhost";

export default defineComponent({
  name: "HomePage",
  components: {
    MintView,
  },
  setup() {
    const expectedNetwork = ChainIds.Localhost;
    return {
      expectedNetwork,
      addresses,
      kamon_addresses,
    };
  },
});
</script>
