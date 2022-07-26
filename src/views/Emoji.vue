<template>
  <div class="max-w-xl mx-auto text-left p-2">
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
import { loadedAssets } from "../resources/emoji";

const contentsToken = {
  wabi: require("../abis/EmojiFlagToken.json"), // wrapped abi (KamonToken has the idential API)
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
    addresses.tokenAddress = addresses.flagAddress;
    const options = {
      tokenOffset: -1,
      svgStyle: 8,
      initTokenPer: 0,
      tokenName: "EmojiFlagToken",
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
