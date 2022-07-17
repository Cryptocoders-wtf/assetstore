import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/kamon_assets";

export const actions = {
  group: "Hakko Daiodo (CC-BY equivalent)",
  category: "Kamon",
  width: 24, height: 24,
  assets: assets
};

export const loadedAssets = loadAssets(actions);
