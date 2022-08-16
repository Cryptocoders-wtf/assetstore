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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";

const AssetComposer = {
  wabi: require("../abis/AssetComposer.json"), // wrapped abi
};

export default defineComponent({
  props: ["addresses"],
  setup(props, context) {
    const showPopup = ref<boolean>(false);
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
      console.log("providerCount", count);
      for (let i=0; i<count; i++) {
        const result = await assetComposer.functions.getProvider(i);
        console.log("getProvider", result[0], result[1], result[2]);
      }
    };
    fetchProviders();

    const onOpen = () => {
      showPopup.value = !showPopup.value;
    };
    return {
      onOpen,
      showPopup
    };
  },
});
</script>