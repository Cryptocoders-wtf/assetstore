<template>
  <div :style="`height:${canvasParams.canh - 4}px; overflow-y: scroll`">
    <div v-for="(layer, index) in layers" :key="index">
      <div v-if="index == layerIndex">
        <button @click="insertLayer(index)">
          <span class="material-icons">add</span>
        </button>
        <button @click="pivotLayer(index)" v-if="index > 0">
          <span class="material-icons">swap_vert</span>
        </button>
      </div>
      <img
        @click="onSelectLayer(index)"
        :src="layer.svgImage"
        :style="`width:${canvasParams.sidew}px;height:${
          canvasParams.sidew / 2
        }px`"
        class="border-2 border-solid object-fill"
        :class="`${
          index == layerIndex ? 'border-blue-400' : 'border-slate-200'
        }`"
      />
      <div v-if="index == layerIndex" class="ml-2 mr-2 flex justify-between">
        <button @click="insertLayer(index + 1)">
          <span class="material-icons">add</span>
        </button>
        <button @click="copyLayer(index)">
          <span class="material-icons">content_copy</span>
        </button>
        <button @click="pivotLayer(index + 1)" v-if="index < layers.length - 1">
          <span class="material-icons">swap_vert</span>
        </button>
        <button v-if="layers.length > 1" class="ml-2" @click="deleteLayer()">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useCanvasParams } from "@/utils/canvasUtil";
import { Layer } from "@/models/point";

export default defineComponent({
  props: ["layers", "layerIndex"],
  emits: [
    "insertLayer",
    "copyLayer",
    "onSelectLayer",
    "updateLayers",
  ],
  setup(props, context) {
    const { canvasParams } = useCanvasParams();

    const insertLayer = (index: number) => {
      context.emit("insertLayer", index);
    };
    const pivotLayer = (index: number) => {
      const array = props.layers.map((layer:Layer) => layer);
      const tmp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = tmp;
      context.emit("updateLayers", array, props.layerIndex);
    };
    const copyLayer = (index: number) => {
      context.emit("copyLayer", index);
    };
    const onSelectLayer = (index: number) => {
      context.emit("onSelectLayer", index);
    };
    const deleteLayer = () => {
      if (props.layers.length == 1) {
        return;
      }
      const array = props.layers.filter((layer:Layer, index:number) => {
        return index != props.layerIndex;
      });
      context.emit("updateLayers", array, props.layerIndex - 1);
    };
    return {
      canvasParams,
      insertLayer,
      pivotLayer,
      copyLayer,
      deleteLayer,
      onSelectLayer,
    };
  },
});
</script>
