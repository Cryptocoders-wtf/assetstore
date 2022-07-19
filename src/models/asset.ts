export interface AssetData {
  name: string;
  assetId: number;
  image: string;
  index: number;
  svg: string;
}


// for import data
export interface OriginalAssetPart {
  body: string | Uint8Array;
  color?: string;
};
export interface OriginalAssetData {
  name: string;
  group?: string;
  category?: string;
  width?: number;
  height?: number;
  bodies?: string[];
  parts?: OriginalAssetPart[]
  body?: string;
  svgPart?: string;
  registered?: boolean;
  minter?: string;
  soulbound?: string;
}
export interface OriginalAssetDataSet {
  group?: string;
  category?: string;
  width?: number;
  height: number;
  assets: OriginalAssetData[];
}

export interface MintSelectionAsset {
  isLoading?: boolean;
  asset: OriginalAssetData;
  images?: string[]; 
  soulbound?: string;
}
