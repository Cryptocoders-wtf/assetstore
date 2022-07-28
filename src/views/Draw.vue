<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" :drawing="selectedDrawing" />

    <div class="max-w-xl mx-auto text-left p-2">
      <div class="mb-2 text-xl font-bold">{{ "Create Your Own Token" }}</div>
      <div class="flex flex-wrap">
        <div
          v-for="(body, index) in drawings"
          :key="index"
          @click="onSelect(index)"
          :class="`border-2 ${
            index == selectedIndex ? 'border-blue-700' : 'border-white'
          }`"
        >
          <img :src="svgImageFromDrawing(body)" class="w-32" />
          <div v-if="index == selectedIndex" class="flex justify-between ml-2 mr-2">
            <button @click="onOpen">
            <span class="material-icons">edit</span>
            </button>
          </div>
        </div>
        <div><button @click="onCreate">
            <span class="material-icons text-9xl">add</span>
        </button></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import Canvas from "@/components/Canvas.vue";
import { Layer, Drawing, svgImageFromDrawing } from "@/models/point";

/*
interface Dictionary<T> {
    [Key: string]: T;
}
*/
interface Info {
  nextIndex: number;
  keys: string[];
  //drawings: Dictionary<Layer[]>;
}
const baseInfo: Info = {
  nextIndex: 0,
  keys: [],
};

const keyInfo = "manifest";
const keyDrawing = "drawing";

export default defineComponent({
  components: {
    Canvas,
  },
  setup() {
    const drawings = ref<Drawing[]>([]);
    const resultInfo = localStorage.getItem(keyInfo);
    const info = ref<Info>(
      resultInfo ? JSON.parse(resultInfo) || baseInfo : baseInfo
    );
    drawings.value = info.value.keys.map((key) => {
      const result = localStorage.getItem(key);
      const drawing: Drawing = result ? JSON.parse(result) || [] : [];
      return drawing;
    });

    const showCanvas = ref<boolean>(false);
    const selectedIndex = ref<number>(0);
    const selectedDrawing = ref<Drawing>({});
    const onSelect = (index: number) => {
      selectedIndex.value = index;
    };
    const onOpen = () => {
      selectedDrawing.value = drawings.value[selectedIndex.value];
      showCanvas.value = true;
    };
    const onCreate = () => {
      const keys = info.value.keys;
      // Prepare to open
      selectedIndex.value = keys.length;
      selectedDrawing.value = {layers:[], assetId:0};

      // Update the info and save it
      const array: Drawing[] = drawings.value.map((body) => body);
      array.push(selectedDrawing.value);
      drawings.value = array;
      keys.push(`${keyDrawing}${info.value.nextIndex}`);
      info.value = {
        nextIndex: info.value.nextIndex + 1,
        keys,
      };
      localStorage.setItem(keyInfo, JSON.stringify(info.value));

      showCanvas.value = true;
    };
    const onClose = (output: Drawing) => {
      drawings.value = drawings.value.map((drawing, index) => {
        if (index == selectedIndex.value) {
          return output;
        }
        return drawing;
      });
      localStorage.setItem(
        `${keyDrawing}${selectedIndex.value}`,
        JSON.stringify(output)
      );
      showCanvas.value = false;
    };
    return {
      showCanvas,
      onOpen,
      onCreate,
      onClose,
      onSelect,
      drawings,
      selectedDrawing,
      svgImageFromDrawing,
      selectedIndex,
    };
  },
});
</script>
