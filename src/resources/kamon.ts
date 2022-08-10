import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/kamon_assets";

export const actions = {
  group: "Hakko Daiodo (CC-BY equivalent)",
  category: "Idutsu",
  width: 24,
  height: 24,
  assets: assets,
};

export const loadedAssets = loadAssets(actions);
