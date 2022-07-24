<template>
  <div>
    <div v-if="tokens.length > 0">
      <div class="mt-4 mb-2">
        <p class="font-bold">{{ $t("message.nftListTitle") }}</p>
      </div>
      <span v-for="token in tokens" :key="token.tokenId">
        <a
          :href="`${OpenSeaPath}/${token.tokenId}`"
          class="cursor-pointer"
          target="_blank"
        >
          <img
            :src="token.image"
            class="w-14 inline-block rounded-xl mr-1 mb-1"
          />
        </a>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: ["tokens", "OpenSeaPath"],
  setup() {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    return { lang };
  },
});
</script>
