export interface AssetData {
  name: string;
  assetId: number;
  image: string;
  index: number;
  svg: string;
}


// for import data
export interface OriginalAssetData {
  name: string;
  group?: string;
  category?: string;
  width?: number;
  height?: number;
  bodies?: string[];
  parts?: { body: string; }[]
  body?: string;
}
export interface OriginalAssetDataSet {
  group?: string;
  category?: string;
  width?: number;
  height: number;
  assets: OriginalAssetData[];
}
