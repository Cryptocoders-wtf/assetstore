<template>
  <div>
    <div
      v-if="remix.image"
      @click="onSelectRemix"
      class="overflow-hidden border-2 border-solid"
      :class="`${isRemixType ? 'border-blue-400' : 'border-slate-200'}`"
    >
      <img
        :src="remix.image"
        :style="`width:${canvasParams.sidew}px;height:${canvasParams.sidew}px;Transform:${transform};`"
      />
    </div>
    <div class="ml-2 mr-2 flex justify-between">
      <button @click="onOpen" class="">
        <span class="material-icons">image</span>
      </button>
      <div class="text-sm">{{ $tc("dfraw.remix") }}</div>
      <button
        :style="`opacity:${remix.image ? '1.0' : '0.5'}`"
        @click="onSelect(null)"
        class="ml-2 flex"
      >
        <span class="material-icons">delete</span>
      </button>
    </div>
    <div
      v-if="showPopup"
      :style="`width:${(canvasParams.canw * 2) / 3}px;
              left: ${canvasOffset.x + canvasParams.canw / 3}px; 
              top: ${canvasOffset.y}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
    >
      <div :style="`height:${canvasParams.canh / 3}px; overflow-y:scroll`">
        <span v-for="remix in remixes" :key="remix.tokenId">
          <img
            @click="onSelect(remix)"
            :src="remix.image"
            class="mr-1 mb-1 inline-block w-14 rounded-xl"
          />
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { Remix } from "@/models/point";

export default defineComponent({
  props: ["remixes", "remix", "canvasParams", "isRemixType", "canvasOffset"],
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
      showPopup.value = !showPopup.value;
    };
    const onSelect = (token: Remix | null) => {
      context.emit("tokenSelected", token);
      showPopup.value = false;
    };
    const onSelectRemix = () => {
      context.emit("remixSelected");
    };
    return {
      onOpen,
      showPopup,
      onSelect,
      transform,
      onSelectRemix,
    };
  },
});
</script>
