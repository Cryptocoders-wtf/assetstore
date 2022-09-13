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
    const r0 = 256;
    for (var i = 0; i < 360; i += 30) {
      const r = r0 + (Math.random() - 0.5) * r0/2;
      points.push({
        x: cx + r * Math.cos(i),
        y: cy + r * Math.sin(i),
        c: false,
        r: 0.533
      })
    }
    const path = pathFromPoints(points);
    const image = svgImageFromPath(path, "red");
    return {
      image
    };
  },
});
</script>