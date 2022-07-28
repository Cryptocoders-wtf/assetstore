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
    const loadedLayers = localStorage.getItem("image0");
    console.log("loadeLayers", loadedLayers);
    const layers = ref<Layer[] | null>(JSON.parse(loadedLayers));
    const showCanvas = ref<boolean>(false);
    const onCreate = () => {
      showCanvas.value = true;
    }
    const onClose = (output:Layer[]) => {
      console.log("Draw:onClose", output.length);
      layers.value = output.map(layer => layer);
      localStorage.setItem("image0", JSON.stringify(layers.value));
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