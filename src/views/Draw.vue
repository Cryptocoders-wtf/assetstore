<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" :initialLayers="selectedBody" />
    
    <div class="max-w-xl mx-auto text-left p-2">
      <div class="mb-2 text-xl font-bold">{{ "Create Your Own Token" }}</div>
      <div class="flex">
        <div v-for="(body, index) in bodies" :key="index" @click="onSelect(index)"
          :class='`border-2 ${(index == selectedIndex) ? "border-blue-700":"border-white"}`'>
          <img :src="svgImageFromLayers(body)" class="w-48" />
          <div v-if="index == selectedIndex"><button @click="onOpen">Edit</button></div>
        </div>
        <div><button @click="onCreate">Create New</button></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import Canvas from "@/components/Canvas.vue";
import {
  Layer,
  svgImageFromLayers,
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
    const onSelect = (index:number) => {
      selectedIndex.value = index;
    };
    const onOpen = () => {
      selectedBody.value = bodies.value[selectedIndex.value];
      showCanvas.value = true;
    };
    const onCreate = () => {
      const keys = info.value.keys;
      // Prepare to open
      selectedIndex.value = keys.length;
      selectedBody.value = [];

      // Update the info and save it
      const array:Layer[][] = bodies.value.map(body => body);
      array.push(selectedBody.value);
      bodies.value = array;
      keys.push(`image${info.value.nextIndex}`);
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
      onSelect,
      bodies,
      selectedBody,
      svgImageFromLayers,
      selectedIndex,
    };
  },
});
</script>
