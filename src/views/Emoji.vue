<template>
  <div v-if="error">
    <NetworkError />
  </div>
  <div class="mx-auto max-w-xl p-2 text-left" v-else>
    <mint-view
      :addresses="addresses"
      title="OpenMoji National Flags"
      :priceRange="{ low: 0.08, high: 0.35 }"
      :contentsToken="contentsToken"
      :loadedAssets="loadedAssets"
      :options="options"
    >
    </mint-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { getContractAddresses } from "@/utils/networks";

import MintView from "@/components/MintView.vue";
import NetworkError from "@/components/NetworkError.vue";

import { loadedAssets } from "../resources/emoji";

const contentsToken = {
  wabi: require("../abis/EmojiFlagToken.json"), // wrapped abi (KamonToken has the idential API)
};

export default defineComponent({
  name: "EmojiMint",
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
    addresses.tokenAddress = addresses.flagAddress;
    const options = {
      tokenOffset: -1,
      svgStyle: 8,
      initTokenPer: 0,
      tokenName: "EmojiFlagToken",
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
