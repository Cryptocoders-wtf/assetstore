<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" :drawing="selectedDrawing" />

    <div class="mx-auto max-w-xl p-2 text-left">
      <div class="mb-2 text-xl font-bold">{{ "Draw Your Own Token" }}</div>
      <div class="flex flex-wrap">
        <div
          v-for="(body, index) in drawings"
          :key="index"
          @click="onDrawingSelect(index)"
          :class="`border-2 ${
            index == selectedIndex ? 'border-blue-700' : 'border-white'
          }`"
        >
          <img :src="svgImageFromDrawing(body)" class="w-32" />
          <div
            v-if="index == selectedIndex"
            class="ml-2 mr-2 flex justify-between"
          >
            <button @click="onOpen">
              <span class="material-icons">edit</span>
            </button>
          </div>
        </div>
        <div>
          <button @click="onCreate">
            <span class="material-icons text-9xl">add</span>
          </button>
        </div>
      </div>
      <MintPanel
        :selection="selection"
        :tokenAbi="tokenAbi"
        :addresses="addresses"
        :tokensPerAsset="tokensPerAsset"
        :assetStoreRO="assetStoreRO"
        :priceRange="priceRange"
        :backgroundId="779"
      />
      <NFTList :tokens="tokens" :OpenSeaPath="OpenSeaPath" />
      <References
        :EtherscanStore="EtherscanStore"
        :EtherscanToken="EtherscanToken"
        :TokenName="tokenName"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";
import { useRoute } from "vue-router";
import Canvas from "@/components/Canvas.vue";
import { Drawing, svgImageFromDrawing } from "@/models/point";
import MintPanel from "@/components/MintPanel.vue";
import { getContractAddresses } from "@/utils/networks";
import { useOnSelect } from "@/utils/mintUtils";
import { loadAssets } from "../utils/createAsset";
import { Token } from "@/models/token";
import { fetchTokens } from "@/utils/fetchTokens";
import { getAddresses } from "@/utils/const";
import References from "@/components/References.vue";
import NFTList from "@/components/NFTList.vue";
import { v4 as uuidv4 } from "uuid";
import {
  OriginalAssetData,
  OriginalAssetDataSet,
  AssetData,
} from "@/models/asset";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};

const contentsToken = {
  wabi: require("../abis/DrawYourOwn.json"), // wrapped abi
};

/*
interface Dictionary<T> {
    [Key: string]: T;
}
*/
interface Info {
  nextIndex: number;
  keys: string[];
  //drawings: Dictionary<Layer[]>;
}
const baseInfo: Info = {
  nextIndex: 0,
  keys: [],
};

const keyInfo = "manifest";
const keyDrawing = "drawing";
const priceRange = { low: 0.04, high: 0.23 };

export default defineComponent({
  components: {
    Canvas,
    MintPanel,
    References,
    NFTList,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network)!;
    addresses.tokenAddress = addresses.drawAddress;

    const { EtherscanStore, EtherscanToken, OpenSeaPath } = getAddresses(
      addresses.network,
      addresses.storeAddress,
      addresses.tokenAddress
    );

    const provider =
      addresses.network == "localhost"
        ? new ethers.providers.JsonRpcProvider()
        : new ethers.providers.AlchemyProvider(addresses.network);

    const assetStoreRO = new ethers.Contract(
      addresses.storeAddress,
      AssetStore.wabi.abi,
      provider
    );
    const tokenRO = new ethers.Contract(
      addresses.tokenAddress,
      contentsToken.wabi.abi,
      provider
    );
    const tokens = ref<Token[]>([]);
    const { onSelect, selection, tokensPerAsset } = useOnSelect(0, tokenRO);

    provider.once("block", () => {
      tokenRO.on(tokenRO.filters.Transfer(), async (from, to, tokenId) => {
        if (
          tokenId.toNumber() % tokensPerAsset.value == 0 &&
          tokenId.toNumber() >= tokens.value.length * tokensPerAsset.value
        ) {
          console.log("*** event.Transfer calling fetchToken");
          fetchPrimaryTokens();
        }
      });
    });

    const fetchPrimaryTokens = async () => {
      if (tokensPerAsset.value == 0) {
        const result = await tokenRO.functions.tokensPerAsset();
        tokensPerAsset.value = result[0].toNumber();
      }

      const resultSupply = await tokenRO.functions.totalSupply();
      const count = resultSupply[0].toNumber() / tokensPerAsset.value;

      fetchTokens(
        count,
        tokens.value,
        tokensPerAsset.value,
        0,
        assetStoreRO,
        tokenRO,
        (updateTokens) => {
          tokens.value = updateTokens;
        }
      );
    };
    fetchPrimaryTokens();

    const drawings = ref<Drawing[]>([]);
    const resultInfo = localStorage.getItem(keyInfo);
    //console.log("resultInfo", resultInfo);
    const info = ref<Info>(
      resultInfo ? JSON.parse(resultInfo) || baseInfo : baseInfo
    );
    //console.log("info", info.value);
    drawings.value = info.value.keys.map((key, index) => {
      const result = localStorage.getItem(key);
      //console.log("result", key, index, result);
      const drawing: Drawing = result ? JSON.parse(result) || {layers:[]} : {layers:[]};
      //console.log("drawing", drawing);
      return drawing;
    });
    //console.log("drawings", drawings.value);

    const showCanvas = ref<boolean>(false);
    const selectedIndex = ref<number>(9999);
    const selectedDrawing = ref<Drawing>({ layers: [], assetId: 0 });
    const onDrawingSelect = (index: number) => {
      selectedIndex.value = index;
      const drawing = drawings.value[index];
      const uuid = uuidv4();
      const asset: OriginalAssetData = {
        name: uuid,
        parts: drawing.layers.map((layer) => {
          return { body: layer.path, color: layer.color };
        }),
      };
      const actions: OriginalAssetDataSet = {
        group: "",
        category: "Drawing",
        width: 512,
        height: 512,
        assets: [asset],
      };
      const loadedAssets = loadAssets(actions);
      onSelect(loadedAssets[0]);
    };
    const onOpen = () => {
      selectedDrawing.value = drawings.value[selectedIndex.value];
      showCanvas.value = true;
    };
    const onCreate = () => {
      const keys = info.value.keys;
      // Prepare to open
      selectedIndex.value = keys.length;
      selectedDrawing.value = { layers: [], assetId: 0 };

      // Update the info and save it
      const array: Drawing[] = drawings.value.map((body) => body);
      array.push(selectedDrawing.value);
      drawings.value = array;
      keys.push(`${keyDrawing}${info.value.nextIndex}`);
      info.value = {
        nextIndex: info.value.nextIndex + 1,
        keys,
      };
      localStorage.setItem(keyInfo, JSON.stringify(info.value));

      showCanvas.value = true;
    };
    const onClose = (output: Drawing) => {
      drawings.value = drawings.value.map((drawing, index) => {
        if (index == selectedIndex.value) {
          return output;
        }
        return drawing;
      });
      localStorage.setItem(
        `${keyDrawing}${selectedIndex.value}`,
        JSON.stringify(output)
      );
      showCanvas.value = false;
      selection.value = null; // force redraw
      onDrawingSelect(selectedIndex.value);
    };
    return {
      showCanvas,
      onOpen,
      onCreate,
      onClose,
      onDrawingSelect,
      drawings,
      selectedDrawing,
      svgImageFromDrawing,
      selectedIndex,
      priceRange,
      tokensPerAsset,
      assetStoreRO,
      tokenAbi: contentsToken.wabi.abi,
      tokenName: "DrawYourOwnToken",
      selection,
      addresses,
      tokens,
      EtherscanStore,
      EtherscanToken,
      OpenSeaPath,
    };
  },
});
</script>
