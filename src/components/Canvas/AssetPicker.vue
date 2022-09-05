<template>
  <div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
      <div class="text-sm">{{ $tc("dfraw.overlay") }}</div>
      <div>
        <span class="material-icons invisible">image</span>
      </div>
    </div>
    <div
      v-if="showPopup"
      :style="`width:${(canvasParams.canw * 2) / 3}px; 
              left: ${canvasOffset.x + canvasParams.canw / 3}px; 
              top: ${canvasOffset.y + canvasParams.canh / 2}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
    >
      <select
        class="form-select block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-3 py-1.5 text-base font-normal text-gray-700"
        v-model="selectedProvider"
      >
        <option disabled :value="null">
          {{ $tc("assetPicker.chooseProvider") }}
        </option>
        <option
          v-for="provider in assetProviderInfos"
          :key="provider.name"
          :value="provider.key"
        >
          {{ provider.name }}
        </option>
      </select>
      <select
        v-if="groupNames.length > 1"
        class="form-select block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-3 py-1.5 text-base font-normal text-gray-700"
        v-model="selectedGroup"
      >
        <option disabled :value="null">
          {{ $tc("assetPicker.chooseGroup") }}
        </option>
        <option v-for="group in groupNames" :key="group" :value="group">
          {{ group }}
        </option>
      </select>
      <div
        :style="`width: 100%; height: ${
          canvasParams.canh / 3
        }px; overflow-y: scroll`"
      >
        <span
          v-for="(assetImage, index) in assetOverlays"
          :key="assetImage.image"
        >
          <img
            @click="onSelect(index)"
            :src="assetImage.image"
            class="mr-1 mb-1 inline-block w-14 rounded-xl"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { ethers } from "ethers";
import { Overlay, identityTransform } from "@/models/point";

const AssetComposer = {
  wabi: require("@/abis/AssetComposer.json"), // wrapped abi
};

const IAssetProvider = {
  wabi: require("@/abis/IAssetProvider.json"), // wrapped abi
};

const AssetStoreProvider = {
  wabi: require("@/abis/AssetStoreProvider.json"), // wrapped abi
};

// NOTE: There is no easy way to get the inteface Id of an interface.
// I've got this by writing solidity code to return it.
const ICategorizedAssetProvider_InterfaceId = 0xe105c16e;

interface AssetProviderInfo {
  key: string;
  name: string;
  provider: string;
}

export default defineComponent({
  props: ["addresses", "canvasParams", "canvasOffset"],
  setup(props, context) {
    const showPopup = ref<boolean>(false);
    const assetProviderInfos = ref<AssetProviderInfo[]>([]);
    const selectedProvider = ref<string | null>(null);
    const assetOverlays = ref<Overlay[]>([]);
    //console.log("***", props.addresses.composerAddress);
    const provider =
      props.addresses.network == "localhost"
        ? new ethers.providers.JsonRpcProvider()
        : new ethers.providers.AlchemyProvider(props.addresses.network);
    const assetComposer = new ethers.Contract(
      props.addresses.composerAddress,
      AssetComposer.wabi.abi,
      provider
    );
    const fetchProviders = async () => {
      const result = await assetComposer.functions.providerCount();
      const count = result[0].toNumber();
      const infos: AssetProviderInfo[] = [];
      for (let i = 0; i < count; i++) {
        const result = await assetComposer.functions.getProvider(i);
        const providerInfo = result[0];

        infos.push({
          key: providerInfo.key,
          name: providerInfo.name,
          provider: providerInfo.provider,
        });
      }
      assetProviderInfos.value = infos;
    };
    fetchProviders();

    const categorizedProviderAddress = ref<string | null>(null);
    const isCategorized = ref<boolean>(false);
    const groupNames = ref<string[]>([]);
    const selectedGroup = ref<string | null>(null);
    const categoryNames = ref<string[]>([]);
    const selectedCategory = ref<string | null>(null);
    watch([selectedGroup, groupNames], async ([newSelectedGroup, newGroupNames]) => {
      console.log("*** selectedGroup", newSelectedGroup, categorizedProviderAddress.value);
      if (categorizedProviderAddress.value == null || selectedGroup.value == null) {
        return;
      }
      const assetProvider = new ethers.Contract(
        categorizedProviderAddress.value,
        AssetStoreProvider.wabi.abi, // HACK: instead of ICategorizedAssetProvider.wabi.abi,
        provider
      );
      const [categoryCount] = await assetProvider.functions.getCategoryCount(selectedGroup.value);
      console.log("*** categoryCount", categoryCount);
    });
    watch(selectedProvider, async (newValue) => {
      // Later: Eliminated this O(n) search with key mapping
      const infos = assetProviderInfos.value.filter((item) => {
        return item.key == newValue;
      });
      if (infos.length != 1) {
        console.error("providers.length != 1");
        return;
      }
      const providerInfo = infos[0];

      const assetProvider = new ethers.Contract(
        providerInfo.provider,
        AssetStoreProvider.wabi.abi, // HACK: instead of IAssetProvider.wabi.abi,
        provider
      );
      //const interfaceId = await assetProvider.functions.getInterfaceId();
      //console.log("** interfaceId", interfaceId);
      const [valueIsCategorized] =
        await assetProvider.functions.supportsInterface(
          ICategorizedAssetProvider_InterfaceId
        );
      console.log("** isCategorized", valueIsCategorized);
      isCategorized.value = valueIsCategorized;
      if (valueIsCategorized) {
        categorizedProviderAddress.value = providerInfo.provider;
        // fetch groups
        groupNames.value = [];
        categoryNames.value = [];

        const [groupCount] = await assetProvider.functions.getGroupCount();
        console.log("*** groupCount", groupCount);
        const groups: string[] = [];
        for (let i = 0; i < groupCount; i++) {
          const [groupName] = await assetProvider.functions.getGroupNameAtIndex(
            i
          );
          groups.push(groupName);

          if (selectedProvider.value != newValue || newValue == null) {
            return;
          }
        }
        console.log("*** groups", groups);
        groupNames.value = groups;
        if (groups.length == 1) {
          selectedGroup.value = groups[0]; // auto select the only one
        }
      } else {
        categorizedProviderAddress.value = null;
        groupNames.value = [];
        categoryNames.value = [];
      }

      fetchAssetsAsync(newValue, assetProvider);
    });

    const fetchAssetsAsync = async (
      provider: string | null,
      assetProvider: ethers.Contract
    ) => {
      const result2 = await assetProvider.functions.totalSupply();
      const count = result2[0].toNumber();
      console.log("totalSupply", count);
      const limit = count > 0 ? count : 50;
      const overlays: Overlay[] = [];

      for (let i = 0; i < limit; i++) {
        const assetId = count > 0 ? i : Math.floor(Math.random() * 0x1000000);
        const result = await assetProvider.functions.generateSVGPart(assetId);
        if (selectedProvider.value != provider || provider == null) {
          return;
        }
        const svgPart = result[0];
        const svgTag = result[1];
        const svg =
          '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n' +
          `<defs>\n${svgPart}\n</defs>\n` +
          `<use href="#${svgTag}" />\n` +
          "</svg>\n";
        //console.log(svg);
        const image =
          "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
        const transform = Object.assign({}, identityTransform);
        transform.scale = 0.5;
        overlays.push({
          provider,
          image,
          assetId,
          svgPart,
          svgTag,
          transform,
          fill: "",
        });
        assetOverlays.value = overlays.map((assetImage) => assetImage);
      }
    };

    const onOpen = () => {
      showPopup.value = !showPopup.value;
    };

    const onSelect = (index: number) => {
      const overlay = assetOverlays.value[index];
      context.emit("AssetSelected", overlay);
      showPopup.value = false;
    };
    return {
      onOpen,
      showPopup,
      assetProviderInfos,
      selectedProvider,
      assetOverlays,
      onSelect,
      isCategorized,
      groupNames,
      selectedGroup,
      categoryNames,
      selectedCategory,
    };
  },
});
</script>
