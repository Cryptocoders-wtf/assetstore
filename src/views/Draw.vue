<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div style="width:512; height:512px" class="bg-slate-300">
      <div v-for="(cursor, index) in cursors" :key="index"
        style="width:40px; height:40px; position:relative" 
        class="border-2 border-solid border-blue-700">
      </div>
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
    const cursors = ref<Point[]>([]);
    cursors.value = [
      { x:128, y:128, c:false },
      { x:128, y:384, c:false },
      { x:384, y:384, c:false },
      { x:384, y:128, c:false },
    ]
    return {
      cursors
    };
  },
});
</script>
