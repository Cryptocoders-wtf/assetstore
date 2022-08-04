<template>
  <div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
        <span v-if="selectedToken">
          {{ selectedToken.tokenId }}
        </span>
      </button>
      <button v-if="selectedToken" @click="onRemove" class="ml-2 flex">
        <span class="material-icons">image_not_supported</span>
      </button>
    </div>
    <div
      v-if="showTokens"
      style="width: 400px; height: 200px; left: -350px; overflow-y: scroll"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
    >
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
  props: ["tokens", "selectedToken"],
  setup(props, context) {
    const showTokens = ref<boolean>(false);
    const onOpen = () => {
      console.log("onOpen");
      showTokens.value = !showTokens.value;
    };
    const onSelect = (token: Token) => {
      console.log("onSelect", token.tokenId);
      //context.emit("update:selectedToken", token);
      context.emit("tokenSelected", token);
      showTokens.value = false;
    };
    const onRemove = () => {
      context.emit("tokenSelected", null);
      showTokens.value = false;
    };
    return {
      onOpen,
      showTokens,
      onSelect,
      onRemove,
    };
  },
});
</script>
