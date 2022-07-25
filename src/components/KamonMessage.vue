<template>
  <div>
    <p v-if="lang === 'ja'" class="mb-2">
      * 家紋のベクトルデータは<a
        class="underline"
        href="http://hakko-daiodo.com"
        >発行大王堂様</a
      >よりご提供いただいています。
    </p>
    <p v-else class="mb-2">
      *All Kamon vector data were provided by
      <a class="underline" href="http://hakko-daiodo.com">Hakko Daiodo</a>.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    return {
      lang,
    };
  },
});
</script>
