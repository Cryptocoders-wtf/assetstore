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
      :style="`position:absolute; width:200px; height:${canh}px; left:${
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
      <div><button @click="addLayer">Add</button></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";

const svgHead =
  '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">' +
  '<defs><g id="asset">';

interface Point {
  x: number;
  y: number;
  c: boolean;
}

interface Layer {
  points: Point[];
  color: string;
  svgImage: string;
}

const roundRect: Point[] = [
  { x: 128, y: 128, c: false },
  { x: 384, y: 128, c: false },
  { x: 384, y: 384, c: false },
  { x: 128, y: 384, c: false },
];

const pathFromPoints = (points: Point[]) => {
  const length = points.length;
  return points.reduce((path, cursor, index) => {
    const prev = points[(index + length - 1) % length];
    const next = points[(index + 1) % length];
    const head =
      index == 0
        ? `M${(cursor.x + prev.x) / 2},${(cursor.y + prev.y) / 2},`
        : "";
    return (
      path +
      head +
      (cursor.c ? "L" : "Q") +
      `${cursor.x},${cursor.y},` +
      `${(cursor.x + next.x) / 2},${(cursor.y + next.y) / 2}`
    );
  }, "");
};
const svgImageFromPoints = (points: Point[], color: string) => {
  const path = pathFromPoints(points);
  const svgTail = "</g></defs>" + `<use href="#asset" fill="${color}" /></svg>`;
  const svg = svgHead + '<path d="' + path + '" />' + svgTail;
  const image =
    "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  return image;
};

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const offx = 40;
    const offy = 80;
    const curw = 30;
    const curh = 30;
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
              Math.min(511, evt.clientX - offx - offsetX.value + curw / 2 - 3)
            ),
            y: Math.max(
              0,
              Math.min(511, evt.clientY - offy - offsetY.value + curh / 2 - 3)
            ),
            c: cursor.c,
          };
        }
        return cursor;
      });
      evt.preventDefault();
    };
    const drop = (evt: any) => {
      console.log("drop");
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
    const togglePoint = () => {
      cursors.value = cursors.value.map((cursor, index) => {
        if (index == selected.value) {
          return { x: cursor.x, y: cursor.y, c: !cursor.c };
        }
        return cursor;
      });
    };
    const splitSegment = () => {
      console.log("a");
      const array = cursors.value.map((cursor) => cursor);
      const cursor = cursors.value[selected.value];
      const next = cursors.value[(selected.value + 1) % array.length];
      const newItem = {
        x: (cursor.x + next.x) / 2,
        y: (cursor.y + next.y) / 2,
        c: cursor.c,
      };
      array.splice(selected.value + 1, 0, newItem);
      cursors.value = array;
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
    const addLayer = () => {
      const array = layers.value.map((layer) => layer);
      const newLayer = {
        points: roundRect,
        color: currentColor.value,
        svgImage: svgImageFromPoints(roundRect, currentColor.value),
      };
      array.push(newLayer);
      layers.value = array;
      layerIndex.value += 1;
      cursors.value = newLayer.points;
      currentColor.value = newLayer.color;
    };
    return {
      cursors,
      selected,
      currentColor,
      canw: 512,
      canh: 512,
      curw,
      curh,
      offx,
      offy,
      dragStart,
      dragOver,
      drop,
      togglePoint,
      splitSegment,
      deletePoint,
      onSelect,
      addLayer,
      layers,
    };
  },
});
</script>
