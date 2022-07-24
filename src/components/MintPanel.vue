<template>
  <div>
    <p class="mt-2">
      <b>{{ selection.asset.name }}, {{ selection.asset.category }}</b>
    </p>
    <div v-if="selection.isLoading">
      <img
        :src="selection.asset.image"
        class="w-16 inline-block rounded-xl m-2"
      />
      <p v-if="lang === 'ja'" class="mb-40">ミントの準備中...</p>
      <p v-else class="mb-40">Preparing to mint...</p>
    </div>
    <div v-else>
      <img
        v-for="image in selection.images"
        :key="image"
        :src="image"
        class="w-16 inline-block rounded-xl m-2"
      />
      <div v-if="messageRef" class="mb-2">
        <div v-if="messageRef == 'message.minting'">
          <p v-if="lang === 'ja'">処理中です...</p>
          <p v-else>Processing...</p>
        </div>
        <div v-else-if="messageRef == 'message.minted'">
          <p v-if="lang === 'ja'">
            クラウドミンティングにご協力ありがとうございます。ブロックチェーンへの反映には少し時間がかかります。
            順調に反映されれば、このメッセージは自動的に消滅します。
          </p>
          <p v-else>
            Thank you for participating in this crowd-minting effort. When the
            blockchain is updated, this message will dissapear automatically.
          </p>
        </div>
        <div
          v-else-if="messageRef == 'message.not_available'"
          class="text-red-400"
        >
          <p v-if="lang === 'ja'">
            残念ながら、他のユーザーによりちょうどミントされたところです。別の画像を選択してください。
          </p>
          <p v-else>
            Another user has just minted this NFT. Please select another
            image.
          </p>
        </div>
        <div v-else>
          <p v-if="lang === 'ja'">以下のエラーメッセージを受け取りました。</p>
          <p v-else>We have received the following error message.</p>
          <p class="text-red-400">{{ messageRef }}</p>
          <p v-if="lang === 'ja'">再度、画像の選択からやり直してください。</p>
          <p v-else>Please try again from the selection of an image.</p>
        </div>
      </div>
      <span v-else>
        <NetworkGate :expectedNetwork="addresses.chainId">
          <div class="mb-4">
            <label
              v-if="lang === 'ja'"
              class="block text-gray-700 text-sm mb-1"
              for="username"
            >
              Asset Storeに刻み込む名前。
              <span v-if="validName">最大32バイト。</span>
              <span v-else class="text-red-600">最大32バイト。</span>
            </label>
            <label
              v-else
              class="block text-gray-700 text-sm mb-1"
              for="username"
            >
              Name to be permanently stored to the Asset Store.
              <span v-if="validName">Maximum 32 bytes.</span>
              <span v-else class="text-red-600">Maximum 32 bytes.</span>
            </label>
            <input
              v-model.trim="minterName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              :placeholder="
                lang === 'ja'
                  ? 'お名前（オプション、Twitter名推奨）'
                  : 'Name (such as Twitter Id, optional)'
              "
            />
            <span v-if="validName">
              <button
                @click="mint"
                class="mt-2 inline-block px-6 py-2.5 bg-green-600 text-white leading-tight rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
              >
                Mint
              </button>
            </span>
            <span v-else>
              <button
                @click="mint"
                disabled
                class="mt-2 inline-block px-6 py-2.5 bg-gray-400 text-gray-200 leading-tight rounded shadow-md"
              >
                Mint
              </button>
            </span>
          </div>
          <div v-if="lang === 'ja'">
            <p class="mb-2">
              フリーミントですが、ガス代が{{priceRange.low}}〜{{priceRange.high}}ETH程度かかります（画像の複雑さや混雑状況によって大きく変動）。
            </p>
            <p class="mb-2">
              クラウドミンティングにご協力していただいた方には、
              「プライマリーNFT」と呼ばれるあなたがクラウドミンティングに協力した証のNFT1つと、
              転売用の「ボーナスNFT」を{{ tokensPerAsset - 2 }}つ、合計{{
                tokensPerAsset - 1
              }}つのNFTを発行します。
            </p>
          </div>
          <div v-else>
            <p class="mb-2">
              This is a free mint, but you need to pay the gas fee, which is
              typically {{priceRange.low}}〜{{priceRange.high}}ETH (depending on the complexity of the
              image, assuming the Gas price is ~15 Gwei).
            </p>
            <p class="mb-2">
              If you participate in this crowd-minting effort, you will
              receive not only the primary NFT (which is the proof that you
              are one of minters), but also
              {{ tokensPerAsset - 2 }} additional bonus NFTs.
            </p>
          </div>
        </NetworkGate>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import NetworkGate from "@/components/NetworkGate.vue";

export default defineComponent({
  props: ["selection", "addresses", "tokensPerAsset", "networkContext", "assetStoreRO", "priceRange"],
  components: {
    NetworkGate,
  },
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    const route = useRoute();
    const affiliateId =
      typeof route.query.ref == "string" ? parseInt(route.query.ref) || 0 : 0;
    //console.log("***", affiliateId);
    const minterName = ref("");
    const validName = computed(() => {
      const length = encoder.encode(minterName.value).length;
      return length <= 32;
    });
    const messageRef = ref<string | null>(null);
    const encoder = new TextEncoder();
    const mint = async () => {
      //console.log("*** mint", selection.value.asset.asset);
      if (!props.networkContext) {
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

      asset.soulbound = await props.networkContext.signer.getAddress();
      //console.log(asset.soulbound);
      try {
        messageRef.value = "message.minting";
        asset.minter = minterName.value;
        asset.group = ""; // gas saving
        console.log("*** minting", asset);
        const tx = await props.networkContext.contract.mintWithAsset(
          asset,
          affiliateId
        );
        const result = await tx.wait();
        console.log("mint:gasUsed", result.gasUsed.toNumber());
        messageRef.value = "message.minted";
      } catch (e: any) {
        console.log(e);
        messageRef.value = e.message;
      }
    };
    return {
      lang, minterName, validName, mint, messageRef
    }
  }
});
</script>


