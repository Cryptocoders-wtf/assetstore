<template>
  <div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
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
        <option
          v-for="provider in assetProviderInfos"
          :key="provider.name"
          :value="provider.key"
        >
          {{ provider.name }}
        </option>
      </select>
      <div
        :style="`width: 100%; height: ${
          canvasParams.canh / 3
        }px; overflow-y: scroll`"
      >
        <span
          v-for="(assetImage, index) in assetImages"
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

const AssetComposer = {
  wabi: require("@/abis/AssetComposer.json"), // wrapped abi
};

const IAssetProvider = {
  wabi: require("@/abis/IAssetProvider.json"), // wrapped abi
};

interface AssetProviderInfo {
  key: string;
  name: string;
  provider: string;
}

interface AssetImage {
  image: string;
  assetId: number;
}

export default defineComponent({
  props: ["addresses", "canvasParams", "canvasOffset"],
  setup(props, context) {
    const showPopup = ref<boolean>(false);
    const assetProviderInfos = ref<AssetProviderInfo[]>([]);
    const selectedProvider = ref<string | null>(null);
    const assetImages = ref<AssetImage[]>([]);
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
        IAssetProvider.wabi.abi,
        provider
      );
      const result2 = await assetProvider.functions.totalSupply();
      const count = result2[0].toNumber();
      console.log("totalSupply", count);
      const limit = count > 0 ? count : 50;
      const images: AssetImage[] = [];
      for (let i = 0; i < limit; i++) {
        const assetId = count > 0 ? i : Math.floor(Math.random() * 0x1000000);
        const result = await assetProvider.functions.generateSVGPart(assetId);
        if (selectedProvider.value != newValue) {
          return;
        }
        const svgPart = result[0];
        const tag = result[1];
        const svg =
          '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n' +
          `<defs>\n${svgPart}\n</defs>\n` +
          `<use href="#${tag}" />\n` +
          "</svg>\n";
        //console.log(svg);
        const image =
          "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
        images.push({ image, assetId });
        assetImages.value = images.map((assetImage) => assetImage);
      }
    });

    const onOpen = () => {
      showPopup.value = !showPopup.value;
    };

    const onSelect = (index: number) => {
      const assetImage = assetImages.value[index];
      context.emit(
        "AssetSelected",
        selectedProvider.value,
        index,
        assetImage.image,
        assetImage.assetId
      );
      showPopup.value = false;
    };
    return {
      onOpen,
      showPopup,
      assetProviderInfos,
      selectedProvider,
      assetImages,
      onSelect,
    };
  },
});
</script>
