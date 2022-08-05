<template>
  <div :style="`height:${canh - 4}px; overflow-y: scroll`">
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
        :style="`width:${sidew}px;height:${sidew / 2}px`"
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
import { canvasParams } from "@/utils/canvasUtil";

export default defineComponent({
  props: ["layers", "layerIndex"],
  emits: [
    "insertLayer",
    "pivotLayer",
    "copyLayer",
    "onSelectLayer",
    "deleteLayer",
  ],
  setup(props, context) {
    const { canh, sidew } = canvasParams;

    const insertLayer = (index: number) => {
      context.emit("insertLayer", index);
    };
    const pivotLayer = (index: number) => {
      context.emit("pivotLayer", index);
    };
    const copyLayer = (index: number) => {
      context.emit("copyLayer", index);
    };
    const onSelectLayer = (index: number) => {
      context.emit("onSelectLayer", index);
    };
    const deleteLayer = () => {
      context.emit("deleteLayer");
    };
    return {
      canh,
      sidew,
      insertLayer,
      pivotLayer,
      copyLayer,
      deleteLayer,
      onSelectLayer,
    };
  },
});
</script>
