<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <mint-view
      :addresses="addresses"
      title="Open Emoji National Flags"
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
import KamonMessage from "@/components/KamonMessage.vue";
import { loadedAssets } from "../resources/kamon";

const contentsToken = {
  wabi: require("../abis/KamonToken.json"), // wrapped abi
};

export default defineComponent({
  name: "HomePage",
  components: {
    MintView,
    KamonMessage,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network)!;
    addresses.tokenAddress = addresses.kamonAddress;
    const options = {
      tokenOffset: -1,
      svgStyle: 8,
      initTokenPer: 0,
      tokenName: "KamonToken",
    };
    return {
      addresses,
      contentsToken,
      loadedAssets,
      options,
    };
  },
});
</script>
