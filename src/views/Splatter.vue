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
    const r0 = 202;
    var alt = false;
    var speed = Math.PI / 30;
    for (var i = 0; i < Math.PI * 2; i += foo(speed, 2)) {
      const r = alt ? foo(0.8, 1.2) : foo(0.5, 0.4);
      alt = !alt;
      if (r > 1) {
        const arc = 0.1;
        points.push({
          x: cx + r0 * r * (1-arc) * Math.cos(i - speed * 0.03),
          y: cy + r0 * r * (1-arc) * Math.sin(i - speed * 0.03),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * Math.cos(i - speed * 0.2),
          y: cy + r0 * r * Math.sin(i - speed * 0.2),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * Math.cos(i + speed * 0.2),
          y: cy + r0 * r * Math.sin(i + speed * 0.2),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * (1-arc)  * Math.cos(i + speed * 0.03),
          y: cy + r0 * r * (1-arc)  * Math.sin(i + speed * 0.03),
          c: false,
          r: 0.588
        });
      } else {
        points.push({
        x: cx + r0 * r * Math.cos(i),
        y: cy + r0 * r * Math.sin(i),
        c: false,
        r: alt ? foo(1.0, 0.3) : 0.588
      })

      }
    }
    const path = pathFromPoints(points);
    const image = svgImageFromPath(path, "red");
    return {
      image
    };
  },
});
</script>