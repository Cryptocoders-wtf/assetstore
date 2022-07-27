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
      @dragenter.prevent
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
        <div
          v-for="(layer, index) in layers"
          :key="index">
          <div v-if="index == layerIndex">
            <div><button @click="insertLayer(index)">Insert</button></div>
          </div>
          <img @click="onSelectLayer($event, index)"
          :src="layer.svgImage"
          :style="`object-fit:fill;width:${sidew}px;height:${sidew / 2}px`"
          :class="`border-2 border-solid ${
            index == layerIndex ? 'border-blue-400' : 'border-slate-200'
          }`"
          />
          <div v-if="index == layerIndex">
            <div><button @click="insertLayer(index + 1)">Insert</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { Point, svgImageFromPoints, splitPoint, togglePoint } from "@/models/point";

interface Layer {
  points: Point[];
  color: string;
  svgImage: string;
}

const [canw, canh, offx, offy, curw, curh, sidew] = [
  512, 512, 40, 40, 30, 30, 150,
];

const roundRect: Point[] = [
  { x: canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh - canh / 4, c: false },
  { x: canw / 4, y: canh - canh / 4, c: false },
];

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
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
      cursors.value = togglePoint(cursors.value, selected.value);
    };
    const splitSegment = () => {
      cursors.value = splitPoint(cursors.value, selected.value);
      selected.value = selected.value + 1;
    };
    const deletePoint = () => {
      if (cursors.value.length <= 3) {
        return;
      }
      cursors.value = cursors.value.filter((cursor, index) => {
        return index != selected.value;
      });
      selected.value =
        (selected.value + cursors.value.length - 1) % cursors.value.length;
    };
    const insertLayer = (index: number) => {
      const array = layers.value.map((layer) => layer);
      const newLayer = {
        points: roundRect,
        color: currentColor.value,
        svgImage: svgImageFromPoints(roundRect, currentColor.value),
      };
      array.splice(index, 0, newLayer);
      layers.value = array;
      layerIndex.value = index;
      // We need to do this, because watch(layerIndex) may not catch this event
      cursors.value = newLayer.points;
      currentColor.value = newLayer.color;
    };
    const onSelectLayer = (evt: any, index: number) => {
      layerIndex.value = index;
    };
    const drop = (evt: any) => {
      console.log("drop");
      evt.preventDefault();
    };
    watch(layerIndex, (index) => {
      const layer = layers.value[index];
      cursors.value = layer.points;
      currentColor.value = layer.color;
    });
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
      onSelectLayer,
      layerIndex,
      layers,
    };
  },
});
</script>
