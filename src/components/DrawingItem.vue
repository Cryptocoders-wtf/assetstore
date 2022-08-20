<template>
  <div>
    <div class="absolute -z-10 w-32 overflow-hidden">
      <img
        v-if="token"
        class="w-32"
        :src="token.image"
        :style="`Transform:${transform}`"
      />
    </div>
    <img :src="svgImageFromDrawing(drawing)" class="w-32" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { svgImageFromDrawing } from "@/models/point";
import { assetSize } from "@/utils/canvasUtil";

export default defineComponent({
  props: ["drawing", "tokens"],

  setup(props) {
    const transform = computed(() => {
      const xf = props.drawing.transform;
      if (xf == null) {
        return "";
      }
      return (
        `translate(${(xf.tx * 32 * 4) / assetSize.w}px,` +
        `${(xf.ty * 32 * 4) / assetSize.h}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
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
