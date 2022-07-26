<template>
  <div class="layout">
    <Header />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "@/components/Header.vue";

export default defineComponent({
  name: "AppLayout",
  components: {
    Header,
  },
});
</script>
