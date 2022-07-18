import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/hardware";

export const actions = {
  group: "Material Icons (Apache 2.0)",
  category: "Hardware",
  width: 24,
  height: 24,
  assets: assets,
};

export const actionAssets = loadAssets(actions);
