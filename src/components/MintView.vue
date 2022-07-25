<template>
  <div>
    <div class="mb-2 text-xl font-bold">Google Material Icons</div>
    <KeyMessage />
    <AssetsPanel
      @on-select="(asset: OriginalAssetData) => onSelect(asset)"
      :availableAssets="availableAssets"
      :loadedAssets="loadedAssets"
    />
    <MintPanel
      :selection="selection"
      :tokenAbi="tokenAbi"
      :addresses="addresses"
      :tokensPerAsset="tokensPerAsset"
      :assetStoreRO="assetStoreRO"
      :priceRange="{ low: 0.05, high: 0.15 }"
    />

    <NFTList :tokens="tokens" :OpenSeaPath="OpenSeaPath" />
    <References
      :EtherscanStore="EtherscanStore"
      :EtherscanToken="EtherscanToken"
      TokenName="MaterialToken"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { ethers } from "ethers";
import { loadedAssets } from "../resources/materials";
import {
  AssetData,
  OriginalAssetData,
} from "@/models/asset";
import { Token } from "@/models/token";
import References from "@/components/References.vue";
import NFTList from "@/components/NFTList.vue";
import KeyMessage from "@/components/KeyMessage.vue";
import MintPanel from "@/components/MintPanel.vue";
import AssetsPanel from "@/components/AssetsPanel.vue";
import { assetsReduce, useOnSelect, assetFilter } from "@/utils/mintUtils";
import { fetchTokens } from "@/utils/fetchTokens";
import { getAddresses } from "@/utils/const";

const AssetStore = {
  wabi: require("../abis/AssetStore.json"), // wrapped abi
};
const MaterialToken = {
  wabi: require("../abis/MaterialToken.json"), // wrapped abi
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
    const {
      EtherscanBase,
      OpenSeaBase,
      EtherscanStore,
      EtherscanToken,
      OpenSeaPath,
    } = getAddresses(props.addresses.network, props.addresses.storeAddress, props.addresses.tokenAddress) 
    const assetIndex = loadedAssets.reduce(assetsReduce, {});
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
      props.addresses.tokenAddress,
      MaterialToken.wabi.abi,
      provider
    );
    const tokens = ref<Token[]>([]);
    const {onSelect, selection, tokensPerAsset } = useOnSelect(4, tokenRO);

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
      const result = await tokenRO.functions.totalSupply();
      const count = result[0].toNumber() / tokensPerAsset.value;
      const promises2 = Array(count)
        .fill({})
        .map(async (_, index) => {
          if (tokens.value[index]) {
            return index; // we already have it
          }

          if (index > 580) {
            const result = await tokenRO.functions.assetIdOfToken(index * 4);
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
      availableAssets.value = loadedAssets.filter(assetFilter);

      fetchTokens(count, tokens.value, tokensPerAsset.value, 0, assetStoreRO, tokenRO, (updateTokens) => {
        tokens.value = updateTokens;
      });
    };
    fetchPrimaryTokens();

    return {
      availableAssets,
      loadedAssets,
      onSelect,
      selection,
      EtherscanStore,
      EtherscanToken,
      OpenSeaPath,
      tokens,
      tokensPerAsset,
      assetStoreRO,
      tokenAbi: MaterialToken.wabi.abi,
    };
  },
});
</script>
