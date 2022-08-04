<template>
  <div>
    <img :src="svgImageFromDrawing(drawing)" class="w-32" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Drawing, svgImageFromDrawing } from "@/models/point";

export default defineComponent({
  props: ["drawing", "tokens"],
  setup(props) {
    return {
      svgImageFromDrawing
    };
  }
});
</script>