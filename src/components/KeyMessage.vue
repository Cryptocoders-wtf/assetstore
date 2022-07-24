<template>
  <div>
    <p class="mb-2">
      {{ $t("keyMessage.message1")}}
    </p>
    <p class="mb-2">
      {{ $t("keyMessage.message2")}}
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
