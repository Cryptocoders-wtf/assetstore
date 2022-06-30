<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">Hello.</p>
      <div v-for="group in groups" v-bind:key="group">
        {{ group }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
  address: "0x7072e8bfF38EB37c9b197F7921Fecb84c2ac1121"
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    // Following two lines must be changed for other networks
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const provider = new ethers.providers.AlchemyProvider("rinkeby");

    const contractRO = new ethers.Contract(AssetStore.address, AssetStore.wabi.abi, provider);
    const groups = ref([] as Array<string>);

    const store = useStore();
    const fetchGroups = async () => {
      let result = await contractRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getGroupNameAtIndex(index);
        return result[0];
      });
      groups.value = await Promise.all(promises);
    }
    fetchGroups();

    return {
      groups
    }
  }
});
</script>
