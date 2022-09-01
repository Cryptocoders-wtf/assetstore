<template>
  <div class="flex bg-slate-400 mb-1" style="width:80px; height:24px">
    <div v-if="value">
      <span class="absolute">{{value}}</span>
      <div class="bg-blue-300" :style="`width:${80*value}px; height:24px`" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["value"],
  setup() {
    return {
    };
  }
});
</script>
