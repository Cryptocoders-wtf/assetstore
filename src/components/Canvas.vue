<template>
  <div
    style="width: 100%"
    @drop="drop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <div
      :style="`width:${canvasParams.canw}px; height:${canvasParams.canh}px; left:${canvasParams.offx}px; top:${canvasParams.offy}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
      @dragover="dragOver"
      @touchmove="dragOver"
    >
      <div
        v-if="remixToken"
        :style="`width:${canvasParams.canw}px; height:${canvasParams.canh}px;`"
        class="absolute overflow-hidden"
      >
        <img
          :src="remixToken.image"
          :style="
            `width:${canvasParams.canw}px; height:${canvasParams.canh}px;` +
            `Transform: ${remixTransformString};`
          "
        />
      </div>
      <img
        v-for="(layer, index) in layers"
        :key="index"
        :src="layer.svgImage"
        class="absolute"
        draggable="false"
        :style="
          `width:${canvasParams.canw}px; height:${canvasParams.canh}px;` +
          `opacity:${index > layerIndex ? '0.5' : '1.0'}`
        "
        @click="onClickToPickLayer($event)"
      />
      <div
        class="tool-handle-move absolute"
        :style="
          `width:${canvasParams.curw}px; height:${canvasParams.curh}px; ` +
          `left: ${moveToolPos.left}px; ` +
          `top: ${moveToolPos.top}px; `
        "
        draggable="true"
        @dragstart="dragLayerImgStart($event)"
        @touchstart="dragLayerImgStart($event)"
        @click="onClickToolHandle()"
      />
      <div v-if="toolHandleMode">
        <div
          v-for="({ type, x, y }, index) in toolHandles"
          :key="index"
          class="absolute"
          :class="
            type === Tools.ROTATE
              ? 'tool-handle-rotation'
              : 'tool-handle-scaling'
          "
          :style="`width:${canvasParams.curw}px; height:${canvasParams.curh}px;
          left: ${x}px; top: ${y}px;`"
          draggable="true"
          @dragstart="dragToolHandleStart($event, type)"
          @touchstart="dragToolHandleStart($event, type)"
        />
      </div>
      <div v-else>
        <div
          v-for="(cursor, index) in cursors"
          :key="index"
          :style="`width:${canvasParams.curw}px; height:${
            canvasParams.curh
          }px; left:${
            assetXtoCanvasX(cursor.x) - canvasParams.curw / 2
          }px; top:${assetYtoCanvasY(cursor.y) - canvasParams.curh / 2}px`"
          :class="`${
            index == pointIndex ? 'border-blue-800' : 'border-blue-400'
          } ${cursor.c ? '' : 'rounded-xl'}`"
          draggable="true"
          class="absolute border-2 border-solid"
          @dragstart="dragStart($event, index)"
          @touchstart="dragStart($event, index)"
          @click="onSelect($event, index)"
        />
      </div>
    </div>

    <div
      :style="`width:${canvasParams.canw + canvasParams.sidew}px;
      height:${canvasParams.headh + 2}px;
      left:${canvasParams.offx}px;
      top:${canvasParams.offy - canvasParams.headh}px`"
      class="absolute flex items-center justify-between border-2 border-solid border-blue-700 bg-slate-300 px-4"
    >
      <div class="flex items-center gap-1.5">
        <Undo
          :isUndoable="isUndoable"
          :isRedoable="isRedoable"
          @undo="undo"
          @redo="redo"
        />
        <div class="self-start">|</div>
        <ToggleGrid @toggleGrid="toggleGrid" :grid="grid" />
        <div class="self-start">|</div>
        <TogglePoint
          @togglePoint="togglePoint"
          :isSharpCorner="isSharpCorner"
        />
        <DeletePoint @deletePoint="deletePoint" :cursors="cursors" />
        <SplitSegment @splitSegment="splitSegment" />
        <div class="self-start">|</div>
        <color-picker
          style="`margin: 10px; width: 100%"
          v-model:pureColor="stagingColor"
        />
        <div class="self-start">|</div>
        <asset-picker :addresses="addresses" @AssetSelected="AssetSelected" />
      </div>
      <Close @onClose="onClose" />
    </div>

    <div
      :style="`width:${canvasParams.sidew + 2}px; height:${
        canvasParams.canh
      }px; left:${canvasParams.offx + canvasParams.canw - 2}px; top:${
        canvasParams.offy
      }px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-300"
    >
      <Layers
        :layers="layers"
        :layerIndex="layerIndex"
        :newLayer="newLayer"
        :tokens="tokens"
        :remix="remix"
        :currentLayerType="currentLayerType"
        @tokenSelected="tokenSelected"
        @onSelectLayer="onSelectLayer"
        @updateLayers="updateLayers"
        @remixSelected="remixSelected"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, PropType } from "vue";
import {
  Layer,
  Overlay,
  LayerType,
  Drawing,
  svgImageFromPath,
  pathFromPoints,
  splitPoint,
  togglePointType,
  Transform,
  Remix,
} from "@/models/point";
import { ColorPicker } from "vue3-colorpicker";

import AssetPicker from "@/components/AssetPicker.vue";
import Layers from "@/components/Canvas/Layers.vue";
import Undo from "@/components/Canvas/Menu/Undo.vue";
import Close from "@/components/Canvas/Menu/Close.vue";
import ToggleGrid from "@/components/Canvas/Menu/ToggleGrid.vue";
import TogglePoint from "@/components/Canvas/Menu/TogglePoint.vue";
import DeletePoint from "@/components/Canvas/Menu/DeletePoint.vue";
import SplitSegment from "@/components/Canvas/Menu/SplitSegment.vue";

import { Token } from "@/models/token";
import "vue3-colorpicker/style.css";

import {
  useCanvasParams,
  roundRect,
  Tools,
  useToolHandleMode,
} from "@/utils/canvasUtil";

import { useUndoStack } from "@/utils/undo";
import { useDrag } from "@/utils/Drag";

export default defineComponent({
  name: "HomePage",
  components: {
    ColorPicker,
    AssetPicker,
    Layers,
    Undo,
    Close,
    ToggleGrid,
    TogglePoint,
    DeletePoint,
    SplitSegment,
  },
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
      required: true,
    },
    tokens: {
      type: Array as PropType<Token[]>,
      required: true,
    },
    addresses: {
      type: Object,
      required: true,
    },
  },
  setup(props, context) {
    const {
      canvasParams,
      assetXtoCanvasX,
      assetYtoCanvasY,
      getPageX,
      getPageY,
    } = useCanvasParams();
    const remixToken = ref<Token | null>(null);
    const layerIndex = ref<number>(0);
    const pointIndex = ref<number>(0);
    const currentLayerType = ref<number>(LayerType.LAYER);
    const remixTransform = ref<Transform>(
      props.drawing.remix?.transform || { tx: 0, ty: 0, scale: 1, rotate: 0 }
    );
    const remix = computed(() => {
      const foo:Remix = {
        tokenId: remixToken.value?.tokenId || 0,
        transform: remixTransform.value,
        image: remixToken.value?.image
      };
      return foo;
    });
    //console.log("setup", remixTransform.value, props.drawing.transform);
    const remixTransformString = computed(() => {
      const xf = remixTransform.value;
      return (
        `translate(${assetXtoCanvasX(xf.tx)}px,` +
        `${assetYtoCanvasY(xf.ty)}px) ` +
        `scale(${xf.scale}) rotate(${xf.rotate}deg) `
      );
    });
    console.log("setup2", remixTransformString.value, assetXtoCanvasX(100));
    //console.log("initialLayers", props.initialLayers ? "A" : "B");
    const layers = ref<Layer[]>(
      props.drawing.layers?.length > 0
        ? props.drawing.layers
        : [
            {
              points: roundRect,
              color: "",
              path: "",
              svgImage: "",
            },
          ]
    );
    const overlays = ref<Overlay[]>(props.drawing.overlays || []);
    const stagingColor = ref<string>(""); // staging for undoable color change
    const currentColor = ref<string>("");
    watch([stagingColor], ([color]) => {
      if (currentColor.value != color) {
        recordState();
        currentColor.value = color;
      }
    });

    const { recordState, isRedoable, isUndoable, _undo, _redo } = useUndoStack(
      layers,
      remixToken,
      remixTransform
    );

    const computedRemixTransform = computed(() => {
      return remixTransform.value;
    });
    const {
      toolHandleMode,
      toolHandles,
      onClickToolHandle,
      moveToolPos,
      cursors,
    } = useToolHandleMode(currentLayerType, computedRemixTransform);

    const tokenSelected = (token: Token) => {
      recordState();
      remixTransform.value = { tx: 0, ty: 0, scale: 1, rotate: 0 };
      console.log("tokenSelected", remixTransformString.value);
      remixToken.value = token;
    };
    const remixSelected = () => {
      currentLayerType.value = LayerType.REMIX;
      toolHandleMode.value = true;
    };

    const fetchToken = async () => {
      //console.log("*** fetchToken", props.drawing.remixId, props.tokens.length);
      if (props.drawing.remix && props.drawing.remix.tokenId > 0) {
        const index = Math.floor(props.drawing.remix.tokenId / 4);
        if (index < props.tokens.length) {
          remixToken.value = props.tokens[index];
          //console.log("*** fetchToken2",props.drawing.remixId,remixToken.value);
        }
      }
    };
    fetchToken();

    watch([cursors, currentColor], ([points, color]) => {
      layers.value = layers.value.map((layer, index) => {
        if (index == layerIndex.value) {
          const path = pathFromPoints(points);
          return {
            points,
            color,
            path,
            svgImage: svgImageFromPath(path, color),
          };
        }
        return layer;
      });
    });
    const updateLayerIndex = (index: number) => {
      layerIndex.value = (index + layers.value.length) % layers.value.length;
      const layer = layers.value[layerIndex.value];
      cursors.value = layer.points;
      currentColor.value = layer.color;
      stagingColor.value = layer.color;
      pointIndex.value = 0;
    };
    updateLayerIndex(0);
    const undo = () => {
      _undo();
      updateLayerIndex(layerIndex.value);
    };
    const redo = () => {
      _redo();
      updateLayerIndex(layerIndex.value);
    };

    const onSelect = (evt: Event, index: number) => {
      pointIndex.value = index;
    };
    const {
      dragLayerImgStart,
      dragToolHandleStart,
      dragStart,
      dragOver,
      toggleGrid,
      grid,
    } = useDrag(
      pointIndex,
      moveToolPos,
      cursors,
      recordState,
      currentLayerType,
      remixTransform
    );

    const togglePoint = () => {
      recordState();
      cursors.value = togglePointType(cursors.value, pointIndex.value);
    };
    const isSharpCorner = computed(() => {
      return cursors.value[pointIndex.value].c;
    });
    const splitSegment = () => {
      recordState();
      cursors.value = splitPoint(cursors.value, pointIndex.value);
      pointIndex.value = pointIndex.value + 1;
    };
    const deletePoint = () => {
      if (cursors.value.length <= 3) {
        return;
      }
      recordState();
      cursors.value = cursors.value.filter((cursor, index) => {
        return index != pointIndex.value;
      });
      pointIndex.value =
        (pointIndex.value + cursors.value.length - 1) % cursors.value.length;
    };
    const newLayer = computed(() => {
      const path = pathFromPoints(roundRect);
      return {
        points: roundRect,
        color: currentColor.value,
        path,
        svgImage: svgImageFromPath(path, currentColor.value),
      } as Layer;
    });
    const updateLayers = (array: Layer[], index: number) => {
      recordState();
      layers.value = array;
      updateLayerIndex(index);
    };
    const onSelectLayer = (index: number) => {
      updateLayerIndex(index);
      currentLayerType.value = LayerType.LAYER;
    };
    const drop = (evt: MouseEvent) => {
      evt.preventDefault();
    };
    const onClose = () => {
      const token = remixToken.value;
      const drawing: Drawing = {
        layers: layers.value,
        remix: {
          tokenId: token ? token.tokenId + 1 : 0,
          transform: remixTransform.value,
          image: token?.image,
        },
      };
      context.emit("close", drawing);
    };
    const onClickToPickLayer = (evt: MouseEvent) => {
      const results: number[] = [];
      layers.value.forEach((layer: Layer, index: number) => {
        if (
          getPageX(evt) >
            Math.min.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          getPageX(evt) <
            Math.max.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          getPageY(evt) >
            Math.min.apply(
              null,
              layer.points.map((p) => p.y)
            ) &&
          getPageY(evt) <
            Math.max.apply(
              null,
              layer.points.map((p) => p.y)
            )
        )
          results.push(index);
      });
      if (results.length > 0) {
        updateLayerIndex(
          results.indexOf(layerIndex.value) !== -1
            ? [...results, ...results][results.indexOf(layerIndex.value) + 1]
            : results[0]
        );
        currentLayerType.value = LayerType.LAYER;
      } else if (props.drawing.remix && props.drawing.remix.tokenId > 0) {
        currentLayerType.value = LayerType.REMIX;
        toolHandleMode.value = true;
      }
    };
    const AssetSelected = (
      key: string,
      index: number,
      image: string,
      assetId: number
    ) => {
      console.log("AssetSelected", key, index, assetId);
    };
    return {
      toolHandleMode,
      Tools,
      cursors,
      pointIndex,
      stagingColor,
      canvasParams,
      moveToolPos,
      toolHandles,
      dragLayerImgStart,
      onClickToolHandle,
      dragToolHandleStart,
      dragStart,
      dragOver,
      drop,
      togglePoint,
      isSharpCorner,
      splitSegment,
      deletePoint,
      onSelect,
      newLayer,
      updateLayers,
      onSelectLayer,
      onClose,
      undo,
      redo,
      isUndoable,
      isRedoable,
      layerIndex,
      layers,
      grid,
      toggleGrid,
      onClickToPickLayer,
      remixToken,
      tokenSelected,
      remixSelected,

      assetXtoCanvasX,
      assetYtoCanvasY,
      currentLayerType,
      remixTransformString,
      remixTransform,
      AssetSelected,
      remix
    };
  },
});
</script>

<style scoped>
.tool-handle-move::before {
  font-family: "Material Icons";
  content: "control_camera";
  @apply text-4xl;
  @apply text-red-800;
  @apply relative;
  @apply bottom-2.5;
  @apply right-2;
}
.tool-handle-rotation::before {
  font-family: "Material Icons";
  content: "screen_rotation_alt";
  @apply text-xl;
  @apply text-green-800;
  @apply relative;
  @apply bottom-2;
  @apply right-0.5;
}
.tool-handle-scaling::before {
  font-family: "Material Icons";
  content: "zoom_out_map";
  @apply text-xl;
  @apply text-yellow-800;
  @apply relative;
  @apply bottom-2;
  @apply right-0.5;
}
</style>
