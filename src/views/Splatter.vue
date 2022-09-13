<template>
  <div>
    <img :src="image" @click="updateImage" />
  </div> 
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { Point, pathFromPoints, svgImageFromPath } from "@/models/point";

export default defineComponent({
  setup() {
    const image = ref<string>("");
    const randomize = (value:number, ratio:number) => {
      return value + (Math.random() - 0.5) * value * ratio * 2;
    };
    const generate = () => {
      const points:Point[] = [];
      const [cx, cy] = [512, 512];
      var r0 = 100;   
      var speed = Math.PI / 30;
      for (var i = speed, alt = 0, jump = 1, r1 = r0; i < Math.PI * 2; i += randomize(speed, 0.9), alt = (alt + 1) % 4) {
        if (alt == 0) {
          const r = r1 * (1 + randomize(0.3, 1));
          const arc = randomize(0.3, 0.5);
          points.push({
            x: cx + r * Math.cos(i - speed * 0.01),
            y: cy + r * Math.sin(i - speed * 0.01),
            c: false,
            r: 0.588
          });
          points.push({
            x: cx + r * (1 + arc/2) * Math.cos(i - speed * arc),
            y: cy + r * (1 + arc/2) * Math.sin(i - speed * arc),
            c: false,
            r: 0.588
          });
          points.push({
            x: cx + r * (1 + arc/2) * Math.cos(i + speed * arc),
            y: cy + r * (1 + arc/2) * Math.sin(i + speed * arc),
            c: false,
            r: 0.588
          });
          points.push({
            x: cx + r * Math.cos(i + speed * 0.01),
            y: cy + r * Math.sin(i + speed * 0.01),
            c: false,
            r: 0.588
          });
        } else {
          r1 = (randomize(r1, 0.1) * 2 + r0) / 3;
          points.push({
          x: cx + r1 * Math.cos(i),
          y: cy + r1 * Math.sin(i),
          c: false,
          r: alt ? randomize(1.0, 0.3) : 0.588
        })
        }
      }
      const path = pathFromPoints(points);
      return svgImageFromPath(path, "red");
    };
    const updateImage = () => {
      image.value = generate(); 
    };
    updateImage();
    return {
      image,
      updateImage
    };
  },
});
</script>