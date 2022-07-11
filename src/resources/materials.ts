import { loadAssets } from "../utils/createAsset";

import { assets } from "../../../contract/cache/alert";

export const actions = {
  group: "Material Icons (Apache 2.0)",
  category: "Alert",
  width: 24, height: 24,
  assets: assets
};

export const actionAssets = loadAssets(actions);
