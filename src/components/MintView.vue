<template>
  <div>
    <div class="mb-2 text-xl font-bold">{{ title }}</div>
    <KeyMessage />
    <AssetsPanel
      @on-select="(asset) => onSelect(asset)"
      :availableAssets="availableAssets"
      :loadedAssets="loadedAssets"
    >
      <slot />
    </AssetsPanel>
    <MintPanel
      :selection="selection"
      :tokenAbi="tokenAbi"
      :addresses="addresses"
      :tokensPerAsset="tokensPerAsset"
      :assetStoreRO="assetStoreRO"
      :priceRange="priceRange"
    />

    <NFTList :tokens="tokens" :OpenSeaPath="OpenSeaPath" />
    <References
      :EtherscanStore="EtherscanStore"
      :EtherscanToken="EtherscanToken"
      :TokenName="tokenName"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ethers } from "ethers";
import { loadedAssets } from "../resources/materials";
import { AssetData } from "@/models/asset";
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

export default defineComponent({
  name: "MintView",
  components: {
    References,
    NFTList,
    KeyMessage,
    MintPanel,
    AssetsPanel,
  },
  props: ["addresses", "title", "priceRange", "contentsToken", "options"],
  setup(props) {
    const { EtherscanStore, EtherscanToken, OpenSeaPath } = getAddresses(
      props.addresses.network,
      props.addresses.storeAddress,
      props.addresses.tokenAddress
    );
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
      props.contentsToken.wabi.abi,
      provider
    );
    const tokens = ref<Token[]>([]);
    const { onSelect, selection, tokensPerAsset } = useOnSelect(
      props.options.initTokenPer,
      tokenRO
    );

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
      const promises2 = Array(count)
        .fill({})
        .map(async (_, index) => {
          if (tokens.value[index]) {
            return index; // we already have it
          }

          if (index > props.options.tokenOffset) {
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
      availableAssets.value = loadedAssets.filter(assetFilter);

      fetchTokens(
        count,
        tokens.value,
        tokensPerAsset.value,
        props.options.svgStyle,
        assetStoreRO,
        tokenRO,
        (updateTokens) => {
          tokens.value = updateTokens;
        }
      );
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
      tokenAbi: props.contentsToken.wabi.abi,
      tokenName: props.options.tokenName,
    };
  },
});
</script>
