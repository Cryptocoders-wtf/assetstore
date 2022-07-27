<template>
  <div>
    <div :style='`position:absolute; width:${canw}px; height:${canh}px; left:${offx}px; top:${offy}px`' 
      class="border-2 border-solid border-blue-700 bg-slate-300" 
      @dragover="dragOver"
      @dragenter.prevent
    >
      <img :src="svgImage" :style='`width:${canw}px; height:${canh}px;`'/>
      <div v-for="(cursor, index) in cursors" :key="index"
        :style='`width:${curw}px; height:${curh}px; position:absolute; left:${cursor.x - curw/2}px; top:${cursor.y - curh/2}px`'
        :class='`border-2 border-solid ${ index==selected ? "border-blue-800" : "border-blue-400"} ${ cursor.c ? "":"rounded-xl"}`'
        draggable="true"
        @dragstart="dragStart($event, index)"
        />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

const svgHead = '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">'
  +'<defs><g id="asset">';
const svgTail = '</g></defs>'
  +'<use href="#asset" fill="green" /></svg>';

interface Point {
  x: number;
  y: number;
  c: boolean;
}

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const offx = 40;
    const offy = 80;
    const curw = 30;
    const curh = 30;
    const cursors = ref<Point[]>([]);
    const selected = ref<number>(0);
    const offsetX = ref<number>(0);
    const offsetY = ref<number>(0);
    cursors.value = [
      { x:128, y:128, c:false },
      { x:128, y:384, c:true },
      { x:384, y:384, c:false },
      { x:384, y:128, c:false },
    ];
    const dragStart = (evt:any, index:number) => {
      //evt.dataTransfer.setData('index', index)
      offsetX.value = evt.offsetX;
      offsetY.value = evt.offsetY;
      selected.value = index;
    };
    const dragOver = (evt:any) => {
      // const index = evt.dataTransfer.getData('index')   
      cursors.value = cursors.value.map((cursor, index) => {
        if (index == selected.value) {
          return { 
            x: Math.max(0, Math.min(511, evt.clientX - offx - offsetX.value + curw/2 - 3)), 
            y: Math.max(0, Math.min(511, evt.clientY - offy - offsetY.value + curh/2 - 3)), 
            c:cursor.c };
        }
        return cursor;
      });   
      evt.preventDefault();  
    }
    const svgImage:string = computed(()=>{
      const points = cursors.value;
      const length = points.length;
      const path = points.reduce((path, cursor, index) => {
        const prev = points[(index + length - 1) % length];
        const next = points[(index + 1) % length];
        const head = (index == 0) ? `M${(cursor.x + prev.x)/2},${(cursor.y + prev.y)/2},` : "";
        return path + head
                      + (cursor.c ? 'L' : 'Q')
                      + `${cursor.x},${cursor.y},`
                      + `${(cursor.x + next.x)/2},${(cursor.y + next.y)/2}`;
      }, "");
      const svg = svgHead +
        '<path d="' +
        path +
        '" />'
        + svgTail;
      const image =
        "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
      return image;
    });
    return {
      cursors,
      selected,
      canw: 512,
      canh: 512,
      curw, curh, offx, offy,
      dragStart,
      dragOver,
      svgImage
    };
  },
});
</script>
