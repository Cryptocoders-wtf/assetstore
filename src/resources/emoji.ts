import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/emoji_assets";

export const actions = {
  group: "OpenMoji (CC BY-SA 4.0)",
  category: "Flags",
  width: 72,
  height: 72,
  assets: assets,
};

export const loadedAssets = loadAssets(actions);
