<template>
  <button
    :disabled="cursors.length <= 3"
    @click="deletePoint"
    :style="`opacity:${cursors.length > 3 ? '1.0' : '0.5'}`"
  >
    <span class="material-icons">delete</span>
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: ["cursors"],
  emits: ["deletePoint"],
  setup(_, context) {
    const deletePoint = () => {
      context.emit("deletePoint");
    };
    return {
      deletePoint,
    };
  },
});
</script>
