<template>
  <div>
    <div
      v-if="remix.image"
      @click="onSelectRemix"
      :style="`width:${canvasParams.sidew}px;height:${canvasParams.sidew}px;overflow:hidden`"
      class="border-2 border-solid"
      :class="`${isRemixType ? 'border-blue-400' : 'border-slate-200'}`"
    >
      <img
        :src="remix.image"
        :style="`width:100%;height:100%;Transform:${transform};`"
      />
    </div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
      <button
        :style="`opacity:${remix.image ? '1.0' : '0.5'}`"
        @click="onRemove"
        class="ml-2 flex"
      >
        <span class="material-icons">image_not_supported</span>
      </button>
    </div>
    <div
      v-if="showPopup"
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

export default defineComponent({
  props: ["tokens", "remix", "canvasParams", "isRemixType"],
  setup(props, context) {
    const transform = computed(() => {
      const xf = props.remix.transform;
      return (
        `translate(${
          (xf.tx * props.canvasParams.sidew) / props.canvasParams.assw
        }px,` +
        `${(xf.ty * props.canvasParams.sidew) / props.canvasParams.assh}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
    });
    const showPopup = ref<boolean>(false);
    const onOpen = () => {
      console.log("onOpen");
      showPopup.value = !showPopup.value;
    };
    const onSelect = (token: Token) => {
      console.log("onSelect", token.tokenId);
      //context.emit("update:remixToken", token);
      context.emit("tokenSelected", token);
      showPopup.value = false;
    };
    const onRemove = () => {
      context.emit("tokenSelected", null);
      showPopup.value = false;
    };
    const onSelectRemix = () => {
      console.log("**onSelectRemix");
      context.emit("remixSelected");
    };
    return {
      onOpen,
      showPopup,
      onSelect,
      onRemove,
      transform,
      onSelectRemix,
    };
  },
});
</script>
