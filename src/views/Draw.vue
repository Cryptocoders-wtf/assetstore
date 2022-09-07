<template>
  <div>
    <div class="mx-auto p-2 pl-8 pr-8 text-left">
      <div class="mb-2 text-xl font-bold">{{ "Draw Your Own NFT" }}</div>
      <Canvas
        v-if="showCanvas"
        @close="onClose"
        class="z-10"
        :drawing="selectedDrawing"
        :remixes="remixes"
        :addresses="addresses"
      />
      <div v-else>
        <div class="mb-4 flex flex-wrap">
          <div
            v-for="(drawing, index) in drawings"
            :key="index"
            @click="onDrawingSelect(index)"
            :class="`border-2 ${
              index == selectedIndex ? 'border-blue-700' : 'border-white'
            }`"
          >
            <drawing-item :drawing="drawing" />
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
          v-if="selection"
          :selection="selection"
          :tokenAbi="tokenAbi"
          :addresses="addresses"
          :tokensPerAsset="tokensPerAsset"
          :assetStoreRO="assetStoreRO"
          :priceRange="priceRange"
          :drawing="selectedDrawing"
          @minted="minted"
        >
          <p class="mb-2">
            {{ $tc("mintPanel.cc0Message") }}
          </p>
        </MintPanel>
      </div>
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
import Canvas from "@/components/Canvas/Canvas.vue";
import {
  Drawing,
  identityTransform,
  Layer,
  svgImageFromPath,
  pathFromPoints,
  transformString,
  Remix,
} from "@/models/point";
import DrawingItem from "@/components/Canvas/DrawingItem.vue";
import MintPanel from "@/components/MintPanel.vue";
import { getContractAddresses } from "@/utils/networks";
import { useOnSelect } from "@/utils/mintUtils";
import { loadAssets } from "../utils/createAsset";
import { Token } from "@/models/token";
import { fetchTokensRemix } from "@/utils/fetchTokens";
import { getAddresses } from "@/utils/const";
import References from "@/components/References.vue";
import NFTList from "@/components/NFTList.vue";
import { OriginalAssetData, OriginalAssetDataSet } from "@/models/asset";
import { roundRect } from "@/utils/canvasUtil";
import { weiToEther } from "@/utils/currency";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};

const contentsToken = {
  wabi: require("../abis/DrawYourOwn.json"), // wrapped abi
};

const AssetComposer = {
  wabi: require("@/abis/AssetComposer.json"), // wrapped abi
};

const AssetStoreProvider = {
  wabi: require("@/abis/AssetStoreProvider.json"), // wrapped abi
};

interface Info {
  nextIndex: number;
  keys: string[];
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
    const assetComposer = new ethers.Contract(
      addresses.composerAddress,
      AssetComposer.wabi.abi,
      provider
    );

    const remixes = ref<Remix[]>([]);
    const tokens = ref<Token[]>([]);
    const { onSelect, selection, tokensPerAsset } = useOnSelect(4, tokenRO);

    provider.once("block", async () => {
      tokenRO.on(tokenRO.filters.Transfer(), async (from, to, tokenId) => {
        if (
          tokenId.toNumber() % tokensPerAsset.value == 0 &&
          tokenId.toNumber() >= tokens.value.length * tokensPerAsset.value
        ) {
          console.log("*** event.Transfer calling fetchToken");
          fetchPrimaryTokens();
        }
      });
      // event Payout(string providerKey, uint256 assetId, address payable to, uint256 amount);
      const [providerId] = await assetComposer.functions.getProviderId("asset");
      console.log("providerId", providerId);
      const [assetInfo] = await assetComposer.functions.getProvider(providerId);
      console.log(
        "assetInfo",
        assetInfo.key,
        assetInfo.name,
        assetInfo.provider
      );
      const assetStoreProvider = new ethers.Contract(
        assetInfo.provider,
        AssetStoreProvider.wabi.abi,
        provider
      );

      assetStoreProvider.on(
        assetStoreProvider.filters.Payout(),
        async (providerKey, assetId, to, amount) => {
          console.log(
            "*** event.PayedOut",
            providerKey,
            assetId.toNumber(),
            to,
            weiToEther(amount)
          );
        }
      );
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
        remixes.value,
        tokensPerAsset.value,
        0,
        tokenRO,
        (updateTokens) => {
          remixes.value = updateTokens;
          tokens.value = updateTokens.map((remix) => {
            return { tokenId: remix.tokenId!, image: remix.image! };
          });
        }
      );
    };
    fetchPrimaryTokens();

    const drawings = ref<Drawing[]>([]);
    const resultInfo = localStorage.getItem(keyInfo);
    const info = ref<Info>(
      resultInfo ? JSON.parse(resultInfo) || baseInfo : baseInfo
    );
    // console.log("** info", info.value.nextIndex, info.value.keys);
    drawings.value = info.value.keys.map((key, index) => {
      const result = localStorage.getItem(key);
      //console.log("result", key, index, result);
      const drawing: Drawing = result
        ? JSON.parse(result) || { layers: [] }
        : { layers: [] };

      // Backward compativility
      drawing.overlays = drawing.overlays || [];
      drawing.remix = drawing.remix || { transform: identityTransform };
      drawing.layers = drawing.layers.map((layer) => {
        layer.points = layer.points.map((point) => {
          point.r = point.r || 0.553;
          return point;
        });
        return layer;
      });

      // console.log("** setup:overlays.length", index, drawing.layers.length, drawing.overlays.length);
      return drawing;
    });
    //console.log("drawings", drawings.value);

    const showCanvas = ref<boolean>(false);
    const selectedIndex = ref<number>(9999);
    const selectedDrawing = computed(() => {
      return drawings.value[selectedIndex.value];
    });
    const onDrawingSelect = async (index: number) => {
      selectedIndex.value = index;
      const drawing = selectedDrawing.value;
      const asset: OriginalAssetData = {
        name: "", // the contract will specify
        parts: drawing.layers.map((layer) => {
          return { body: layer.path, color: layer.color };
        }),
      };
      const dataset: OriginalAssetDataSet = {
        group: "", // the contract will specify
        category: "CC0 Drawing (50)",
        width: 1024,
        height: 1024,
        assets: [asset],
      };
      const loadedAssets = loadAssets(dataset);
      let tag = "item";

      const remix = {
        def: "",
        use: "",
      };
      if (drawing.remix.image) {
        const result = await tokenRO.functions.generateSVGPart(
          drawing.remix.tokenId
        );
        remix.def = result[0];
        remix.use = ` <use href="#${result[1]}" transform="${
          remixTransformString.value
        }" fill="${drawing.remix.color || ""}" />\n`;
      }
      loadedAssets[0].svgPart =
        loadedAssets[0].svgPart +
        remix.def +
        "\n" +
        drawing.overlays.map((overlay) => overlay.svgPart).join("") +
        `<g id="mixed">\n` +
        remix.use +
        ` <use href="#item" />\n` +
        drawing.overlays
          .map(
            (overlay) =>
              ` <use href="#${overlay.svgTag}" 
                     transform="${transformString(overlay.transform)}"
                     fill="${overlay.fill}" />\n`
          )
          .join("") +
        `</g>\n`;
      tag = "mixed";
      onSelect(loadedAssets[0], tag);
    };
    const onOpen = () => {
      showCanvas.value = true;
    };
    const onDelete = () => {
      info.value = {
        keys: info.value.keys.filter((_, index) => {
          return index !== selectedIndex.value;
        }),
        nextIndex: info.value.nextIndex, // Notice that we don't decrement!
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
      const path = pathFromPoints(roundRect);
      const layer: Layer = {
        points: roundRect,
        color: "",
        path,
        svgImage: svgImageFromPath(path, ""),
      };
      const drawing: Drawing = {
        layers: [layer],
        overlays: [],
        remix: { tokenId: 0, transform: identityTransform },
      };

      const newDrawings: Drawing[] = drawings.value.map((body) => body);
      newDrawings.push(drawing);
      drawings.value = newDrawings;

      // Update the info and save it
      const key = `${keyDrawing}${info.value.nextIndex}`;
      keys.push(key);
      localStorage.setItem(key, JSON.stringify(drawing));
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
      console.log("** onClose:overlays.length", output.overlays.length);
      drawings.value = drawings.value.map((drawing, index) => {
        if (index == selectedIndex.value) {
          return output;
        }
        return drawing;
      });
      localStorage.setItem(
        info.value.keys[selectedIndex.value],
        JSON.stringify(output)
      );
      showCanvas.value = false;
      selection.value = null; // force redraw
      onDrawingSelect(selectedIndex.value);
    };
    const remixTransformString = computed(() => {
      const xf = selectedDrawing.value.remix.transform;
      return transformString(xf);
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
      remixes,
      EtherscanStore,
      EtherscanToken,
      OpenSeaPath,
      remixTransformString,
      minted,
    };
  },
});
</script>
