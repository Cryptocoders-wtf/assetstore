<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div class="mt-4 mb-8">
      <p class="mb-4">Hello.</p>
      <div v-for="group in groups" v-bind:key="group">
        <b>{{ group }}</b> 
        <div v-for="category in allCategories[group]" v-bind:key="category">
          <div>
          {{ category }} 
          </div>
          <span v-for="asset in allAssets[group][category]" v-bind:key="asset.assetId">
            <img :src="asset.svg" class="mt-4 w-24" />
          </span>
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
  address: "0xc9952Fc93Fa9bE383ccB39008c786b9f94eAc95d"
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
    const allAssets = ref(new Map<string, Map<string, Array<any>>>());
    provider.on(contractRO.filters.GroupAdded(), (log, event) => {
      console.log("**** got GroupAdded event", log, event);
    });
    provider.on(contractRO.filters.CategoryAdded(), (log, event) => {
      console.log("**** got CategoryAdded event", log, event);
    });
    provider.on(contractRO.filters.AssetRegistered(), (log, event) => {
      console.log("**** got AssetRegistered event", log, event);
    });


    const store = useStore();

    const fetchAssets = async(group:string, category:string) => {
      const result = await contractRO.functions.getAssetCountInCategory(group, category);
      console.log("fetchAssets called", group, category, result[0]);
      const assetCount = result[0];
      const promises = Array(assetCount).fill("").map(async (_,index) => {
        let result = await contractRO.functions.getAssetIdInCategory(group, category, index);
        const assetId = result[0].toNumber();
        result = await contractRO.functions.generateSVG(assetId);
        const svg = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64');
        return { assetId, svg };
      });
      const assets:Array<any> = await Promise.all(promises);
      console.log("assetIds", assets);
      const value = Object.assign({}, allAssets.value) as any;
      value[group][category] = assets;
      //console.log("***", value);
      allAssets.value = value;   
    };
    const fetchCategories = async(group:string) => {
      console.log("fetchCategories called", group);
      const value2 = Object.assign({}, allAssets.value) as any;
      value2[group] = {};
      allAssets.value = value2;

      const result = await contractRO.functions.getCategoryCount(group);
      const categoryCount = result[0];
      const promises = Array(categoryCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getCategoryNameAtIndex(group, index);
        fetchAssets(group, result[0]);
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
      groups, allCategories, allAssets
    }
  }
});
</script>
