<template>
  <div>
    <Canvas v-if="showCanvas" @close="onClose" />
    <div class="max-w-xl mx-auto text-left p-2">
      <div class="mb-2 text-xl font-bold">{{ "Create Your Own Token" }}</div>
      <div><button @click="onCreate">Create</button></div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import Canvas from "@/components/Canvas.vue";

export default defineComponent({
  components: {
    Canvas,
  },
  setup() {
    const showCanvas = ref<boolean>(false);
    const onCreate = () => {
      showCanvas.value = true;
    }
    const onClose = (foo:any, bar:any) => {
      console.log("Draw:onClose", foo, bar);
      showCanvas.value = false;
    },
    return {
      showCanvas,
      onCreate,
      onClose,
    }    
  }
});
</script>