<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" :initialLayers="selectedBody" />
    <div class="max-w-xl mx-auto text-left p-2">
      <div class="mb-2 text-xl font-bold">{{ "Create Your Own Token" }}</div>
      <div v-for="(body, index) in bodies" :key="index" @click="onOpen(index)">Body</div>
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

/*
interface Dictionary<T> {
    [Key: string]: T;
}
*/
interface Info {
  nextIndex: number;
  keys: string[];
  //bodies: Dictionary<Layer[]>;  
}
const baseInfo:Info = {
  nextIndex: 0,
  keys: [],
};
export default defineComponent({
  components: {
    Canvas,
  },
  setup() {
    const bodies = ref<Layer[][]>([]);
    const resultInfo = localStorage.getItem("info");
    const info = ref<Info>(resultInfo ? JSON.parse(resultInfo) || baseInfo : baseInfo);
    bodies.value = info.value.keys.map(key => {
      const result = localStorage.getItem(key);
      const layers:Layer[] = result ? JSON.parse(result) || [] : [];
      console.log("body", key, layers);
      return layers;
    });

    const showCanvas = ref<boolean>(false);
    const selectedIndex = ref<number>(0);
    const selectedBody = ref<Layer[]>([]);
    const onOpen = (index:number) => {
      selectedIndex.value = index;
      selectedBody.value = bodies.value[index];
      showCanvas.value = true;
    };
    const onCreate = () => {
      const keys = info.value.keys;
      keys.push(`image${info.value.nextIndex}`);
      selectedBody.value = [];
      const array:Layer[][] = bodies.value.map(body => body);
      array.push(selectedBody.value);
      bodies.value = array;
      selectedIndex.value = info.value.nextIndex;
      info.value = {
        nextIndex: info.value.nextIndex + 1,
        keys
      };
      localStorage.setItem("info", JSON.stringify(info.value));
      showCanvas.value = true;
    };
    const onClose = (output: Layer[]) => {
      console.log("Draw:onClose", output.length);
      bodies.value = bodies.value.map((layers, index) => {
        if (index == selectedIndex.value) {
          return output;
        }
        return layers;
      });
      localStorage.setItem(`image${selectedIndex.value}`, JSON.stringify(output));
      showCanvas.value = false;
    };
    return {
      showCanvas,
      onOpen,
      onCreate,
      onClose,
      bodies,
      selectedBody,
    };
  },
});
</script>
