<template>
  <div>
    <div v-if="availableAssets == null">
      <p v-if="lang === 'ja'">読み込み中です...</p>
      <p v-else>Loading...</p>
    </div>
    <div v-else-if="availableAssets.length == 0">
      <p v-if="lang === 'ja'">
        今回の発行分（{{
          totalCount
        }}個）に関しては、クラウドミントが完了いたししました。ご協力、ありがとうございます。
        さらにNFTを追加する予定なので、少々お待ちください。
      </p>
      <p v-else>
        Thanks to all the minters, the current release of
        {{ totalCount }} NFTs were sold out. We are going to add more NTFs
        soon. Please stay tuned!
      </p>
    </div>
    <div v-else>
      <p v-if="lang === 'ja'" class="mb-2">
        下に表示されている画像の一つをクリックし、
        下に表示されるミントボタンを押して下さい。
      </p>
      <p v-else class="mb-2">
        Please select one of images below and the follow the
        instruction displayed further below.
      </p>
      <slot />
      <span v-for="asset in availableAssets" v-bind:key="asset.name">
        <img
          @click="$emit('onSelect', asset)"
          :src="asset.image"
          class="cursor-pointer w-16 inline-block rounded-xl"
        />
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: ["availableAssets", "loadedAssets"],
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    return {
      totalCount: props.loadedAssets.length,
      lang
    }
  }
});
</script>
