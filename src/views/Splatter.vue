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
    const r0 = 206;   
    var speed = Math.PI / 30;
    for (var i = 0, alt = false, jump = 1; i < Math.PI * 2; jump = foo(1, 1.5),  i += speed / jump) {
      const r = alt ? foo(0.8, 0.4) * jump : foo(0.5, 0.4);
      alt = !alt;
      if (r > 1) {
        const arc = foo(0.2, 0.5);
        points.push({
          x: cx + r0 * r * (1-arc/2) * Math.cos(i - speed * 0.03),
          y: cy + r0 * r * (1-arc/2) * Math.sin(i - speed * 0.03),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * Math.cos(i - speed * arc),
          y: cy + r0 * r * Math.sin(i - speed * arc),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * Math.cos(i + speed * arc),
          y: cy + r0 * r * Math.sin(i + speed * arc),
          c: false,
          r: 0.588
        });
        points.push({
          x: cx + r0 * r * (1-arc/2)  * Math.cos(i + speed * 0.03),
          y: cy + r0 * r * (1-arc/2)  * Math.sin(i + speed * 0.03),
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