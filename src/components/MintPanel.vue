<template>
  <div
    v-if="selection && !selection.asset.registered"
    class="mt-2 rounded-xl border pl-2 pr-2 shadow-md"
  >
    <p class="mt-2">
      <b>
        <span v-if="!drawing">{{ selection.asset.name }}, </span>
        {{ selection.asset.category }}</b
      >
    </p>

    <div v-if="selection.isLoading">
      <img
        :src="selection.asset.image"
        class="m-2 inline-block w-16 rounded-xl"
      />
      <p class="mb-40">{{ $t("mintPanel.preparing") }}</p>
    </div>
    <div v-else>
      <img
        v-for="image in selection.images"
        :key="image"
        :src="image"
        class="m-2 inline-block w-16 rounded-xl"
      />
      <div v-if="messageRef" class="mb-2">
        <div v-if="messageRef == 'message.minting'">
          <p>{{ $t("message.processing") }}</p>
        </div>
        <div v-else-if="messageRef == 'message.minted'">
          <p>
            {{ $t("mintPanel.thanks") }}
          </p>
        </div>
        <div
          v-else-if="messageRef == 'message.not_available'"
          class="text-red-400"
        >
          <p>
            {{ $t("mintPanel.sorry") }}
          </p>
        </div>
        <div v-else>
          <p>{{ $t("mintPanel.error1") }}</p>
          <p class="text-red-400">{{ messageRef }}</p>
          <p>{{ $t("mintPanel.error2") }}</p>
        </div>
      </div>
      <span v-else>
        <NetworkGate :expectedNetwork="addresses.chainId">
          <div class="mb-4">
            <label class="mb-1 block text-sm text-gray-700" for="username">
              {{ $t("mintPanel.writeName") }}
              <span :class="validName ? '' : 'font-bold text-red-600'">{{
                $t("mintPanel.maxLength")
              }}</span>
            </label>
            <input
              v-model.trim="minterName"
              class="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
              id="username"
              type="text"
              :placeholder="$t('mintPanel.placeHolder')"
            />
            <span v-if="validName">
              <button
                @click="mint"
                class="mt-2 inline-block rounded bg-green-600 px-6 py-2.5 leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg"
              >
                {{ $t("mintPanel.mint") }}
              </button>
            </span>
            <span v-else>
              <button
                @click="mint"
                disabled
                class="mt-2 inline-block rounded bg-gray-400 px-6 py-2.5 leading-tight text-gray-200 shadow-md"
              >
                {{ $t("mintPanel.mint") }}
              </button>
            </span>
          </div>
          <div>
            <slot />
            <p class="mb-2">
              {{
                $tc("mintPanel.mintMessage1", {
                  low: priceRange.low,
                  high: priceRange.high,
                })
              }}
            </p>
            <p class="mb-2">
              {{
                $tc("mintPanel.mintMessage2", {
                  tokensPerAsset: tokensPerAsset - 1,
                  bonousTokensPerAsset: tokensPerAsset - 2,
                })
              }}
            </p>
          </div>
        </NetworkGate>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { ethers } from "ethers";
import NetworkGate from "@/components/NetworkGate.vue";
import { identityTransform, Transform, Drawing } from "@/models/point";
import { weiToEther } from "@/utils/currency";

export default defineComponent({
  props: [
    "selection",
    "addresses",
    "tokensPerAsset",
    "tokenAbi",
    "assetStoreRO",
    "priceRange",
    "drawing",
    "isRemix",
  ],
  components: {
    NetworkGate,
  },
  setup(props, context) {
    const route = useRoute();
    const store = useStore();

    const affiliateId =
      typeof route.query.ref == "string" ? parseInt(route.query.ref) || 0 : 0;

    const networkContext = computed(() => {
      if (
        store.state.account &&
        store.state.chainId == props.addresses.chainId
      ) {
        const provider = new ethers.providers.Web3Provider(
          store.state.ethereum
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          props.addresses.tokenAddress,
          props.tokenAbi,
          signer
        );

        return { provider, signer, contract };
      }
      return null;
    });

    const minterName = ref("");
    const validName = computed(() => {
      const length = encoder.encode(minterName.value).length;
      return length <= 32;
    });
    const messageRef = ref<string | null>(null);
    watch(
      () => props.selection,
      () => {
        messageRef.value = null;
      }
    );
    const encoder = new TextEncoder();
    const mint = async () => {
      //console.log("*** mint", selection.value.asset.asset);
      if (!networkContext.value) {
        console.error("Mint: we are not supposed to come here");
        return;
      }
      if (!props.selection) {
        console.error("Mint: no selection");
        return;
      }
      const asset = props.selection.asset;
      try {
        const result = await props.assetStoreRO.functions.getAssetIdWithName(
          asset.group,
          asset.category,
          asset.name
        );
        // Double-check if it's already minted
        if (result[0].toNumber() > 0) {
          messageRef.value = "message.not_available";
          return;
        }
      } catch (e) {
        // this is success
      }
      const transformString = (xf: Transform) => {
        if (
          xf.tx == identityTransform.tx &&
          xf.ty == identityTransform.ty &&
          xf.scale == identityTransform.scale &&
          xf.rotate == identityTransform.rotate
        ) {
          return "";
        }
        const d = Math.round(512 * (xf.scale - 1));
        return (
          `translate(${xf.tx - d} ${xf.ty - d}) ` +
          `scale(${xf.scale}) rotate(${xf.rotate} 512 512)`
        );
      };

      asset.soulbound = await networkContext.value.signer.getAddress();
      //console.log(asset.soulbound);
      try {
        messageRef.value = "message.minting";
        asset.minter = minterName.value;
        asset.group = ""; // gas saving
        let tx;
        if (props.drawing) {
          const drawing = props.drawing as Drawing;
          const hasRemix = drawing.remix.image;
          const remixes = hasRemix
            ? [
                {
                  tokenId: drawing.remix.tokenId,
                  fill: drawing.remix.color || "",
                  transform: transformString(drawing.remix.transform),
                },
              ]
            : [];
          const txParams: any = {};
          if (hasRemix) {
            const mintPrice = await networkContext.value.contract.mintPrice();
            console.log("*** minting", remixes.length, drawing.overlays.length, weiToEther(mintPrice));
            txParams.value = mintPrice;
          } else {
            console.log("*** minting", remixes.length, drawing.overlays.length);
          }

          const overlays = drawing.overlays.map((overlay) => {
            return {
              assetId: overlay.assetId,
              provider: overlay.provider,
              fill: overlay.fill,
              transform: transformString(overlay.transform),
            };
          });
          // console.log("overlays", overlays);
          tx = await networkContext.value.contract.mintWithAsset(
            asset,
            affiliateId,
            remixes,
            overlays,
            txParams
          );
        } else {
          tx = await networkContext.value.contract.mintWithAsset(
            asset,
            affiliateId
          );
        }
        const result = await tx.wait();
        console.log("mint:gasUsed", result.gasUsed.toNumber());
        messageRef.value = "message.minted";
        context.emit("minted");
      } catch (e: any) {
        console.log("*** mint error", e);
        messageRef.value = e.message;
      }
    };
    return {
      minterName,
      validName,
      mint,
      messageRef,
    };
  },
});
</script>
