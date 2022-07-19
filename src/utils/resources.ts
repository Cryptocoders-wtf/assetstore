import { assetBase, compressPath } from "./pathUtils";
import { OriginalAssetData, OriginalAssetDataSet, OriginalAssetPart } from "@/models/asset";

export const createAsset = (
  _asset: OriginalAssetData,
  group: string,
  category: string,
  _width: number
) => {
  const asset = Object.assign({}, assetBase);
  asset.group = group;
  asset.category = category;
  asset.name = _asset.name;
  const width = _asset.width || _width;
  if (_asset.parts) {
    asset.parts = _asset.parts.map((part: OriginalAssetPart) => {
      part.color = part.color || "";
      part.body = compressPath(part.body as string, width);
      return part;
    });
  } else {
    asset.parts = [
      {
        color: "",
        body: compressPath(_asset.body || "", width),
      },
    ];
  }
  return asset;
};

export const loadAssets = (_resource: OriginalAssetDataSet) => {
  return _resource.assets.map((asset: OriginalAssetData) => {
    return createAsset(
      asset,
      _resource.group || "",
      _resource.category || "",
      _resource.width || 24
    );
  });
};
