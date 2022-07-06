import { loadAssets } from "../utils/createAsset";

import { action50 } from "../../../contract/cache/action50";

export const actions = {
  group: "Material Icons (Apache 2.0)",
  category: "UI Actions",
  width: 24, height: 24,
  assets: action50
};

export const actionAssets = loadAssets(actions);
