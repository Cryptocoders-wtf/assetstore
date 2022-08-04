<template>
  <div>
    <button @click="onOpen">
      <span class="material-icons">image</span>
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  setup(props) {
    const onOpen = () => {
      console.log("onOpen");
    }
    return {
      onOpen
    };
  }
});
</script>