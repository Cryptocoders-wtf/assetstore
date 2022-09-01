<template>
  <div class="flex bg-slate-400 mb-1" :style="`width:${sliderWidth}px; height:28px`" @mousedown="mousedown">
    <div v-if="value">
      <input class="absolute text-sm" type="value" :value="value" :style="`width:${sliderWidth}px; height:16px`"> 
      <div class="bg-blue-300" :style="`width:${sliderWidth*value}px; height:28px`" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: ["value"],
  emits: ["updateValue"],
  setup(props, context) {
    const sliderWidth = 80;
    const mousedown = (evt:MouseEvent) => {
      context.emit("updateValue", evt.offsetX/sliderWidth);
      evt.preventDefault();
    };
    return {
      sliderWidth,
      mousedown,
    };
  }
});
</script>
