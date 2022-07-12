import { loadAssets } from "../utils/createAsset";

import { assets } from "../../generated/communication";

export const actions = {
  group: "Material Icons (Apache 2.0)",
  category: "Communication",
  width: 24, height: 24,
  assets: assets
};

export const actionAssets = loadAssets(actions);
