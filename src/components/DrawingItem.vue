<template>
  <div>
    <img v-if="token" class="absolute -z-10 w-32" :src="token.image" :style="`Transform:${transform}`" />
    <img :src="svgImageFromDrawing(drawing)" class="w-32" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { svgImageFromDrawing } from "@/models/point";

export default defineComponent({
  props: ["drawing", "tokens"],

  setup(props) {
    const transform = computed(() => {
      const xf = props.drawing.transform;
      if (xf == null) { return ""; }
      console.log("****XF", xf);
      return `translate(${xf.tx * 32 / 1024}px,` 
        + `${xf.ty * 32 / 1024}px) ` 
        + `scale(${xf.scale}) rotate(${xf.rotate}deg) `;
    });

    const token = computed(() => {
      if (props.drawing.remixId > 0) {
        const index = Math.floor(props.drawing.remixId / 4);
        if (index < props.tokens.length) {
          return props.tokens[index];
        }
      }
      return null;
    });
    return {
      svgImageFromDrawing,
      token,
      transform,
    };
  },
});
</script>
