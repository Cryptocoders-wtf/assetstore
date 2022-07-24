<template>
  <div>
    <div v-if="lang === 'ja'">
      <p class="mb-2">
        これは、フル・オンチェーンNFTの表現力をより高めるために、
        ブロック・チェーン上にさまざまなベクトル画像をアップロードし、
        人類の共有アセットとして活用しようという「On-Chain Asset
        Store」プロジェクトの一環です。
      </p>
      <p class="mb-2">
        大量のベクトル画像をチェーン上にアップロードするには多くの「ガス代」が必要ですが、
        それをNFTをミントする方に少しつづ負担していただく「クラウドミント」
        への参加をみなさんにお願いしています。
      </p>
    </div>
    <div v-else>
      <p class="mb-2">
        This is a part of "On-Chain Asset Store" project, which is an effort to
        make variety of vector assets available on blockchains.
      </p>
      <p class="mb-2">
        We are using a "crowd-minting" method, where each minter pays a small
        amount of gas fees to upload a vector image to the blockchain, and
        receives multiple NFTs as rewards.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    return { lang };
  },
});
</script>
