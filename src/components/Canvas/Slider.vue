<template>
  <div class="flex bg-slate-400 mb-1" :style="`width:${sliderWidth}px; height:24px`" @mousedown="mousedown">
    <div v-if="value">
      <span class="absolute">{{value}}</span>
      <div class="bg-blue-300" :style="`width:${sliderWidth*value}px; height:24px`" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["value"],
  emits: ["updateValue"],
  setup(props, context) {
    const sliderWidth = 80;
    const mousedown = (evt:MouseEvent) => {
      console.log("mousedown", evt.offsetX);
      context.emit("updateValue", evt.offsetX/sliderWidth);
    };
    return {
      sliderWidth,
      mousedown
    };
  }
});
</script>
