<template>
  <header id="header" class="py-1.5 mx-auto max-w-xl flex justify-between items-center">
    <div class="flex justify-start items-center gap-1">
        <img src="@/assets/AssetStoreLogo.png" width="40" height="auto" />
        <div class="leading-none font-bold text-left">
            <div>On-chain<br />Asset Store</div>
        </div>
    </div>
    <nav id="nav" class="flex flex-wrap justify-start items-center">
      <router-link :to="localizedUrl('/')" class="text-md">{{
        $t("header.home")
      }}</router-link>
      <router-link :to="localizedUrl('/material')" class="text-md">{{
        $t("header.material")
      }}</router-link>
      <router-link :to="localizedUrl('/kamon')" class="text-md">{{
        $t("header.kamon")
      }}</router-link>
      <router-link :to="localizedUrl('/emoji')" class="text-md">{{
        $t("header.flags")
      }}</router-link>
    </nav>
    <Languages />
  </header>
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
