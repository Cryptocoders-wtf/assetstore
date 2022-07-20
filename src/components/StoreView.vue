<template>
  <div>
    <div class="mb-2 text-xl font-bold">On-chain Asset Store</div>
    <KeyMessage />
    <div v-if="lang === 'ja'">
      <p class="mb-2">
        以下は、これまでクラウドミントによりブロックチェーン上にセーブされたベクトルアセットで、
        他のスマートコントラクトからアクセスが可能になっています。
        グループ、カテゴリーを選び、表示されたイメージとクリックすると、アクセスの方法が表示されます。
      </p>
    </div>
    <div v-else>
      <p class="mb-2">
        You are able to see the list of vector assets already uploaded to the blockchain by minters.
        Please select "group" and "category", and click one of images below.
        It will explain how to access the vector data. 
      </p>
    </div>
    <div v-if="assetCount > 0" class="mb-2 font-bold">
      Total Asset Count: {{ assetCount }}
    </div>
    <select
      class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      @change="groupSelected"
    >
      <option v-if="groups.length > 0" selected disabled value="">
        Please select a group
      </option>
      <option v-else selected disabled value="">Loading groups...</option>
      <option v-for="group in groups" v-bind:key="group" :value="group">
        {{ group }}
      </option>
    </select>

    <select
      v-if="categories.length > 0"
      class="form-select block mt-2 w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      @change="categorySelected"
    >
      <option selected disabled value="">Please select a category</option>
      <option
        v-for="category in categories"
        v-bind:key="category"
        :value="category"
      >
        {{ category }}
      </option>
    </select>
    <div v-else-if="selectedGroup">
      <p class="mt-2">Loading categories...</p>
    </div>

    <div v-if="assets.length > 0" class="mt-2">
      <p class="mb-2">Please select one of assets below.</p>
      <span v-for="asset in assets" :key="asset.assetId">
        <img
          @click="
            () => {
              assetSelected(asset);
            }
          "
          :src="asset.image"
          class="cursor-pointer w-12 inline-block rounded-xl"
        />
        <div
          v-if="asset.assetId == selectedAsset?.assetId"
          class="mt-2 mb-2 border shadow-md rounded-xs p-2"
        >
          <div v-if="selectedAsset.name">
            <p>
              A sample code to fetch the SVG image of this asset.
              <button
                class="border rounded-md shadow-md pl-2 pr-2"
                @click="copySample"
              >
                copy
              </button>
            </p>
            <div class="mt-1 overflow-x-scroll">
              <pre class="text-xs">{{ sampleCode }}</pre>
            </div>
            <p class="mt-2">
              The fetched "svg" data.
              <button
                class="border rounded-md shadow-md pl-2 pr-2"
                @click="copySVG"
              >
                copy
              </button>
            </p>
            <div class="mt-2 overflow-x-scroll">
              <pre class="text-xs">{{ asset.svg }}</pre>
            </div>
            <div> 
              <img
                :src="asset.image"
                class="cursor-pointer w-64 inline-block rounded-xl"
              />
            </div>
          </div>
          <p v-else>...</p>
        </div>
      </span>
    </div>
    <div v-else-if="selectedCategory">
      <p class="mt-2">Loading assets...</p>
    </div>
    <References :EtherscanStore="EtherscanStore" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ethers } from "ethers";
import { AssetData } from "@/models/asset";
import KeyMessage from "@/components/KeyMessage.vue";
import References from "@/components/References.vue";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};

export default defineComponent({
  name: "StoreView",
  props: ["addresses"],
  components: {
    KeyMessage, References
  },
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    // Following two lines must be changed for other networks
    //const expectedNetwork = ChainIds.RinkebyTestNet;
    //const provider = ;
    const provider =
      props.addresses.network == "localhost"
        ? new ethers.providers.JsonRpcProvider()
        : new ethers.providers.AlchemyProvider(props.addresses.network);

    const assetStoreRO = new ethers.Contract(
      props.addresses.storeAddress,
      AssetStore.wabi.abi,
      provider
    );
    const groups = ref<string[]>([]);
    const selectedGroup = ref("");
    const categories = ref<string[]>([]);
    const selectedCategory = ref("");
    const assets = ref<object[]>([]);
    const selectedAsset = ref<AssetData | null>(null);
    const sampleCode = ref("");
    const assetCount = ref(0);
    const EtherscanStore = computed(() => {
      if (props.addresses.EtherscanBase) {
        return `${props.addresses.EtherscanBase}/${props.addresses.storeAddress}`;
      }
      return null;
    });
    const assetSelected = async (asset: AssetData) => {
      // console.log("assetSelected", asset);
      selectedAsset.value = asset;
      if (!asset.name) {
        const result = await assetStoreRO.getAttributes(asset.assetId);
        asset.name = result.name;
        //console.log(asset);
        selectedAsset.value = Object.assign({}, asset);
      }
      sampleCode.value = [
        `const provider = new ethers.providers.AlchemyProvider("${props.addresses.network}");`,
        `const storeAddress = "${props.addresses.storeAddress}";`,
        `const assetStore = new ethers.Contract(storeAddress, AssetStore.abi, provider);`,
        `const group = "${selectedGroup.value}";`,
        `const category = "${selectedCategory.value}";`,
        `const name = "${selectedAsset.value.name}";`,
        `const resultAsset = await assetStore.functions.getAssetIdWithName(group, category, name);`,
        `const assetId = resultAsset[0].toNumber(); // ${selectedAsset.value.assetId}`,
        `const resultSVG = await assetStore.functions.generateSVG(assetId);`,
        `const svg = resultSVG[0];`,
      ].join("\n");

      /*
      const provider = new ethers.providers.AlchemyProvider("mainnet");
      const storeAddress = "0x847A044aF5225f994C60f43e8cF74d20F756187C";
      const assetStore = new ethers.Contract(storeAddress, AssetStore.wabi.abi, provider);
      const group = "Material Icons (Apache 2.0)";
      const category = "Alert";
      const name = "error";
      const resultAsset = await assetStore.functions.getAssetIdWithName(group, category, name);
      const assetId = resultAsset[0].toNumber(); // 462
      const resultSVG = await assetStore.functions.generateSVG(assetId);
      const svg = resultSVG[0];
      console.log("SVG ###", svg);
      */
    };

    const categorySelected = async (e: Event & {target: HTMLInputElement}) => {
      console.log("categorySelected", e.target.value);
      selectedCategory.value = e.target.value;
      assets.value = [];
      selectedAsset.value = null;
      const result = await assetStoreRO.functions.getAssetCountInCategory(
        selectedGroup.value,
        selectedCategory.value
      );
      const assetCount = result[0];
      const promises = Array(assetCount)
        .fill("")
        .map(async (_, index) => {
          let result = await assetStoreRO.functions.getAssetIdInCategory(
            selectedGroup.value,
            selectedCategory.value,
            index
          );
          const assetId = result[0].toNumber();
          console.log("*** assetId", assetId);
          try {
            result = await assetStoreRO.functions.generateSVG(assetId); //, { gasLimit: 6000000000 });
            console.log("*** got SVG", assetId);
          } catch (error: any) {
            const resultAttr = await assetStoreRO.functions.getAttributes(
              assetId
            );
            console.error(
              "*** failed to get SVG",
              assetId,
              resultAttr[0][2],
              error.message
            );
            result = ["N/A"];
          }
          const svg = result[0];
          const image =
            "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
          return { index, assetId, svg, image };
        });
      assets.value = await Promise.all(promises);
    };

    const groupSelected = async (e: Event & {target: HTMLInputElement}) => {
      console.log("groupSelected", e.target.value);
      selectedGroup.value = e.target.value;
      categories.value = [];
      const result = await assetStoreRO.functions.getCategoryCount(
        selectedGroup.value
      );
      const categoryCount = result[0];
      const promises = Array(categoryCount)
        .fill("")
        .map(async (_, index) => {
          const result = await assetStoreRO.functions.getCategoryNameAtIndex(
            selectedGroup.value,
            index
          );
          return result[0];
        });
      categories.value = await Promise.all(promises);
    };

    const fetchGroups = async () => {
      const result = await assetStoreRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount)
        .fill("")
        .map(async (_, index) => {
          const result = await assetStoreRO.functions.getGroupNameAtIndex(
            index
          );
          return result[0];
        });
      groups.value = await Promise.all(promises);
    };

    const fetchAssetCount = async () => {
      const result = await assetStoreRO.functions.getAssetCount();
      assetCount.value = result[0].toNumber();
    };
    fetchAssetCount();
    fetchGroups();

    const copySample = () => {
      navigator.clipboard.writeText(sampleCode.value);
    };
    const copySVG = () => {
      if (selectedAsset.value) {
        navigator.clipboard.writeText(selectedAsset.value.svg);
      }
    };

    return {
      lang, EtherscanStore,
      assetCount,
      groups,
      groupSelected,
      selectedGroup,
      categories,
      categorySelected,
      selectedCategory,
      assets,
      assetSelected,
      selectedAsset,
      sampleCode,
      copySample,
      copySVG,
    };
  },
});
</script>
