<template>
  <div class="flex" :style="`width:${sliderWidth}px; height:28px`">
    <div v-if="value !== null">
      <input
        class="text-sm"
        type="value"
        :value="value"
        @input="onTextInput($event.target.value)"
        :style="`width:${sliderWidth}px; height:16px`"
      />
      <div
        class="overflow-hidden bg-slate-400"
        :style="`width:${sliderWidth}px; height:8px`"
        @mousedown="mousedown"
      >
        <div
          class="bg-blue-300"
          :style="`width:${sliderWidth * value}px; height:8px`"
        />
      </div>
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
    const mousedown = (evt: MouseEvent) => {
      context.emit("updateValue", evt.offsetX / sliderWidth);
      evt.preventDefault();
    };
    const onTextInput = (textValue: string) => {
      const newValue = parseFloat(textValue);
      if (!isNaN(newValue)) {
        context.emit("updateValue", newValue);
      }
    };
    return {
      sliderWidth,
      mousedown,
      onTextInput,
    };
  },
});
</script>
