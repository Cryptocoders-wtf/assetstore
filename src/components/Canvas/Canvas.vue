<template>
  <div
    class="bg-slate-400"
    @drop="drop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <div style="width: 100%; height: 4px"></div>
    <div
      :style="`width:${canvasParams.canw + canvasParams.sidew + 4}px;
      height:${canvasParams.headh}px`"
      class="mr-1 ml-1 flex items-center justify-between bg-slate-300 px-4"
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
        <Slider :value="stagingRatio" @updateValue="updateRatio" />
        <DeletePoint @deletePoint="deletePoint" :cursors="cursors" />
        <SplitSegment @splitSegment="splitSegment" />
        <div class="self-start">|</div>
        <color-picker v-model:pureColor="stagingColor" />
      </div>
      <Close @onClose="onClose" />
    </div>

    <div class="m-1 flex">
      <div
        :style="`width:${canvasParams.canw}px; height:${canvasParams.canh}px`"
        class="bg-slate-100"
        @dragover="dragOver"
        @touchmove="dragOver"
        ref="divCanvas"
      >
        <div
          :style="`width:${canvasParams.canw}px; height:${canvasParams.canh}px;`"
          class="absolute overflow-hidden"
        >
          <img
            v-if="currentDrawing.remix.image"
            :src="currentDrawing.remix.image"
            class="absolute"
            :style="
              `width:${canvasParams.canw}px; height:${canvasParams.canh}px;` +
              `Transform: ${remixTransformString};`
            "
          />
          <img
            v-for="(layer, index) in currentDrawing.layers"
            :key="index"
            :src="layer.svgImage"
            class="absolute"
            draggable="false"
            :style="
              `width:${canvasParams.canw}px; height:${canvasParams.canh}px;` +
              `opacity:1.0`
            "
            @click="onClickToPickLayer($event)"
          />
          <img
            v-for="(overlay, index) in currentDrawing.overlays"
            :key="index"
            :src="overlay.image"
            class="absolute"
            draggable="false"
            :style="
              `width:${canvasParams.canw}px; height:${canvasParams.canh}px;` +
              `opacity:1.0; Transform: ${overlayTransform(index)}`
            "
            @click="onClickToPickLayer($event)"
          />
        </div>
        <div class="absolute" v-if="hasLayerMode">
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
      </div>

      <div
        :style="`width:${canvasParams.sidew + 2}px; height:${
          canvasParams.canh
        }px;`"
        class="ml-1 bg-slate-300"
      >
        <Layers
          :drawing="currentDrawing"
          :layerIndex="layerIndex"
          :overlayIndex="overlayIndex"
          :newLayer="newLayer"
          :remixes="remixes"
          :currentLayerType="currentLayerType"
          :addresses="addresses"
          :canvasOffset="canvasOffset"
          @updateRemix="updateRemix"
          @onSelectLayer="onSelectLayer"
          @updateLayers="updateLayers"
          @remixSelected="remixSelected"
          @onSelectOverlay="onSelectOverlay"
          @updateOverlays="updateOverlays"
        />
      </div>
    </div>
    <div style="width: 100%; height: 1px"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, PropType } from "vue";
import {
  Layer,
  LayerType,
  Drawing,
  svgImageFromPath,
  pathFromPoints,
  splitPoint,
  togglePointType,
  identityTransform,
  Overlay,
  Remix,
  transformStyle,
} from "@/models/point";
import { ColorPicker } from "vue3-colorpicker";

import Layers from "@/components/Canvas/Layers.vue";
import Undo from "@/components/Canvas/Menu/Undo.vue";
import Close from "@/components/Canvas/Menu/Close.vue";
import ToggleGrid from "@/components/Canvas/Menu/ToggleGrid.vue";
import TogglePoint from "@/components/Canvas/Menu/TogglePoint.vue";
import DeletePoint from "@/components/Canvas/Menu/DeletePoint.vue";
import SplitSegment from "@/components/Canvas/Menu/SplitSegment.vue";
import Slider from "@/components/Canvas/Slider.vue";

import "vue3-colorpicker/style.css";

import {
  useCanvasParams,
  useCanasAsset,
  roundRect,
  Tools,
  Pos,
  useToolHandleMode,
} from "@/utils/canvasUtil";

import { useUndoStack } from "@/utils/undo";
import { useDrag } from "@/utils/Drag";

export default defineComponent({
  name: "HomePage",
  components: {
    ColorPicker,
    Layers,
    Undo,
    Close,
    ToggleGrid,
    TogglePoint,
    DeletePoint,
    SplitSegment,
    Slider,
  },
  props: {
    drawing: {
      type: Object as PropType<Drawing>,
      required: true,
    },
    remixes: {
      type: Array as PropType<Remix[]>,
      required: true,
    },
    addresses: {
      type: Object,
      required: true,
    },
  },
  setup(props, context) {
    const canvasOffset = ref<Pos>({ x: 40, y: 0 });
    const setCanvasOffset = (pos: Pos) => {
      console.log("*** updateCanvasOffset", pos);
      canvasOffset.value = pos;
    };

    const { canvasParams, assetXtoCanvasX, assetYtoCanvasY } =
      useCanvasParams();
    const { getAssetPos } = useCanasAsset(canvasOffset);

    const layerIndex = ref<number>(0);
    const pointIndex = ref<number>(0);
    const overlayIndex = ref<number>(0);
    const currentLayerType = ref<number>(LayerType.NONE);

    const currentDrawing = ref<Drawing>(props.drawing);

    const remixTransformString = computed(() => {
      return transformStyle(
        currentDrawing.value.remix.transform,
        canvasParams.value.canw / canvasParams.value.assw
      );
    });

    const stagingColor = ref<string>(""); // staging for undoable color change
    const currentColor = ref<string>("");
    watch([stagingColor], ([color]) => {
      if (currentColor.value != color) {
        recordState();
        currentColor.value = color;
      }
    });

    const { recordState, isRedoable, isUndoable, _undo, _redo } =
      useUndoStack(currentDrawing);

    const {
      toolHandleMode,
      toolHandles,
      onClickToolHandle,
      moveToolPos,
      cursors,
    } = useToolHandleMode(currentLayerType, currentDrawing, overlayIndex);

    const stagingRatio = ref<number | null>(null); // staging for curve ratio
    watch(
      [pointIndex, cursors, currentLayerType, toolHandleMode],
      ([index, points, type, mode]) => {
        if (type == LayerType.LAYER && !mode && !points[index].c) {
          stagingRatio.value = points[index].r;
        } else {
          stagingRatio.value = null;
        }
      }
    );
    const updateRatio = (value: number) => {
      stagingRatio.value = value;
      if (currentLayerType.value == LayerType.LAYER && !toolHandleMode.value) {
        recordState();
        cursors.value = cursors.value.map((cursor, index) => {
          if (index == pointIndex.value) {
            return {
              x: cursor.x,
              y: cursor.y,
              c: false,
              r: value,
            };
          }
          return cursor;
        });
      }
    };

    const updateRemix = (remix: Remix | null) => {
      recordState();
      const newValue: Drawing = {
        layers: currentDrawing.value.layers,
        overlays: currentDrawing.value.overlays,
        remix: { tokenId: 0, transform: identityTransform },
      };
      if (remix) {
        newValue.remix = Object.assign({}, remix);
      }
      currentDrawing.value = newValue;
    };
    const remixSelected = () => {
      currentLayerType.value = LayerType.REMIX;
      toolHandleMode.value = true;
      const remix = currentDrawing.value.remix;
      currentColor.value = remix.color || "";
      stagingColor.value = remix.color || "";
    };

    watch([cursors, currentColor], ([points, color]) => {
      const newValue = Object.assign({}, currentDrawing.value);

      switch (currentLayerType.value) {
        case LayerType.REMIX:
          {
            const newRemix = Object.assign({}, newValue.remix);
            newRemix.color = color;
            const svg =
              '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n' +
              `<defs>\n${newRemix.svgPart}\n</defs>\n` +
              `<use href="#${newRemix.svgTag}" fill="${color}"/>\n` +
              "</svg>\n";
            newRemix.image =
              "data:image/svg+xml;base64," +
              Buffer.from(svg).toString("base64");
            newValue.remix = newRemix;
          }
          break;
        case LayerType.LAYER:
          newValue.layers = currentDrawing.value.layers.map((layer, index) => {
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
          break;
        case LayerType.OVERLAY:
          newValue.overlays = currentDrawing.value.overlays.map(
            (overlay, index) => {
              if (index == overlayIndex.value) {
                const newOverlay = Object.assign({}, overlay);
                newOverlay.fill = color;
                const svg =
                  '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n' +
                  `<defs>\n${overlay.svgPart}\n</defs>\n` +
                  `<use href="#${overlay.svgTag}" fill="${color}"/>\n` +
                  "</svg>\n";
                //console.log(svg);
                newOverlay.image =
                  "data:image/svg+xml;base64," +
                  Buffer.from(svg).toString("base64");
                return newOverlay;
              }
              return overlay;
            }
          );
      }
      currentDrawing.value = newValue;
    });
    const updateLayerIndex = (index: number) => {
      const layers = currentDrawing.value.layers;
      layerIndex.value = (index + layers.length) % layers.length;
      const layer = layers[layerIndex.value];
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
      currentDrawing,
      overlayIndex,
      canvasOffset
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
    const updateLayers = (layers: Layer[], index: number) => {
      recordState();
      const newValue = Object.assign({}, currentDrawing.value);
      newValue.layers = layers;
      currentDrawing.value = newValue;
      updateLayerIndex(index);
    };
    const updateOverlays = (overlays: Overlay[]) => {
      recordState();
      const newValue = Object.assign({}, currentDrawing.value);
      newValue.overlays = overlays;
      currentDrawing.value = newValue;
      updateOverlayIndex(overlayIndex.value);
    };
    const onSelectLayer = (index: number) => {
      updateLayerIndex(index);
      currentLayerType.value = LayerType.LAYER;
    };
    const updateOverlayIndex = (index: number) => {
      const overlays = currentDrawing.value.overlays;
      if (overlays.length == 0) {
        currentLayerType.value = LayerType.NONE;
        return;
      }
      overlayIndex.value = (index + overlays.length) % overlays.length;
      const overlay = overlays[overlayIndex.value];
      currentColor.value = overlay.fill;
      stagingColor.value = overlay.fill;
      console.log("overlay.fill", overlay.fill, currentColor.value);
    };
    const onSelectOverlay = (index: number) => {
      updateOverlayIndex(index);
      currentLayerType.value = LayerType.OVERLAY;
      toolHandleMode.value = true;
    };
    const drop = (evt: MouseEvent) => {
      evt.preventDefault();
    };
    const onClose = () => {
      context.emit("close", currentDrawing.value);
    };
    const onClickToPickLayer = (evt: MouseEvent) => {
      const results: number[] = [];
      const pos = getAssetPos(evt) as Pos;
      if (currentDrawing.value.overlays.length > 0) {
        for (var i = currentDrawing.value.overlays.length - 1; i >= 0; i--) {
          const overlay = currentDrawing.value.overlays[i];
          const dx = canvasParams.value.assw / 2 + overlay.transform.tx - pos.x;
          const dy = canvasParams.value.assh / 2 + overlay.transform.ty - pos.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          console.log(
            d,
            (canvasParams.value.assw / 2) * overlay.transform.scale
          );
          if (d < (canvasParams.value.assw / 2) * overlay.transform.scale) {
            updateOverlayIndex(i);
            currentLayerType.value = LayerType.OVERLAY;
            toolHandleMode.value = true;
            return;
          }
        }
      }
      currentDrawing.value.layers.forEach((layer: Layer, index: number) => {
        if (
          pos.x >
            Math.min.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          pos.x <
            Math.max.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          pos.y >
            Math.min.apply(
              null,
              layer.points.map((p) => p.y)
            ) &&
          pos.y <
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
        return;
      }
      if (currentDrawing.value.remix.image) {
        remixSelected();
        currentColor.value = currentDrawing.value.remix.color || "";
        stagingColor.value = currentDrawing.value.remix.color || "";
      }
    };
    const overlayTransform = (index: number) => {
      return transformStyle(
        currentDrawing.value.overlays[index].transform,
        canvasParams.value.canw / canvasParams.value.assw
      );
    };
    const AssetSelected = (
      key: string,
      index: number,
      image: string,
      assetId: number
    ) => {
      console.log("AssetSelected", key, index, assetId);
    };
    const hasLayerMode = computed(() => {
      return currentLayerType.value != LayerType.NONE;
    });
    return {
      toolHandleMode,
      Tools,
      cursors,
      pointIndex,
      stagingColor,
      stagingRatio,
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
      currentDrawing,
      grid,
      toggleGrid,
      onClickToPickLayer,
      updateRemix,
      remixSelected,

      assetXtoCanvasX,
      assetYtoCanvasY,
      currentLayerType,
      remixTransformString,
      AssetSelected,
      updateOverlays,
      onSelectOverlay,
      overlayIndex,
      overlayTransform,
      setCanvasOffset,
      canvasOffset,
      hasLayerMode,
      updateRatio,
    };
  },
  mounted() {
    const divCanvas: any = this.$refs.divCanvas;
    const clientRect = divCanvas.getBoundingClientRect();
    //console.log("*** divCanvas", clientRect, clientRect.y + window.scrollY);
    this.setCanvasOffset({ x: clientRect.x, y: clientRect.y + window.scrollY });
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
