<template>
  <div>
    <div class="mb-2 text-xl font-bold">On-chain Asset Store</div>
    <KeyMessage />
    <p class="mb-2">
      {{ $t("storyView.message") }}
    </p>
    <div v-if="assetCount > 0" class="mb-2 font-bold">
      {{ $t("storyView.totalAssetCount") }} : {{ assetCount }}
    </div>
    <select
      class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      v-model="selectedGroup"
    >
      <option v-if="groups.length === 0" selected disabled value="">
        {{ $t("storyView.loadingGroups") }}
      </option>

      <template v-else v-for="group in groups" :key="group.key">
        <option :value="group.key" v-if="group.key === ''" disabled>
          {{ group.value }}
        </option>
        <option :value="group.key" v-else>
          {{ group.value }}
        </option>
      </template>
    </select>

    <select
      v-if="categories.length > 0"
      class="form-select block mt-2 w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded"
      v-model="selectedCategory"
    >
      <template v-for="category in categories" :key="category">
        <option :value="category.key" v-if="category.key === ''" disabled>
          {{ category.value }}
        </option>
        <option :value="category.key" v-else>
          {{ category.value }}
        </option>
      </template>
    </select>
    <div v-else-if="selectedGroup">
      <p class="mt-2">{{ $t("storyView.loadingCategories") }}</p>
    </div>

    <div v-if="assets.length > 0" class="mt-2">
      <p class="mb-2">{{ $t("storyView.selectAssets") }}</p>
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
              {{ $t("storyView.sampleCodeMessage") }}
              <button
                class="border rounded-md shadow-md pl-2 pr-2"
                @click="copySample"
              >
                {{ $t("message.copy") }}
              </button>
            </p>
            <div class="mt-1 overflow-x-scroll">
              <pre class="text-xs">{{ sampleCode }}</pre>
            </div>
            <p class="mt-2">
               {{ $t("storyView.fetchedImage") }}
              <button
                class="border rounded-md shadow-md pl-2 pr-2"
                @click="copySVG"
              >
                {{ $t("message.copy") }}
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
      <p class="mt-2">{{ $t("storyView.loadingAssets") }}</p>
    </div>
    <References :EtherscanStore="EtherscanStore" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ethers } from "ethers";
import { AssetData } from "@/models/asset";
import KeyMessage from "@/components/KeyMessage.vue";
import References from "@/components/References.vue";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};
import { useRouter, useRoute } from "vue-router";

import { useLocalizedPath } from "@/i18n/utils";

export default defineComponent({
  name: "StoreView",
  props: ["addresses"],
  components: {
    KeyMessage,
    References,
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const { getLocalizedPath } = useLocalizedPath();

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
    const groups = ref<{ value: string; key: string }[]>([]);
    const categories = ref<{ value: string; key: string }[]>([]);
    const assets = ref<object[]>([]);

    const selectedGroup = ref<string>((route.params.group as string) || "");
    const selectedCategory = ref<string>(
      (route.params.category as string) || ""
    );
    const selectedAsset = ref<AssetData | null>(null);

    const categoriesCache: { [key: string]: any } = {};
    const assetsCache: { [key: string]: any } = {};

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

    const updateSelectedCategory = async () => {
      if (selectedCategory.value === "") {
        return;
      }
      assets.value = [];
      selectedAsset.value = null;

      const cacheKey = [selectedGroup.value, selectedCategory.value].join("--");
      if (assetsCache[cacheKey]) {
        assets.value = assetsCache[cacheKey];
        return;
      }
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
      const assetsData = await Promise.all(promises);
      assetsCache[cacheKey] = assetsData;
      assets.value = assetsData;
    };
    watch(selectedCategory, async () => {
      console.log("categorySelected", selectedCategory.value);
      updateSelectedCategory();
    });

    const updateSelectedGroup = async () => {
      if (selectedGroup.value === "") {
        return;
      }
      assets.value = [];

      if (categoriesCache[selectedGroup.value]) {
        categories.value = categoriesCache[selectedGroup.value];
        return;
      }
      const counterResult = await assetStoreRO.functions.getCategoryCount(
        selectedGroup.value
      );
      const categoryCount = counterResult[0];
      const promises = Array(categoryCount)
        .fill("")
        .map(async (_, index) => {
          const result = await assetStoreRO.functions.getCategoryNameAtIndex(
            selectedGroup.value,
            index
          );
          return {
            value: result[0],
            key: result[0],
          };
        });
      const categoryData = [
        {
          value: "Please select a category",
          key: "",
        },
      ].concat(await Promise.all(promises));

      categoriesCache[selectedGroup.value] = categoryData;
      categories.value = categoryData;
    };
    watch(selectedGroup, () => {
      categories.value = [];
      selectedCategory.value = "";

      updateSelectedGroup();
    });
    const fetchGroups = async () => {
      const result = await assetStoreRO.functions.getGroupCount();
      const groupCount = result[0];
      const promises = Array(groupCount)
        .fill("")
        .map(async (_, index) => {
          const result = await assetStoreRO.functions.getGroupNameAtIndex(
            index
          );
          return {
            key: result[0],
            value: result[0],
          };
        });

      groups.value = [
        {
          value: "Please select a group",
          key: "",
        },
      ].concat(await Promise.all(promises));
    };

    updateSelectedGroup();
    updateSelectedCategory();
    watch([selectedGroup, selectedCategory], async () => {
      if (selectedCategory.value) {
        router.push(
          getLocalizedPath(
            `/group/${selectedGroup.value}/category/${selectedCategory.value}`
          )
        );
      } else if (selectedGroup.value) {
        router.push(getLocalizedPath(`/group/${selectedGroup.value}`));
      } else {
        router.push(getLocalizedPath(`/`));
      }
    });
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
      lang,
      EtherscanStore,
      assetCount,
      groups,
      selectedGroup,
      categories,
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
