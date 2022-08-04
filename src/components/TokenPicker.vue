<template>
  <div>
    <button @click="onOpen">
      <span class="material-icons">image</span>
    </button>
    <div v-if="showTokens" 
      style="width:400px;height:400px; left:-350px"
      class="absolute border-2 border-solid border-blue-700 bg-slate-300">
      Hello World
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  props: ["tokens"],
  setup(props) {
    const showTokens = ref<boolean>(false);
    const onOpen = () => {
      console.log("onOpen");
      showTokens.value = !showTokens.value;
    }
    return {
      onOpen,
      showTokens
    };
  }
});
</script>