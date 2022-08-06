<template>
  <div>
    <button @click="onClose">
      <span class="material-icons">close</span>
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["onClose"],
  setup(_, context) {
    const onClose = () => {
      context.emit("onClose");
    };
    return {
      onClose,
    };
  },
});
</script>
