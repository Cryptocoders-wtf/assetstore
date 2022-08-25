<template>
  <div :style="`height:${canvasParams.canh - 4}px; overflow-y: scroll`">
    <div>
      <token-picker
        :tokens="tokens"
        @tokenSelected="tokenSelected"
        @remixSelected="remixSelected"
        :canvasParams="canvasParams"
        :remix="drawing.remix"
        :isRemixType="isRemixType"
      />
    </div>

    <div v-for="(layer, index) in drawing.layers" :key="index">
      <div v-if="index == layerIndex && isLayerType">
        <button @click="insertLayer(index)">
          <span class="material-icons">add</span>
        </button>
        <button @click="swapLayer(index)" v-if="index > 0">
          <span class="material-icons">swap_vert</span>
        </button>
      </div>
      <img
        @click="onSelectLayer(index)"
        :src="layer.svgImage"
        :style="`width:${canvasParams.sidew}px;height:${
          canvasParams.sidew / 2
        }px`"
        class="border-2 border-solid object-fill"
        :class="`${
          index == layerIndex && isLayerType
            ? 'border-blue-400'
            : 'border-slate-200'
        }`"
      />
      <div v-if="index == layerIndex && isLayerType" class="ml-2 mr-2 flex justify-between">
        <button @click="insertLayer(index + 1)">
          <span class="material-icons">add</span>
        </button>
        <button @click="copyLayer(index)">
          <span class="material-icons">content_copy</span>
        </button>
        <button
          @click="swapLayer(index + 1)"
          v-if="index < drawing.layers.length - 1"
        >
          <span class="material-icons">swap_vert</span>
        </button>
        <button
          v-if="drawing.layers.length > 1"
          class="ml-2"
          @click="deleteLayer()"
        >
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>
    <div v-for="(overlay, index) in drawing.overlays" :key="index">
      <div v-if="index == overlayIndex && isOverlayType" class="ml-2 mr-2 flex justify-between">
        <button @click="swapOverlay(index)" v-if="index > 0">
          <span class="material-icons">swap_vert</span>
        </button>
      </div>
      <img
        @click="onSelectOverlay(index)"
        :src="overlay.image"
        :style="`width:${canvasParams.sidew}px;height:${canvasParams.sidew}px`"
        class="border-2 border-solid object-fill"
        :class="`${
          index == overlayIndex && isOverlayType
            ? 'border-blue-400'
            : 'border-slate-200'
        }`"
      />
      <div v-if="index == overlayIndex && isOverlayType" class="ml-2 mr-2 flex justify-between">
        <button @click="copyOverlay(index)">
          <span class="material-icons">content_copy</span>
        </button>
        <button
          @click="swapOverlay(index + 1)"
          v-if="index < drawing.overlays.length - 1"
        >
          <span class="material-icons">swap_vert</span>
        </button>
        <button
          class="ml-2"
          @click="deleteOverlay()"
        >
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>
    <div>
      <asset-picker :addresses="addresses" @AssetSelected="AssetSelected" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useCanvasParams } from "@/utils/canvasUtil";
import { Layer, LayerType, Drawing, identityTransform, Overlay } from "@/models/point";
import TokenPicker from "@/components/Canvas/TokenPicker.vue";
import { Token } from "@/models/token";
import AssetPicker from "@/components/Canvas/AssetPicker.vue";

export default defineComponent({
  components: {
    TokenPicker,
    AssetPicker,
  },
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
      required: true,
    },
    layerIndex: {
      type: Number,
      required: true,
    },
    overlayIndex: {
      type: Number,
      required: true,
    },
    newLayer: {
      type: Object as PropType<Layer>,
      required: true,
    },
    tokens: {
      type: Array as PropType<Token[]>,
      required: true,
    },
    currentLayerType: {
      type: Number as PropType<LayerType>,
      require: true,
    },
    addresses: {
      type: Object,
      required: true,
    },
  },
  emits: ["onSelectLayer", "updateLayers", "tokenSelected", 
  "remixSelected", "updateOverlays", "onSelectOverlay"],
  setup(props, context) {
    const { canvasParams } = useCanvasParams();
    const isLayerType = computed(() => {
      return props.currentLayerType == LayerType.LAYER;
    });
    const isRemixType = computed(() => {
      return props.currentLayerType == LayerType.REMIX;
    });
    const isOverlayType = computed(() => {
      return props.currentLayerType == LayerType.OVERLAY;
    });
    const onSelectLayer = (index: number) => {
      context.emit("onSelectLayer", index);
    };
    const insertLayer = (index: number) => {
      const array = props.drawing.layers.map((layer) => layer);
      array.splice(index, 0, props.newLayer);
      context.emit("updateLayers", array, props.layerIndex + 1);
    };
    const swapLayer = (index: number) => {
      const array = props.drawing.layers.map((layer) => layer);
      const tmp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = tmp;
      context.emit("updateLayers", array, props.layerIndex);
    };
    const copyLayer = (index: number) => {
      const array = props.drawing.layers.map((layer) => layer);
      const layer = { ...props.drawing.layers[index] };
      array.splice(index, 0, layer);
      context.emit("updateLayers", array, props.layerIndex + 1);
    };
    const deleteLayer = () => {
      if (props.drawing.layers.length == 1) {
        return;
      }
      const array = props.drawing.layers.filter((layer, index: number) => {
        return index != props.layerIndex;
      });
      context.emit("updateLayers", array, props.layerIndex - 1);
    };

    const onSelectOverlay = (index: number) => {
      context.emit("onSelectOverlay", index);
    };
    const swapOverlay = (index: number) => {
      const array = props.drawing.overlays.map((layer) => layer);
      const tmp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = tmp;
      context.emit("updateOverlays", array, props.overlayIndex);
    };
    const copyOverlay = (index: number) => {
      const array = props.drawing.overlays.map((layer) => layer);
      const overlay = { ...props.drawing.overlays[index] };
      array.splice(index, 0, overlay);
      context.emit("updateOverlays", array, props.overlayIndex + 1);
    };
    const deleteOverlay = () => {
      const array = props.drawing.overlays.filter((overlay, index: number) => {
        return index != props.overlayIndex;
      });
      context.emit("updateOverlays", array, props.overlayIndex - 1);
    };

    const tokenSelected = (token: Token | null) => {
      console.log("tokenSelected", token);
      context.emit("tokenSelected", token);
    };
    const remixSelected = () => {
      context.emit("remixSelected");
    };
    const AssetSelected = (
      provider: string,
      index: number,
      image: string,
      assetId: number
    ) => {
      console.log("AssetSelected", provider, index, assetId);
      const overlay:Overlay = {
        provider, assetId, image, fill:"", transform: identityTransform
      }
      overlay.transform.scale = 0.5;
      const overlays = props.drawing.overlays.map(overlay => overlay);
      overlays.push(overlay);
      context.emit("updateOverlays", overlays);
    };
    return {
      canvasParams,
      onSelectLayer,
      insertLayer,
      swapLayer,
      copyLayer,
      deleteLayer,
      onSelectOverlay,
      swapOverlay,
      copyOverlay,
      deleteOverlay,
      tokenSelected,
      remixSelected,
      isLayerType,
      isRemixType,
      AssetSelected,
      isOverlayType,
    };
  },
});
</script>
