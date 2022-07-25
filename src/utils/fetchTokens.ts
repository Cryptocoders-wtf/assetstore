import { ethers } from "ethers";
import { Token } from "@/models/token";

export const fetchTokens = async (count:number, tokens:Token[], tokensPerAsset: number, style: number,
    assetStoreRO: ethers.Contract, tokenRO:ethers.Contract, callback:(tokens:Token[])=>void) => {
  const promises = Array(count)
    .fill({})
    .map(async (_, index) => {
      if (tokens[index]) {
        return tokens[index]; // we already have it
      }

      const result = await tokenRO.functions.assetIdOfToken(
        index * tokensPerAsset
      );
      const assetId = result[0].toNumber();
      const svgPart = await assetStoreRO.functions.generateSVGPart(
        assetId,
        "item"
      );
      const svg = await tokenRO.functions.generateSVG(
        svgPart[0],
        style,
        "item"
      );
      const image =
        "data:image/svg+xml;base64," +
        Buffer.from(svg[0]).toString("base64");
      return { image, tokenId: index * tokensPerAsset };
    });
  callback(await Promise.all(promises));
};