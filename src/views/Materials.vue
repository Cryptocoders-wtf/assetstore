<template>
  <div v-if="error">
    <NetworkError />
  </div>
  <div class="mx-auto max-w-xl p-2 text-left" v-else>
    <mint-view
      :addresses="addresses"
      title="Google Material Icons"
      :priceRange="{ low: 0.05, high: 0.15 }"
      :contentsToken="contentsToken"
      :loadedAssets="loadedAssets"
      :options="options"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";

import MintView from "@/components/MintView.vue";
import NetworkError from "@/components/NetworkError.vue";

import { loadedAssets } from "../resources/crypto";

const contentsToken = {
  wabi: require("../abis/MaterialToken.json"), // wrapped abi
};

export default defineComponent({
  name: "MaterialsMint",
  components: {
    MintView,
    NetworkError,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network);
    if (!addresses) {
      return {
        error: true,
      };
    }
    addresses.tokenAddress = addresses.materialAddress;
    const options = {
      tokenOffset: 754,
      svgStyle: 0,
      initTokenPer: 4,
      tokenName: "MaterialToken",
    };
    return {
      error: false,
      addresses,
      contentsToken,
      loadedAssets,
      options,
    };
  },
});
</script>
