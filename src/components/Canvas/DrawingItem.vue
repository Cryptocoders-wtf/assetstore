<template>
  <div class="w=32 -z-10 overflow-hidden">
    <div class="absolute -z-10 w-32 overflow-hidden">
      <img
        v-if="drawing.remix.image"
        class="w-32"
        :src="drawing.remix.image"
        :style="`Transform:${transform}`"
      />
    </div>
    <img :src="svgImageFromDrawing(drawing)" class="absolute -z-10 w-32" />
    <img
      v-for="(overlay, index) in drawing.overlays"
      :key="index"
      class="absolute -z-10 w-32"
      :style="`Transform: ${overlayTransform(overlay)}`"
      :src="overlay.image"
    />
    <img
      :src="svgImageFromDrawing(drawing)"
      class="w-32"
      style="visibility: hidden"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { svgImageFromDrawing, Drawing, Overlay } from "@/models/point";
import { assetSize } from "@/utils/canvasUtil";
import { useCanvasParams } from "@/utils/canvasUtil";

export default defineComponent({
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
      required: true,
    },
  },

  setup(props) {
    const { canvasParams } = useCanvasParams();
    const transform = computed(() => {
      const xf = props.drawing.remix.transform;
      return (
        `translate(${(xf.tx * 32 * 4) / assetSize.w}px,` +
        `${(xf.ty * 32 * 4) / assetSize.h}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
    });
    const overlayTransform = (overlay: Overlay) => {
      const xf = overlay.transform;
      return (
        `translate(${(xf.tx * 32 * 4) / canvasParams.value.assw}px,` +
        `${(xf.ty * 32 * 4) / canvasParams.value.assh}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
    };

    return {
      svgImageFromDrawing,
      transform,
      overlayTransform,
    };
  },
});
</script>
