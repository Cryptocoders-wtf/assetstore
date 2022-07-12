<template>
  <div>
    <select class="form-select block
      w-full px-3 py-1.5 text-base font-normal text-gray-700
      bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      @change="groupSelected">
      <option selected disabled value="">Please select a group</option>
      <option v-for="group in groups" v-bind:key="group" :value="group">
        {{ group }}
      </option>
    </select>

    <select v-if="categories.length > 0" class="form-select block mt-2
      w-full px-3 py-1.5 text-base font-normal text-gray-700
      bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      @change="categorySelected">
      <option selected disabled value="">Please select a category</option>
      <option v-for="category in categories" v-bind:key="category" :value="category">
        {{ category }}
      </option>
    </select>

    <div v-if="assets.length > 0" class="mt-2">
      <p class="mb-2">Please select one of assets below.</p>
      <span v-for="asset in assets" :key="asset.assetId">
          <img @click="() => { assetSelected(asset); }" :src="asset.image" 
              class="cursor-pointer w-10 inline-block rounded-xl" />
          <div v-if="asset.assetId == selectedAsset.assetId" class="mt-2 mb-2 border shadow-md rounded-xs p-2">
            <div v-if="selectedAsset.name">
              <p>A sample code to fetch the SVG image of this asset.</p>
              <p class="text-xs mt-1">
                {{ `let result = await assetStore.functions.getAssetIdWithName("${selectedGroup}", "${selectedCategory}", "${selectedAsset.name}");` }}<br/>
                {{ `const assetId = result[0].toNumber(); // ${asset.assetId}` }}<br/>
                {{ `result = await assetStore.functions.generateSVG(assetId);` }}<br/>
                {{ `const svg = result[0];` }}<br/>
              </p>
              <p class="mt-2">The contents of variable "svg" will be:</p>
              <div class="mt-2 overflow-x-scroll">
                <pre class="text-xs">{{ asset.svg }}</pre>
              </div>
            </div>
            <p v-else>...</p>
          </div>
      </span>
    </div>
    <div v-else-if="selectedCategory">
      <p class="mt-2">Loading...</p>
    </div>
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

    const assetStoreRO = new ethers.Contract(props.storeAddress, AssetStore.wabi.abi, provider);
    const groups = ref([] as string[]);
    const selectedGroup = ref("");
    const categories = ref([] as string[]);
    const selectedCategory = ref("");
    const assets = ref([] as object[]);
    const selectedAsset = ref({} as object);

    const assetSelected = async (asset:any) => {
      console.log("assetSelected", asset);
      selectedAsset.value = asset;
      if (!asset.name) {
        const result = await assetStoreRO.getAttributes(asset.assetId);
        asset.name = result.name;
        console.log(asset);
        selectedAsset.value = Object.assign({}, asset);
      }
      
      // 
      const assetStore = assetStoreRO;
      let result = await assetStore.functions.getAssetIdWithName("Material Icons (Apache 2.0)", "Alert", "auto delete");
      const assetId = result[0].toNumber(); // 459
      result = await assetStore.functions.generateSVG(assetId);
      const svg = result[0];
      console.log("###", svg);
    };

    const categorySelected = async (e:any) => {
      console.log("categorySelected", e.target.value);
      selectedCategory.value = e.target.value;
      assets.value = [];
      selectedAsset.value = {};
      const result = await assetStoreRO.functions.getAssetCountInCategory(selectedGroup.value, selectedCategory.value);
      const assetCount = result[0];
      const promises = Array(assetCount).fill("").map(async (_,index) => {
        let result = await assetStoreRO.functions.getAssetIdInCategory(selectedGroup.value, selectedCategory.value, index);
        const assetId = result[0].toNumber();
        result = await assetStoreRO.functions.generateSVG(assetId);
        const svg = result[0];
        const image = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
        return { index, assetId, svg, image };
      });
      assets.value = await Promise.all(promises);
    };

    const groupSelected = async (e:any) => {
      console.log("groupSelected", e.target.value);
      selectedGroup.value = e.target.value;
      categories.value = [];
      const result = await assetStoreRO.functions.getCategoryCount(selectedGroup.value);
      const categoryCount = result[0];
      const promises = Array(categoryCount).fill("").map(async (_,index) => {
        const result = await assetStoreRO.functions.getCategoryNameAtIndex(selectedGroup.value, index);
        return result[0];
      });
      categories.value = await Promise.all(promises);
    };

    const fetchGroups = async () => {
      const result = await assetStoreRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount).fill("").map(async (_,index) => {
        const result = await assetStoreRO.functions.getGroupNameAtIndex(index);
        return result[0];
      });
      groups.value = await Promise.all(promises);
    };
    fetchGroups();

    return {
      groups, groupSelected, selectedGroup,
      categories, categorySelected, selectedCategory,
      assets, assetSelected, selectedAsset
    }
  }
});
</script>
