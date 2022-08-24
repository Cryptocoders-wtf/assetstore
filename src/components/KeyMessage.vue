<template>
  <div>
    <p class="mb-2">
      {{ $t("keyMessage.message1") }}
      {{ $t("keyMessage.message1a") }}
      <a
        href="https://hackmd.io/@snakajima/HJva6n-Jj"
        class="underline"
        target="_blank"
        >On-Chain Asset Store and Composer</a
      >
      {{ $t("keyMessage.message1b") }}
    </p>
    <p class="mb-2">
      {{ $t("keyMessage.message2") }}
    </p>
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
