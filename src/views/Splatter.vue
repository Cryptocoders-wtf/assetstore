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
    const foo = (value:number, ratio:number) => {
      return value + (Math.random() - 0.5) * value * ratio;
    }; 
    const points:Point[] = [];
    const [cx, cy] = [512, 512];
    const r0 = 200;
    var alt = true;
    for (var i = 0; i < Math.PI * 2; i += foo(0.1, 0.3)) {
      const r = alt ? foo(1, 0.8) : foo(0.5, 0.4);
      alt = !alt;
      points.push({
        x: cx + r0 * r * Math.cos(i),
        y: cy + r0 * r * Math.sin(i),
        c: (r > 1.4),
        r: alt ? foo(1.0, 0.3) : 0.588
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