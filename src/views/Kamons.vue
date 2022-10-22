<template>
  <div v-if="error">
    <NetworkError />
  </div>
  <div class="mx-auto max-w-xl p-2 text-left" v-else>
    <mint-view
      :addresses="addresses"
      title="Kamon Symbols by Hakko Daiodo"
      :priceRange="{ low: 0.04, high: 0.23 }"
      :contentsToken="contentsToken"
      :loadedAssets="loadedAssets"
      :options="options"
    >
      <KamonMessage />
    </mint-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";

import MintView from "@/components/MintView.vue";
import NetworkError from "@/components/NetworkError.vue";
import KamonMessage from "@/components/KamonMessage.vue";

import { loadedAssets } from "../resources/kamon";

const contentsToken = {
  wabi: require("../abis/KamonToken.json"), // wrapped abi
};

export default defineComponent({
  name: "KamonMint",
  components: {
    MintView,
    KamonMessage,
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
    addresses.tokenAddress = addresses.kamonAddress;
    const options = {
      tokenOffset: (network == "goerli") ? 0 : 583,
      svgStyle: 8,
      initTokenPer: 0,
      tokenName: "KamonToken",
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
