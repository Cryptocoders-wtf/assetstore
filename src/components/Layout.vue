<template>
  <div class="layout">
    <div id="nav" class="mb-2 mt-2">
      <!--img class="mb-4" src="@/assets/banner.svg" /-->
      <router-link :to="localizedUrl('/')" class="text-2xl">Mint</router-link> |
      <router-link :to="localizedUrl('/assets')" class="text-2xl"
        >Assets</router-link
      >
      <Languages class="mt-4" />
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useStore } from "vuex";

import { useI18nParam } from "@/i18n/utils";

import Languages from "@/components/Languages.vue";
import Connect from "@/components/Connect.vue";

export default defineComponent({
  name: "AppLayout",
  components: {
    Languages,
  },
  async setup() {
    const store = useStore();
    useI18nParam();

    return {
    };
  },
});
</script>
