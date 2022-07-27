<template>
  <div
    style="width: 100%"
    @drop="drop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <div
      :style="`position:absolute; width:${canw}px; height:${canh}px; left:${offx}px; top:${offy}px`"
      class="border-2 border-solid border-blue-700 bg-slate-300"
      @dragover="dragOver"
    >
      <img
        v-for="(layer, index) in layers"
        :key="index"
        :src="layer.svgImage"
        :style="`position:absolute; width:${canw}px; height:${canh}px;`"
        :class="`opacity-${index > layerIndex ? '50' : '100'}`"
      />
      <div
        v-for="(cursor, index) in cursors"
        :key="index"
        :style="`width:${curw}px; height:${curh}px; position:absolute; left:${
          cursor.x - curw / 2
        }px; top:${cursor.y - curh / 2}px`"
        :class="`border-2 border-solid ${
          index == selected ? 'border-blue-800' : 'border-blue-400'
        } ${cursor.c ? '' : 'rounded-xl'}`"
        draggable="true"
        @dragstart="dragStart($event, index)"
        @click="onSelect($event, index)"
      />
    </div>
    <div
      :style="`position:absolute; width:${sidew}px; height:${canh}px; left:${
        offx + canw - 2
      }px; top:${offy}px`"
      class="border-2 border-solid border-blue-700"
    >
      <div><button @click="undo">Undo</button></div>
      <div><button @click="togglePoint">Toggle</button></div>
      <div>
        <button :disabled="cursors.length <= 3" @click="deletePoint">
          Delete
        </button>
      </div>
      <div><button @click="splitSegment">Split</button></div>
      <input
        v-model.trim="currentColor"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="username"
        type="text"
        :placeholder="$t('mintPanel.placeHolder')"
      />
      <div :style="`height:${canh / 2}px; overflow-y: scroll`">
        <div v-for="(layer, index) in layers" :key="index">
          <div v-if="index == layerIndex">
            <button @click="insertLayer(index)">Insert</button>
          </div>
          <img
            @click="onSelectLayer($event, index)"
            :src="layer.svgImage"
            :style="`object-fit:fill;width:${sidew}px;height:${sidew / 2}px`"
            :class="`border-2 border-solid ${
              index == layerIndex ? 'border-blue-400' : 'border-slate-200'
            }`"
          />
          <div v-if="index == layerIndex">
            <button @click="insertLayer(index + 1)">Insert</button>
            <button
              v-if="layers.length > 1"
              class="ml-2"
              @click="deleteLayer()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import {
  Point,
  svgImageFromPoints,
  splitPoint,
  togglePointType,
} from "@/models/point";

interface Layer {
  points: Point[];
  color: string;
  svgImage: string;
}

const [canw, canh, offx, offy, curw, curh, sidew] = [
  512, 512, 40, 80, 30, 30, 150,
];

const roundRect: Point[] = [
  { x: canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh - canh / 4, c: false },
  { x: canw / 4, y: canh - canh / 4, c: false },
];

interface State {
  layers: Layer[];
  layerIndex: number;
  pointIndex: number;
}

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const undoStack = ref<State[]>([]);
    const undoIndex = ref<number>(0);
    const recordState = () => {
      const array = undoStack.value.filter((state, index) => {
        return index < undoIndex.value;
      });
      array.push({
        layers: layers.value,
        layerIndex: layerIndex.value,
        pointIndex: selected.value
      });
      undoStack.value = array;
      undoIndex.value = undoStack.value.length;
    };

    const isRedoable = () => {
      return undoIndex.value < undoStack.value.length;
    };

    const isUndoable = () => {
      return undoIndex.value > 0;
    };
    const undo = () => {
      console.log("undo", isUndoable());
      if (!isUndoable()) { return; }
      const state = undoStack.value[undoIndex.value - 1];
      layers.value = state.layers;
      updateLayerIndex(state.layerIndex);
      undoIndex.value -= 1;
      console.log("undo", undoIndex.value, layers.value.length);
    };

    const cursors = ref<Point[]>(roundRect);
    const currentColor = ref<string>("#008000");
    const layers = ref<Layer[]>([
      {
        points: cursors.value,
        color: currentColor.value,
        svgImage: svgImageFromPoints(cursors.value, currentColor.value),
      },
    ]);
    const layerIndex = ref<number>(0);
    const selected = ref<number>(0);
    const offsetX = ref<number>(0);
    const offsetY = ref<number>(0);
    const onSelect = (evt: any, index: number) => {
      selected.value = index;
    };
    const dragStart = (evt: any, index: number) => {
      //evt.dataTransfer.setData('index', index)
      offsetX.value = evt.offsetX;
      offsetY.value = evt.offsetY;
      selected.value = index;
      recordState();
    };
    const dragOver = (evt: any) => {
      // const index = evt.dataTransfer.getData('index')
      cursors.value = cursors.value.map((cursor, index) => {
        if (index == selected.value) {
          return {
            x: Math.max(
              0,
              Math.min(
                canw - 1,
                evt.clientX - offx - offsetX.value + curw / 2 - 3
              )
            ),
            y: Math.max(
              0,
              Math.min(
                canh - 1,
                evt.clientY - offy - offsetY.value + curh / 2 - 3
              )
            ),
            c: cursor.c,
          };
        }
        return cursor;
      });
      evt.preventDefault();
    };
    const togglePoint = () => {
      recordState();
      cursors.value = togglePointType(cursors.value, selected.value);
    };
    const splitSegment = () => {
      recordState();
      cursors.value = splitPoint(cursors.value, selected.value);
      selected.value = selected.value + 1;
    };
    const deletePoint = () => {
      if (cursors.value.length <= 3) {
        return;
      }
      recordState();
      cursors.value = cursors.value.filter((cursor, index) => {
        return index != selected.value;
      });
      selected.value =
        (selected.value + cursors.value.length - 1) % cursors.value.length;
    };
    const updateLayerIndex = (index: number) => {
      layerIndex.value = (index + layers.value.length) % layers.value.length;
      const layer = layers.value[layerIndex.value];
      cursors.value = layer.points;
      currentColor.value = layer.color;
    };
    const insertLayer = (index: number) => {
      recordState();
      const array = layers.value.map((layer) => layer);
      const newLayer = {
        points: roundRect,
        color: currentColor.value,
        svgImage: svgImageFromPoints(roundRect, currentColor.value),
      };
      array.splice(index, 0, newLayer);
      layers.value = array;
      updateLayerIndex(index);
    };
    const deleteLayer = () => {
      if (layers.value.length == 1) {
        return;
      }
      recordState();
      layers.value = layers.value.filter((layer, index) => {
        return index != layerIndex.value;
      });
      updateLayerIndex(layerIndex.value - 1);
    };
    const onSelectLayer = (evt: any, index: number) => {
      updateLayerIndex(index);
    };
    const drop = (evt: any) => {
      evt.preventDefault();
    };
    watch([cursors, currentColor], ([points, color]) => {
      layers.value = layers.value.map((layer, index) => {
        if (index == layerIndex.value) {
          return {
            points,
            color,
            svgImage: svgImageFromPoints(points, color),
          };
        }
        return layer;
      });
    });
    return {
      cursors,
      selected,
      currentColor,
      canw,
      canh,
      curw,
      curh,
      offx,
      offy,
      sidew,
      dragStart,
      dragOver,
      drop,
      togglePoint,
      splitSegment,
      deletePoint,
      onSelect,
      insertLayer,
      deleteLayer,
      onSelectLayer,
      undo,
      isUndoable,
      layerIndex,
      layers,
    };
  },
});
</script>
