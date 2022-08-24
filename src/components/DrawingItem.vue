<template>
  <div>
    <div class="absolute -z-10 w-32 overflow-hidden">
      <img
        v-if="drawing.remix?.image"
        class="w-32"
        :src="drawing.remix?.image"
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

export default defineComponent({
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
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

    return {
      svgImageFromDrawing,
      transform,
    };
  },
});
</script>
