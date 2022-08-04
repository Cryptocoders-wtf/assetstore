<template>
  <div>
    <button @click="onOpen">
      <span class="material-icons">image</span>
    </button>
    <div v-if="showTokens" 
      style="width:400px;height:400px; left:-350px"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100">
      <span v-for="token in tokens" :key="token.tokenId">
        <img
          @click="onSelect(token)"
          :src="token.image"
          class="mr-1 mb-1 inline-block w-14 rounded-xl"
        />
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { Token } from "@/models/token";

export default defineComponent({
  props: ["tokens"],
  setup(props) {
    const showTokens = ref<boolean>(false);
    const onOpen = () => {
      console.log("onOpen");
      showTokens.value = !showTokens.value;
    }
    const onSelect = (token:Token) => {
      console.log("onSelect", token.tokenId);
    }
    return {
      onOpen,
      showTokens,
      onSelect
    };
  }
});
</script>