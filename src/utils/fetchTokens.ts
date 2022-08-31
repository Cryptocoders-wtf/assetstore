import { ethers, BigNumber } from "ethers";
import { Token } from "@/models/token";
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
  const promises = Array(count)
    .fill({})
    .map(async (_, index) => {
      if (tokens[index]) {
        return tokens[index]; // we already have it
      }
      const tokenId = index * tokensPerAsset;

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
  tokens: Token[],
  tokensPerAsset: number,
  style: number,
  tokenRO: ethers.Contract,
  callback: (tokens: Token[]) => void
) => {
  const promises = Array(count)
    .fill({})
    .map(async (_, index) => {
      if (tokens[index]) {
        return tokens[index]; // we already have it
      }

      const tokenId = index * tokensPerAsset;
      const [earnedInWei] = await tokenRO.functions.totalEarned(tokenId);
      console.log("*** totalEarned", tokenId, weiToEther(earnedInWei));

      const svgPart = await tokenRO.functions.generateSVGPart(tokenId);
      //console.log(svgPart[1]);
      const svg = await tokenRO.functions.generateSVG(
        svgPart[0],
        style,
        svgPart[1]
      );
      //console.log(svg[0]);
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
