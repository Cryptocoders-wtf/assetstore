<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">Hello.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const AssetStore = {
  wabi: require("../abis/PrideSquiggle.json"), // wrapped abi
  address: "0xBD875B4379E638CeDb69c171A43040E5295236ab"
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    // Following three lines must be changed for other networks
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const provider = new ethers.providers.AlchemyProvider("rinkeby");
    const contractRO = new ethers.Contract(AssetStore.address, AssetStore.wabi.abi, provider);
    const store = useStore();

    return {
    }
  }
});
</script>
