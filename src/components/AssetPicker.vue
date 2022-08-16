<template>
  <div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
    </div>
    <div
      v-if="showPopup"
      style="width: 400px; height: 200px; left: 40px; overflow-y: scroll"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
    >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup(props, context) {
    const showPopup = ref<boolean>(false);
    const onOpen = () => {
      showPopup.value = !showPopup.value;
    };
    return {
      onOpen,
      showPopup
    };
  },
});
</script>