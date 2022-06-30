<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">Hello.</p>
      <div v-for="group in groups" v-bind:key="group">
        <b>{{ group }}</b> 
        <div v-for="category in allCategories[group]" v-bind:key="category">
          {{ category }}
        </div>
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
  address: "0x06786bCbc114bbfa670E30A1AC35dFd1310Be82f"
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = new ethers.providers.AlchemyProvider("rinkeby");
    const provider = new ethers.providers.JsonRpcProvider();

    const contractRO = new ethers.Contract(AssetStore.address, AssetStore.wabi.abi, provider);
    const groups = ref([] as Array<string>);
    const allCategories = ref(new Map<string, Array<string>>());

    const store = useStore();

    const fetchAssets = async(group:string, category:string) => {
      console.log("fetchAssets called", group, category);
    };
    const fetchCategories = async(group:string) => {
      console.log("fetchCategories called", group);
      const result = await contractRO.functions.getCategoryCount(group);
      const categoryCount = result[0];
      const promises = Array(categoryCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getCategoryNameAtIndex(group, index);
        return result[0];
      });
      const categories:Array<string> = await Promise.all(promises);
      console.log("categories", categories);
      const value = Object.assign({}, allCategories.value) as any;
      value[group] = categories;
      allCategories.value = value;
    };
    const fetchGroups = async () => {
      const result = await contractRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getGroupNameAtIndex(index);
        fetchCategories(result[0]);
        return result[0];
      });
      groups.value = await Promise.all(promises);
    };
    fetchGroups();

    return {
      groups, allCategories
    }
  }
});
</script>
