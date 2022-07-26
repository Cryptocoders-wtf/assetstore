<template>
  <div id="nav" class="mb-2 mt-2">
    <router-link :to="localizedUrl('/')" class="text-md">{{
      $t("header.home")
    }}</router-link>
    |
    <router-link :to="localizedUrl('/material')" class="text-md">{{
      $t("header.material")
    }}</router-link>
    |
    <router-link :to="localizedUrl('/kamon')" class="text-md">{{
      $t("header.kamon")
    }}</router-link>
    |
    <router-link :to="localizedUrl('/emoji')" class="text-md">{{
      $t("header.flags")
    }}</router-link>
    <Languages class="mt-4" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Languages from "@/components/Languages.vue";

export default defineComponent({
  components: {
    Languages,
  },
});
</script>
