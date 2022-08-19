<template>
  <div>
    <div
      v-if="selectedToken"
      :style="`width:${canvasParams.sidew}px;height:${canvasParams.sidew}px;overflow:hidden`"
    >
      <img
        :src="selectedToken.image"
        :style="`width:${canvasParams.sidew}px;height:${canvasParams.sidew}px;Transform: ${transform};`"
      />
    </div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
      <button
        :style="`opacity:${selectedToken ? '1.0' : '0.5'}`"
        @click="onRemove"
        class="ml-2 flex"
      >
        <span class="material-icons">image_not_supported</span>
      </button>
    </div>
    <div
      v-if="showTokens"
      style="width: 400px; height: 200px; left: -240px; overflow-y: scroll"
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
import { defineComponent, ref, computed } from "vue";
import { Token } from "@/models/token";
import { useCanvasParams } from "@/utils/canvasUtil";

export default defineComponent({
  props: ["tokens", "selectedToken", "canvasParams", "remixTransform"],
  setup(props, context) {
    const transform = computed(() => {
      const xf = props.remixTransform;
      if (xf == null) {
        return "";
      }
      return (
        `translate(${
          (xf.tx * props.canvasParams.sidew) / props.canvasParams.assw
        }px,` +
        `${(xf.ty * props.canvasParams.sidew) / props.canvasParams.assh}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
    });
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
      transform,
    };
  },
});
</script>
