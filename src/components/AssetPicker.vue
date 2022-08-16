<template>
  <div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
    </div>
    <div
      v-if="showPopup"
      style="width: 400px; height: 200px; left: 40px; overflow-y: scroll"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
    >
    <select
      class="form-select block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-3 py-1.5 text-base font-normal text-gray-700"
      v-model="selectedProvider"
    >
      <option v-for="provider in assetProviderInfos" :key="provider.name" :value="provider.key">
        {{ provider.name }}
      </option>
    </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { ethers } from "ethers";

const AssetComposer = {
  wabi: require("../abis/AssetComposer.json"), // wrapped abi
};

const IAssetProvider = {
  wabi: require("../abis/IAssetProvider.json"), // wrapped abi
};

interface AssetProviderInfo {
  key: string,
  name: string,
  provider: string
}

export default defineComponent({
  props: ["addresses"],
  setup(props, context) {
    const showPopup = ref<boolean>(false);
    const assetProviderInfos = ref<AssetProviderInfo[]>([]);
    const selectedProvider = ref<string | null>(null);
    console.log("***", props.addresses.composerAddress);
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
      const infos:AssetProviderInfo[] = [];
      for (let i=0; i<count; i++) {
        const result = await assetComposer.functions.getProvider(i);
        const providerInfo = result[0];

        infos.push({
          key: providerInfo.key,
          name: providerInfo.name,
          provider: providerInfo.provider,
        })
      }
      assetProviderInfos.value = infos;
    };
    fetchProviders();
    watch(selectedProvider, async (newValue) => {
      // Later: Eliminated this O(n) search with key mapping
      const infos = assetProviderInfos.value.filter(item => {
        return item.key == newValue;
      })
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
      console.log("totalSupply", result2[0].toNumber())
    });

    const onOpen = () => {
      showPopup.value = !showPopup.value;
    };
    return {
      onOpen,
      showPopup,
      assetProviderInfos,
      selectedProvider
    };
  },
});
</script>