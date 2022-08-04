<template>
  <div>
    <img v-if="token" 
      class="absolute w-32 -z-10" 
      :src="token.image" />
    <img :src="svgImageFromDrawing(drawing)" 
      class="w-32" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { Drawing, svgImageFromDrawing } from "@/models/point";

export default defineComponent({
  props: ["drawing", "tokens"],

  setup(props) {
    const token = computed(() => {
      const index = Math.floor(props.drawing.remixId / 4);
      if (index < props.tokens.length) {
        return props.tokens[index];
      }
      return null;
    });
    return {
      svgImageFromDrawing,
      token
    };
  }
});
</script>