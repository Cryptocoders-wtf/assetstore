<template>
  <div>
    <button @click="splitSegment">
      <span class="material-icons">add_circle</span>
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["splitSegment"],
  setup(_, context) {
    const splitSegment = () => {
      context.emit("splitSegment");
    };
    return {
      splitSegment,
    };
  },
});
</script>
