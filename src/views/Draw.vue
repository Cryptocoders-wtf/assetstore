<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" :initialLayers="layers" />
    <div class="max-w-xl mx-auto text-left p-2">
      <div class="mb-2 text-xl font-bold">{{ "Create Your Own Token" }}</div>
      <div><button @click="onCreate">Create</button></div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import Canvas from "@/components/Canvas.vue";
import {
  Point,
  Layer,
  svgImageFromPath,
  pathFromPoints,
  splitPoint,
  togglePointType,
} from "@/models/point";


export default defineComponent({
  components: {
    Canvas,
  },
  setup() {
    const layers = ref<Layer[] | null>(null);
    const showCanvas = ref<boolean>(false);
    const onCreate = () => {
      showCanvas.value = true;
    }
    const onClose = (output:Layer[]) => {
      console.log("Draw:onClose", output.length);
      layers.value = output.map(layer => layer);
      showCanvas.value = false;
    },
    return {
      showCanvas,
      onCreate,
      onClose,
      layers,
    }    
  }
});
</script>