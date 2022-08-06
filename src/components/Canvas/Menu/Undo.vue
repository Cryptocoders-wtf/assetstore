<template>
  <div>
    <button
      @click="undo"
      :disabled="!isUndoable"
      :style="`opacity:${isUndoable ? '1.0' : '0.5'}`"
    >
      <span class="material-icons">undo</span>
    </button>
    <button
      :style="`opacity:${isRedoable ? '1.0' : '0.5'}`"
      class="ml-1"
      @click="redo"
      :disabled="!isRedoable"
    >
      <span class="material-icons">redo</span>
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: ["isUndoable", "isRedoable"],
  emits: ["undo", "redo"],
  setup(_, context) {
    const undo = () => {
      context.emit("undo");
    };
    const redo = () => {
      context.emit("redo");
    };
    return {
      undo,
      redo,
    };
  },
});
</script>
