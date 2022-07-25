<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      :addresses="addresses"
      title="Google Material Icons"
      :priceRange="{ low: 0.05, high: 0.15 }"
      :contentsToken="contentsToken"
      :options="options"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";
import MintView from "@/components/MintView.vue";

const contentsToken = {
  wabi: require("../abis/MaterialToken.json"), // wrapped abi
};

export default defineComponent({
  name: "HomePage",
  components: {
    MintView,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network)!;
    addresses.tokenAddress = addresses.materialAddress;
    const options = {
      tokenOffset: addresses.network == "rinkeby" ? -1 : 580, 
      svgStyle: 0, 
      initTokenPer: 4
    };
    return {
      addresses,
      contentsToken,
      options
    };
  },
});
</script>
