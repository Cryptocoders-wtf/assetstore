<template>
  <div>
    <div>
      <span v-for="asset in actionAssets" v-bind:key="asset.name">
        <img @click="() => {onSelect(asset)}" :src="asset.image" class="w-16 inline-block rounded-xl" />
      </span>
    </div>
    <div>
      <span v-for="asset in socialAssets" v-bind:key="asset.name">
        <img @click="() => {onSelect(asset)}" :src="asset.image" class="w-16 inline-block rounded-xl" />
      </span>
    </div>
    <div v-if="selection">
      Selected {{ selection.asset.name }}
    </div>
    <div v-for="group in groups" v-bind:key="group">
      <b>{{ group }}</b> 
      <div v-for="category in allCategories[group]" v-bind:key="category">
        <div>
        {{ category }} 
        </div>
        <div v-if="allAssets[group] && allAssets[group][category]">
          <span v-for="assetId in allAssets[group][category]" v-bind:key="assetId">
            <span v-if="assets[assetId]">
              <img :src="assets[assetId].svg" class="w-16 inline-block rounded-xl" />
            </span>
            <span v-else>
            ...
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";
import { actionAssets, socialAssets } from "../resources/materials";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};

export default defineComponent({
  name: "MintView",
  props: [
    "network",
    "storeAddress",
  ],
  setup(props) {
    console.log("**** actions", actionAssets[0].bytes);
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = ;
    const provider = (props.network == "localhost") ?
      new ethers.providers.JsonRpcProvider() : new ethers.providers.AlchemyProvider("rinkeby");

    const contractRO = new ethers.Contract(props.storeAddress, AssetStore.wabi.abi, provider);
    const groups = ref([] as string[]);
    const allCategories = ref({} as {[group:string]:string[]});
    const allAssets = ref({} as {[group:string]:{[category:string]:string[]}});
    const assets = ref({} as {[assetId: string]: {[propId:string]:string}});

    const selection = ref(null as any);
    const onSelect = async (asset: any) => {
      console.log(asset);
      selection.value = {
        asset
      }
    }

    provider.once("block", () => {
      contractRO.on(contractRO.filters.GroupAdded(), (group) => {
        console.log("**** got GroupAdded event", group);
        fetchGroups(group);
      });
      contractRO.on(contractRO.filters.CategoryAdded(), (group, category) => {
        console.log("**** got CategoryAdded event", group, category);
        fetchCategories(group, category);
      });
      contractRO.on(contractRO.filters.AssetRegistered(), async (from, assetId) => {
        console.log("**** got AssetRegistered event", from, assetId.toNumber());
        const attr = (await contractRO.functions.getAttributes(assetId))[0];
        console.log(attr);
        const group = attr[0];
        const category = attr[1];
        fetchAssets(group, category);
      });
    });

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

      console.log("updating categories", group, categories);
      const value = Object.assign({}, allCategories.value) as {[group:string]:string[]};
      value[group] = categories;
      allCategories.value = value;
    };

    const fetchGroups = async (group: string | null) => {
      const result = await contractRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await contractRO.functions.getGroupNameAtIndex(index);
        if (!group || group == result[0]) {
          fetchCategories(result[0], null);
        }
        return result[0];
      });
      groups.value = await Promise.all(promises);
    };
    fetchGroups(null);

    return {
      groups, allCategories, allAssets, assets, actionAssets, socialAssets,
      onSelect, selection
    }
  }
});
</script>
