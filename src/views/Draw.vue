<template>
  <div class="max-w-xl mx-auto text-left p-2">
    <div style="width:512; height:512px" class="bg-slate-300">
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
