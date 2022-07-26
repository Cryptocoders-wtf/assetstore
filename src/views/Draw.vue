<template>
  <div>
    <div :style='`position:absolute; width:${canw}px; height:${canh}px; left:${offx}px; top:${offy}px`' 
      class="border-2 border-solid border-blue-700" 
      @drop="onDrop($event)"
      @dragover="dragOver"
      @dragenter.prevent
    >
      <div v-for="(cursor, index) in cursors" :key="index" :name="index"
        :style='`width:${curw}px; height:${curh}px; position:absolute; left:${cursor.x - curw/2}px; top:${cursor.y - curh/2}px`'
        class="border-2 border-solid border-blue-700"
        draggable
        @dragstart="dragStart($event, index)"
        />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

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
    const cursors = ref<Point[]>([]);
    const dragged = ref<number>(0);
    cursors.value = [
      { x:128, y:128, c:false },
      { x:128, y:384, c:false },
      { x:384, y:384, c:false },
      { x:384, y:128, c:false },
    ];
    const dragStart = (evt:any, index:number) => {
      console.log("dragStart", index);
      //evt.dataTransfer.setData('index', index)
      dragged.value = index;
    };
    const dragOver = (evt:any) => {
      // const index = evt.dataTransfer.getData('index')   
      console.log("dragOver", dragged.value, evt.clientX, evt.clientY);
      cursors.value = cursors.value.map((cursor, index) => {
        if (index == dragged.value) {
          return { x:evt.clientX - offx, y:evt.clientY - offy, c:cursor.c };
        }
        return cursor;
      });   
    }
    const onDrop = (evt:any) => {
      const index = evt.dataTransfer.getData('index')   
      console.log("onDrop", index);   
    }
    return {
      cursors,
      canw: 512,
      canh: 512,
      curw: 30,
      curh: 30, 
      offx,
      offy,
      dragStart,
      dragOver,
      onDrop,
    };
  },
});
</script>
