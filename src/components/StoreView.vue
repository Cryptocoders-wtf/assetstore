<template>
  <div>
    <select class="form-select block
      w-full
      px-3
      py-1.5
      text-base
      font-normal
      text-gray-700
      bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300
      rounded" @change="groupSelected">
      <option selected disabled value="">Please select a group</option>
      <option v-for="group in groups" v-bind:key="group" :value="group">
        {{ group }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};

export default defineComponent({
  name: "StoreView",
  props: [
    "network",
    "storeAddress",
  ],
  setup(props) {
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = ;
    const provider = (props.network == "localhost") ?
      new ethers.providers.JsonRpcProvider() : new ethers.providers.AlchemyProvider(props.network);

    const contractRO = new ethers.Contract(props.storeAddress, AssetStore.wabi.abi, provider);
    const groups = ref([] as string[]);

    provider.once("block", () => {
      contractRO.on(contractRO.filters.GroupAdded(), (group) => {
        console.log("[event/GroupAdded]", group);
        fetchGroups(group);
      });
    });

    /*
    const fetchAsset = async (assetId:string) => {
      if (!assets.value[assetId]) {
        const result = await contractRO.functions.generateSVG(assetId);
        const svg = 'data:image/svg+xml;base64,' + Buffer.from(result[0]).toString('base64');
        const value = Object.assign({}, assets.value);
        value[assetId] = { svg };
        assets.value = value;
      }
    };

    const fetchAssets = async(group:string, category:string) => {
      const result = await contractRO.functions.getAssetCountInCategory(group, category);
      console.log("fetchAssets called", group, category, result[0]);
      const assetCount = result[0];
      const promises = Array(assetCount).fill("").map(async (_,index) => {
        let result = await contractRO.functions.getAssetIdInCategory(group, category, index);
        const assetId = result[0].toNumber();
        fetchAsset(assetId);
        return assetId;
      });
      const assets:string[] = await Promise.all(promises);
      const value = Object.assign({}, allAssets.value) as  {[group:string]:{[category:string]:string[]}};
      if (!value[group]) {
        value[group] = {};
      }
      value[group][category] = assets;
      allAssets.value = value;   
    };

    const fetchCategories = async(group:string, category: string | null) => {
      console.log("fetchCategories called", group);

      const result = await contractRO.functions.getCategoryCount(group);
      const categoryCount = result[0];
      const promises = Array(categoryCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getCategoryNameAtIndex(group, index);
        if (!category || category == result[0]) {
          fetchAssets(group, result[0]);
        }
        return result[0];
      });
      const categories:string[] = await Promise.all(promises);

      const value = Object.assign({}, allCategories.value) as {[group:string]:string[]};
      value[group] = categories;
      allCategories.value = value;
    };
    */

    const groupSelected = (e) => {
      console.log("groupSelected", e.target.value);
    };

    const fetchGroups = async () => {
      const result = await contractRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getGroupNameAtIndex(index);
        return result[0];
      });
      groups.value = await Promise.all(promises);
    };
    fetchGroups();

    return {
      groups, groupSelected
    }
  }
});
</script>
