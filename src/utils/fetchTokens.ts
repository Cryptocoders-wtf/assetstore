import { ethers, BigNumber } from "ethers";
import { Token } from "@/models/token";
import { identityTransform, Remix } from "@/models/point";
import { weiToEther } from "@/utils/currency";

export const fetchTokens = async (
  count: number,
  tokens: Token[],
  tokensPerAsset: number,
  style: number,
  assetStoreRO: ethers.Contract,
  tokenRO: ethers.Contract,
  callback: (tokens: Token[]) => void
) => {
  const length = Math.min(4, count);
  const offset = count - length;
  const promises = Array(length)
    .fill({})
    .map(async (_, index) => {
      if (tokens[index]) {
        return tokens[index]; // we already have it
      }
      const tokenId = (offset + index) * tokensPerAsset;
      console.log("*** Fetching", tokenId);
      const result = await tokenRO.functions.assetIdOfToken(tokenId);
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
        "data:image/svg+xml;base64," + Buffer.from(svg[0]).toString("base64");
      return { image, tokenId: index * tokensPerAsset };
    });

  // Sequential version of callback(await Promise.all(promises));
  const updateTokens: Token[] = [];
  let i;
  for (i = 0; i < promises.length; i++) {
    const token = await promises[i];
    updateTokens.push(token);
    callback(
      updateTokens.map((token) => {
        return token;
      })
    );
  }
};

export const fetchTokensRemix = async (
  count: number,
  tokens: Remix[],
  tokensPerAsset: number,
  style: number,
  tokenRO: ethers.Contract,
  callback: (tokens: Remix[]) => void
) => {
  const promises = Array(count)
    .fill({})
    .map(async (_, index): Promise<Remix | null> => {
      if (tokens[index]) {
        return tokens[index]; // we already have it
      }

      const tokenId = index * tokensPerAsset;

      try {
        const [svgPart, svgTag] = await tokenRO.functions.generateSVGPart(
          tokenId
        );
        const svg = await tokenRO.functions.generateSVG(svgPart, style, svgTag);
        const image =
          "data:image/svg+xml;base64," + Buffer.from(svg[0]).toString("base64");
        return {
          image,
          tokenId: index * tokensPerAsset,
          svgPart,
          svgTag,
          transform: identityTransform,
        };
      } catch (e: any) {
        console.error("failed to generateSVG");
        return null;
      }
    });

  // Sequential version of callback(await Promise.all(promises));
  const updateTokens: Remix[] = [];
  let i;
  for (i = 0; i < promises.length; i++) {
    const token = await promises[i];
    if (token) {
      updateTokens.push(token);
      callback(updateTokens.map((token) => token));
    }
  }
};
