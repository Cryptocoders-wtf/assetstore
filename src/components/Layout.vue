<template>
  <div class="layout">
    <div id="nav" class="mb-2 mt-2">
      <!--img class="mb-4" src="@/assets/banner.svg" /-->
      <router-link :to="localizedUrl('/')" class="text-md">Home</router-link> |
      <router-link :to="localizedUrl('/material')" class="text-md">Material</router-link> |
      <router-link :to="localizedUrl('/kamon')" class="text-md">Kamon</router-link
      >
      <Languages class="mt-4" />
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18nParam } from "@/i18n/utils";
import Languages from "@/components/Languages.vue";

export default defineComponent({
  name: "AppLayout",
  components: {
    Languages,
  },
  async setup() {
    useI18nParam();

    return {
    };
  },
});
</script>
