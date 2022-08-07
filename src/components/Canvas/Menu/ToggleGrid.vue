<template>
  <button @click="toggleGrid" class="ml-2 flex">
    <span class="material-icons">view_module</span>
    <span>{{ grid }}</span>
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: ["grid"],
  emits: ["toggleGrid"],
  setup(_, context) {
    const toggleGrid = () => {
      context.emit("toggleGrid");
    };
    return {
      toggleGrid,
    };
  },
});
</script>
