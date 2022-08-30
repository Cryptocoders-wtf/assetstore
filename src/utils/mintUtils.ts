import { ref } from "vue";
import {
  AssetData,
  OriginalAssetData,
  MintSelectionAsset,
} from "@/models/asset";

import { ethers } from "ethers";

export const assetsReduce = (
  prev: { [key: string]: AssetData },
  asset: AssetData
) => {
  prev[asset.name] = asset;
  return prev;
};

export const assetFilter = (asset: OriginalAssetData) => {
  return !asset.registered;
};

export const useOnSelect = (initTokenPer: number, tokenRO: ethers.Contract) => {
  const tokensPerAsset = ref(initTokenPer); // hard-coded only for MaterialToken
  const selection = ref<MintSelectionAsset | null>(null);
  const onSelect = async (asset: OriginalAssetData, tag: string | null) => {
    /* We no longer unselect on selecting the same one
    if (selection.value && selection.value.asset.name == asset.name && asset.name != "") {
      selection.value = null;
      return;
    }
    */
    selection.value = {
      isLoading: true,
      asset,
    };
    const promises = Array(tokensPerAsset.value - 1)
      .fill("")
      .map((_, index) => {
        return tokenRO.functions.generateSVG(
          asset.svgPart,
          index,
          tag || "item"
        );
      });
    const images = (await Promise.all(promises)).map((result) => {
      return (
        "data:image/svg+xml;base64," + Buffer.from(result[0]).toString("base64")
      );
    });
    selection.value = { images, asset };
  };
  return { selection, onSelect, tokensPerAsset };
};
