<template>
  <div>
    <Canvas
      v-if="showCanvas"
      @close="onClose"
      :drawing="selectedDrawing"
      :tokens="tokens"
      :addresses="addresses"
    />

    <div class="mx-auto max-w-xl p-2 text-left">
      <div class="mb-2 text-xl font-bold">{{ "Draw Your Own Token" }}</div>
      <div class="flex flex-wrap">
        <div
          v-for="(drawing, index) in drawings"
          :key="index"
          @click="onDrawingSelect(index)"
          :class="`border-2 ${
            index == selectedIndex ? 'border-blue-700' : 'border-white'
          }`"
        >
          <drawing-item :drawing="drawing" :tokens="tokens" />
          <div
            v-if="index == selectedIndex"
            class="ml-2 mr-2 flex justify-between"
          >
            <button @click="onOpen">
              <span class="material-icons">edit</span>
            </button>
            <div>
              <button @click.stop="onDelete">
                <span class="material-icons">delete</span>
              </button>
            </div>
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
        :isRemix="true"
        :remixId="remixId"
        :remixTransform="remixTransformString"
        @minted="minted"
      >
        <p class="mb-2">
          {{ $tc("mintPanel.cc0Message") }}
        </p>
      </MintPanel>
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
import { defineComponent, ref, computed } from "vue";
import { ethers } from "ethers";
import { useRoute } from "vue-router";
import Canvas from "@/components/Canvas.vue";
import { Drawing, Transform } from "@/models/point";
import DrawingItem from "@/components/DrawingItem.vue";
import MintPanel from "@/components/MintPanel.vue";
import { getContractAddresses } from "@/utils/networks";
import { useOnSelect } from "@/utils/mintUtils";
import { loadAssets } from "../utils/createAsset";
import { Token } from "@/models/token";
import { fetchTokensRemix } from "@/utils/fetchTokens";
import { getAddresses } from "@/utils/const";
import References from "@/components/References.vue";
import NFTList from "@/components/NFTList.vue";
import { v4 as uuidv4 } from "uuid";
import { OriginalAssetData, OriginalAssetDataSet } from "@/models/asset";

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
    DrawingItem,
  },
  setup() {
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "mainnet";
    const addresses = getContractAddresses(network)!;
    addresses.tokenAddress = addresses.drawAddress;

    // Temporary code
    const remixId = ref<number>(0);
    const remixTransform = ref<Transform | null>(null);

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
    const { onSelect, selection, tokensPerAsset } = useOnSelect(4, tokenRO);

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

      fetchTokensRemix(
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
    const info = ref<Info>(
      resultInfo ? JSON.parse(resultInfo) || baseInfo : baseInfo
    );
    //console.log("info", info.value);
    drawings.value = info.value.keys.map((key) => {
      const result = localStorage.getItem(key);
      //console.log("result", key, index, result);
      const drawing: Drawing = result
        ? JSON.parse(result) || { layers: [] }
        : { layers: [] };
      //console.log("drawing", drawing);
      return drawing;
    });
    //console.log("drawings", drawings.value);

    const showCanvas = ref<boolean>(false);
    const selectedIndex = ref<number>(9999);
    const selectedDrawing = ref<Drawing>({ layers: [], remixId: 0, transform:null });
    const onDrawingSelect = async (index: number) => {
      selectedIndex.value = index;
      const drawing = drawings.value[index];
      console.log("onDrawingSelect", drawing.transform);
      const uuid = uuidv4();
      const asset: OriginalAssetData = {
        name: uuid,
        parts: drawing.layers.map((layer) => {
          return { body: layer.path, color: layer.color };
        }),
      };
      const actions: OriginalAssetDataSet = {
        group: "",
        category: "CC0 Drawing (23)",
        width: 1024,
        height: 1024,
        assets: [asset],
      };
      const loadedAssets = loadAssets(actions);
      let tag = "item";
      //console.log(loadedAssets[0].svgPart);
      remixId.value = drawing.remixId;
      remixTransform.value = drawing.transform;
      if (drawing.remixId) {
        const result = await tokenRO.functions.generateSVGPart(drawing.remixId);
        console.log("** mix-in", result[1], remixTransformString.value);
        loadedAssets[0].svgPart =
          result[0] +
          loadedAssets[0].svgPart +
          `<g id="mixed">\n` +
          ` <use href="#${result[1]}" transform="${remixTransformString.value}" />\n` +
          ` <use href="#item" />\n` +
          `</g>\n`;
        tag = "mixed";
      }
      onSelect(loadedAssets[0], tag);
    };
    const onOpen = () => {
      selectedDrawing.value = drawings.value[selectedIndex.value];
      console.log("onOpen", selectedDrawing.value.transform);
      showCanvas.value = true;
    };
    const onDelete = () => {
      info.value = {
        keys: info.value.keys.filter((_, index) => {
          return index !== selectedIndex.value;
        }),
        nextIndex: info.value.nextIndex - 1,
      };
      drawings.value = drawings.value.filter((_, index) => {
        return index !== selectedIndex.value;
      });
      if (info.value.keys.length === selectedIndex.value) {
        selectedIndex.value = selectedIndex.value - 1;
      }
      onDrawingSelect(selectedIndex.value);
      localStorage.setItem(keyInfo, JSON.stringify(info.value));
    };
    const onCreate = () => {
      const keys = info.value.keys;
      // Prepare to open
      selectedIndex.value = keys.length;
      selectedDrawing.value = { layers: [], remixId: 0, transform: null };

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
    const minted = () => {
      console.log("minted");
      selection.value = null;
      selectedIndex.value = 9999;
    };
    const onClose = (output: Drawing) => {
      console.log("onClose:transform", output.transform);
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
    const remixTransformString = computed(() => {
      const xf = remixTransform.value;
      if (xf == null) {
        return "";
      }
      const d = Math.round(512 * (xf.scale - 1))
      return (
        `translate(${xf.tx - d} ${xf.ty - d}) ` +
        `scale(${xf.scale}) rotate(${xf.rotate} 512 512)`
      );
    });
    return {
      showCanvas,
      onOpen,
      onDelete,
      onCreate,
      onClose,
      onDrawingSelect,
      drawings,
      selectedDrawing,
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
      remixId,
      remixTransformString,
      minted,
    };
  },
});
</script>
