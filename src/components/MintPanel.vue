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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: ["selection"],
  setup(props) {
    const i18n = useI18n();
    const lang = computed(() => {
      return i18n.locale.value;
    });
    return {
      lang
    }
  }
});
</script>


