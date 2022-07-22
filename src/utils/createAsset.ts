import { assetBase, compressPath, normalizePath } from "./pathUtils";
import {
  OriginalAssetData,
  OriginalAssetDataSet,
  OriginalAssetPart,
} from "@/models/asset";

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
  asset.metadata = new Uint8Array();
  const width = _asset.width || _width;
  const svgPath = (() => {
    if (_asset.parts) {
      return _asset.parts
        .map((part: OriginalAssetPart) => {
          const path = normalizePath(part.body as string, width);
          return `<path d="${path}" />`;
        })
        .join("");
    } else if (_asset.bodies) {
      return _asset.bodies
        .map((body0: string) => {
          const path = normalizePath(body0, width);
          return `<path d="${path}" />`;
        })
        .join("");
    } else {
      const path = normalizePath(_asset.body || "", width);
      return `<path d="${path}" />`;
    }
  })();
  asset.parts = (() => {
    if (_asset.parts) {
      return _asset.parts.map((part: OriginalAssetPart) => {
        part.color = part.color || "";
        part.body = compressPath(part.body as string, width);
        return part;
      });
    } else if (_asset.bodies) {
      return _asset.bodies.map((body0: string) => {
        const body = compressPath(body0, width);
        return { body, color: "" };
      });
    } else {
      return [
        {
          color: "",
          body: compressPath(_asset.body || "", width),
        },
      ];
    }
  })();
  //asset.svgPath = svgPath;
  asset.svgPart = `<g id="item">${svgPath}</g>`;
  asset.svg =
    '<svg viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg">' +
    asset.svgPart +
    "</svg>";
  asset.image =
    "data:image/svg+xml;base64," + Buffer.from(asset.svg).toString("base64");
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
