<template>
  <div>
    <div class="mb-2 text-xl font-bold">Kamon Symbols by Hakko Daiodo</div>
    <KeyMessage />
    <AssetsPanel @on-select="(asset) => onSelect(asset)"
      :availableAssets="availableAssets" :loadedAssets="loadedAssets">
      <p v-if="lang === 'ja'" class="mb-2">
        * 家紋のベクトルデータは<a
          class="underline"
          href="http://hakko-daiodo.com"
          >発行大王堂様</a
        >よりご提供いただいています。
      </p>
      <p v-else class="mb-2">
        *All Kamon vector data were provided by
        <a class="underline" href="http://hakko-daiodo.com">Hakko Daiodo</a>.
      </p>
    </AssetsPanel>
    <MintPanel :selection="selection" :tokenAbi="tokenAbi" :addresses="addresses"
                :tokensPerAsset="tokensPerAsset" :assetStoreRO="assetStoreRO"
                :priceRange="{ low:0.04, high: 0.23 }"/>

    <NFTList :tokens="tokens" :OpenSeaPath="OpenSeaPath" />
    <References
      :EtherscanStore="EtherscanStore"
      :EtherscanToken="EtherscanToken"
      TokenName="KamonToken"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { ethers } from "ethers";
import { loadedAssets } from "../resources/kamon";
import {
  AssetData,
  OriginalAssetData,
  MintSelectionAsset,
} from "@/models/asset";
import { Token } from "@/models/token";
import References from "@/components/References.vue";
import NFTList from "@/components/NFTList.vue";
import KeyMessage from "@/components/KeyMessage.vue";
import MintPanel from "@/components/MintPanel.vue";
import AssetsPanel from "@/components/AssetsPanel.vue";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};
const KamonToken = {
  wabi: require("../abis/KamonToken.json"), // wrapped abi
};

export default defineComponent({
  name: "MintView",
  components: {
    References,
    NFTList,
    KeyMessage,
    MintPanel,
    AssetsPanel,
  },
  props: ["addresses"],
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    const store = useStore();

    const EtherscanBase =
      props.addresses.network == "rinkeby"
        ? "https://rinkeby.etherscan.io/address"
        : "https://etherscan.io/address";
    const OpenSeaBase =
      props.addresses.network == "rinkeby"
        ? "https://testnets.opensea.io/assets/rinkeby"
        : "https://opensea.io/assets/ethereum";
    const EtherscanStore = `${EtherscanBase}/${props.addresses.storeAddress}`;
    const EtherscanToken = `${EtherscanBase}/${props.addresses.kamonAddress}`;
    const OpenSeaPath = `${OpenSeaBase}/${props.addresses.kamonAddress}`;
    const assetIndex = loadedAssets.reduce(
      (prev: { [key: string]: AssetData }, asset: AssetData) => {
        prev[asset.name] = asset;
        return prev;
      },
      {}
    );
    const availableAssets = ref<AssetData[] | null>(null);

    console.log("* network", props.addresses.chainId);
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
    const tokenRO = new ethers.Contract(
      props.addresses.kamonAddress,
      KamonToken.wabi.abi,
      provider
    );
    const tokens = ref<Token[]>([]);
    const tokensPerAsset = ref(0);

    const selection = ref<MintSelectionAsset | null>(null);
    const onSelect = async (asset: OriginalAssetData) => {
      //console.log(asset);
      if (selection.value && selection.value.asset.name == asset.name) {
        selection.value = null;
        return;
      }
      selection.value = {
        isLoading: true,
        asset,
      };
      const promices = Array(tokensPerAsset.value - 1)
        .fill("")
        .map((_, index) => {
          return tokenRO.functions.generateSVG(asset.svgPart, index, "item");
        });
      const images = (await Promise.all(promices)).map((result) => {
        return (
          "data:image/svg+xml;base64," +
          Buffer.from(result[0]).toString("base64")
        );
      });
      selection.value = { images, asset };
    };

    provider.once("block", () => {
      tokenRO.on(tokenRO.filters.Transfer(), async (from, to, tokenId) => {
        if (
          tokenId.toNumber() % 4 == 0 &&
          tokenId.toNumber() >= tokens.value.length * 4
        ) {
          console.log("*** event.Transfer calling fetchToken");
          fetchTokens();
        }
      });
    });

    const fetchTokens = async () => {
      if (tokensPerAsset.value == 0) {
        const result = await tokenRO.functions.tokensPerAsset();
        tokensPerAsset.value = result[0].toNumber();
      }

      const resultSupply = await tokenRO.functions.totalSupply();
      const count = resultSupply[0].toNumber() / tokensPerAsset.value;
      const promises2 = Array(count)
        .fill({})
        .map(async (_, index) => {
          if (tokens.value[index]) {
            return index; // we already have it
          }

          if (index >= 0) {
            const result = await tokenRO.functions.assetIdOfToken(
              index * tokensPerAsset.value
            );
            const assetId = result[0].toNumber();
            const attr = await assetStoreRO.functions.getAttributes(assetId);
            const name = attr[0][2];

            const asset = assetIndex[name];
            if (asset) {
              asset.registered = true;
              // Hack: Even though the name is not unique enough, this is sufficient.
              if (selection.value && name == selection.value.asset.name) {
                selection.value = null;
              }
            }
          }
          return index;
        });
      await Promise.all(promises2);
      availableAssets.value = loadedAssets.filter(
        (asset: OriginalAssetData) => {
          return !asset.registered;
        }
      );

      const promises = Array(count)
        .fill({})
        .map(async (_, index) => {
          if (tokens.value[index]) {
            return tokens.value[index]; // we already have it
          }

          const result = await tokenRO.functions.assetIdOfToken(
            index * tokensPerAsset.value
          );
          const assetId = result[0].toNumber();
          const svgPart = await assetStoreRO.functions.generateSVGPart(
            assetId,
            "item"
          );
          const svg = await tokenRO.functions.generateSVG(
            svgPart[0],
            8,
            "item"
          );
          const image =
            "data:image/svg+xml;base64," +
            Buffer.from(svg[0]).toString("base64");
          return { image, tokenId: index * tokensPerAsset.value };
        });
      tokens.value = await Promise.all(promises);
    };
    fetchTokens();

    return {
      lang,
      availableAssets, loadedAssets,
      totalCount: loadedAssets.length,
      onSelect,
      selection,
      EtherscanStore,
      EtherscanToken,
      OpenSeaPath,
      tokens,
      tokensPerAsset,
      assetStoreRO,
      tokenAbi: KamonToken.wabi.abi,
    };
  },
});
</script>
