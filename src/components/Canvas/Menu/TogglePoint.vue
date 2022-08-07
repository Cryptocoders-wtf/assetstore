<template>
  <button @click="togglePoint">
    <span v-if="isSharpCorner" class="material-icons"
      >check_box_outline_blank</span
    >
    <span v-else class="material-icons">radio_button_unchecked</span>
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["togglePoint"],
  props: ["isSharpCorner"],
  setup(_, context) {
    const togglePoint = () => {
      context.emit("togglePoint");
    };
    return {
      togglePoint,
    };
  },
});
</script>
