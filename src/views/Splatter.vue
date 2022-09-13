<template>
  <div>
    <img :src="image" />
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { Point, pathFromPoints, svgImageFromPath } from "@/models/point";

export default defineComponent({
  setup() {
    const points:Point[] = [];
    const [cx, cy] = [512, 512];
    const r = 256;
    points.push({x:cx-r, y:cy-r, c:false, r:0.533});
    points.push({x:cx+r, y:cy-r, c:false, r:0.533});
    points.push({x:cx+r, y:cy+r, c:false, r:0.533});
    points.push({x:cx-r, y:cy+r, c:false, r:0.533});
    const path = pathFromPoints(points);
    const image = svgImageFromPath(path, "red");
    return {
      image
    };
  },
});
</script>