import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/emoji_assets";

export const actions = {
  group: "Open Emoji (CC-BY)",
  category: "Flags",
  width: 72,
  height: 72,
  assets: assets,
};

export const loadedAssets = loadAssets(actions);
