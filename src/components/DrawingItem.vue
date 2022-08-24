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
import { defineComponent, computed, PropType } from "vue";
import { svgImageFromDrawing, Drawing } from "@/models/point";
import { assetSize } from "@/utils/canvasUtil";
import { Token } from "@/models/token";

export default defineComponent({
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
      required: true,
    },
    tokens: {
      type: Array as PropType<Token[]>,
      required: true,
    },
  },

  setup(props) {
    const transform = computed(() => {
      const xf = props.drawing.remix?.transform;
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
      if (props.drawing.remix && props.drawing.remix.tokenId > 0) {
        const index = Math.floor(props.drawing.remix.tokenId / 4);
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
