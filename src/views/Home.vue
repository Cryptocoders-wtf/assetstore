<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <store-view foo="Hello World" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";
import StoreView from "@/components/StoreView.vue";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
  address: "0x1D8D70AD07C8E7E442AD78E4AC0A16f958Eba7F0"
};

export default defineComponent({
  name: "HomePage",
  components: {
    StoreView
  },
  setup() {
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = new ethers.providers.AlchemyProvider("rinkeby");
    const provider = new ethers.providers.JsonRpcProvider();

    return {
    }
  }
});
</script>
