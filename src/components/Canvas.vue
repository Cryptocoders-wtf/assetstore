<template>
  <div
    style="width: 100%"
    @drop="drop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <div
      :style="`width:${canw}px; height:${canh}px; left:${offx}px; top:${offy}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-100"
      @dragover="dragOver"
    >
      <img
        v-if="currentToken"
        class="absolute"
        :src="currentToken.image"
        :style="`width:${canw}px; height:${canh}px`"
      />
      <img @touchmove="dragOver" />
      <img
        v-for="(layer, index) in layers"
        :key="index"
        :src="layer.svgImage"
        class="absolute"
        draggable="false"
        :style="
          `width:${canw}px; height:${canh}px;` +
          `opacity:${index > layerIndex ? '0.5' : '1.0'}`
        "
        @click="onClickToPickLayer($event)"
      />
      <div v-if="!toolHandleMode">
        <div
          v-for="(cursor, index) in cursors"
          :key="index"
          :style="`width:${curw}px; height:${curh}px; left:${assetXtoCanvasX(
            cursor.x - curw / 2
          )}px; top:${assetYtoCanvasY(cursor.y - curh / 2)}px`"
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
      <div
        class="absolute border-2 border-solid border-red-800"
        :style="
          `width:${curw}px; height:${curh}px; ` +
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
          class="absolute border-2 border-solid"
          :class="
            type === Tools.ROTATE ? 'border-green-800' : 'border-yellow-800'
          "
          :style="`width:${curw}px; height:${curh}px;
          left: ${x}px; top: ${y}px;`"
          draggable="true"
          @dragstart="dragToolHandleStart($event, type)"
          @touchstart="dragToolHandleStart($event, type)"
        />
      </div>
    </div>
    <div
      :style="`width:${sidew}px; height:${canh}px; left:${
        offx + canw - 2
      }px; top:${offy}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-300"
    >
      <div class="ml-2 mr-2 flex justify-between">
        <div>
          <button
            @click="undo"
            :disabled="!isUndoable"
            :style="`opacity:${isUndoable ? '1.0' : '0.5'}`"
          >
            <span class="material-icons">undo</span>
          </button>
          <button
            :style="`opacity:${isRedoable ? '1.0' : '0.5'}`"
            class="ml-1"
            @click="redo"
            :disabled="!isRedoable"
          >
            <span class="material-icons">redo</span>
          </button>
        </div>
        <button @click="onClose">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div>
        <token-picker
          :tokens="tokens"
          @tokenSelected="tokenSelected"
          :selectedToken="currentToken"
        />
      </div>
      <div>
        <button @click="toggleGrid" class="ml-2 flex">
          <span class="material-icons">view_module</span>
          <span>{{ grid }}</span>
        </button>
      </div>
      <div class="ml-2 mr-2 flex justify-between">
        <button @click="togglePoint">
          <span v-if="isSharpCorner()" class="material-icons"
            >check_box_outline_blank</span
          >
          <span v-else class="material-icons">radio_button_unchecked</span>
        </button>
        <button
          :disabled="cursors.length <= 3"
          @click="deletePoint"
          :style="`opacity:${cursors.length > 3 ? '1.0' : '0.5'}`"
        >
          <span class="material-icons">delete</span>
        </button>
        <button @click="splitSegment">
          <span class="material-icons">add_circle</span>
        </button>
      </div>
      <div>
        <color-picker
          style="`margin: 10px; width: 100%"
          v-model:pureColor="currentColor"
        />
      </div>
    </div>
    <div
      :style="`width:${sidew}px; height:${canh}px; left:${
        offx + canw - 2 + sidew
      }px; top:${offy}px`"
      class="absolute border-2 border-solid border-blue-700 bg-slate-300"
    >
      <Layers
        :layers="layers"
        :layerIndex="layerIndex"
        @insertLayer="insertLayer"
        @pivotLayer="pivotLayer"
        @copyLayer="copyLayer"
        @onSelectLayer="onSelectLayer"
        @deleteLayer="deleteLayer"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import {
  Layer,
  Drawing,
  svgImageFromPath,
  pathFromPoints,
  splitPoint,
  togglePointType,
} from "@/models/point";
import { ColorPicker } from "vue3-colorpicker";

import TokenPicker from "@/components/TokenPicker.vue";
import Layers from "@/components/Canvas/Layers.vue";

import { Token } from "@/models/token";
import "vue3-colorpicker/style.css";

import {
  canvasParams,
  roundRect,
  Tools,
  useToolHandleMode,
  assetXtoCanvasX,
  assetYtoCanvasY,
} from "@/utils/canvasUtil";

import { useUndoStack } from "@/utils/undo";
import { useDrag } from "@/utils/Drag";

export default defineComponent({
  name: "HomePage",
  components: { ColorPicker, TokenPicker, Layers },
  props: ["drawing", "tokens"],
  setup(props, context) {
    const currentToken = ref<Token | null>(null);
    const layerIndex = ref<number>(0);
    const pointIndex = ref<number>(0);
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
    const currentColor = ref<string>("");

    const { recordState, isRedoable, isUndoable, _undo, _redo } = useUndoStack(
      layers,
      layerIndex,
      pointIndex,
      currentToken
    );

    const {
      toolHandleMode,
      toolHandles,
      onClickToolHandle,
      moveToolPos,
      cursors,
    } = useToolHandleMode();

    const onColorFocus = () => {
      recordState();
    };

    const tokenSelected = (token: Token) => {
      recordState();
      currentToken.value = token;
    };

    const fetchToken = async () => {
      console.log("*** fetchToken", props.drawing.remixId, props.tokens.length);
      if (props.drawing.remixId > 0) {
        const index = Math.floor(props.drawing.remixId / 4);
        if (index < props.tokens.length) {
          currentToken.value = props.tokens[index];
          console.log(
            "*** fetchToken2",
            props.drawing.remixId,
            currentToken.value
          );
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
      pointIndex.value = 0;
    };
    updateLayerIndex(0);
    const undo = () => {
      const index = _undo();
      if (index !== null) {
        updateLayerIndex(index);
      }
    };
    const redo = () => {
      const index = _redo();
      if (index !== null) {
        updateLayerIndex(index);
      }
    };

    const onSelect = (evt: Event, index: number) => {
      pointIndex.value = index;
    };
    const {
      dragLayerImgStart,
      dragToolHandleStart,
      dragStart,
      dragOver,
      currentTool,
      toggleGrid,
      grid,
    } = useDrag(pointIndex, moveToolPos, cursors, recordState);

    const togglePoint = () => {
      recordState();
      cursors.value = togglePointType(cursors.value, pointIndex.value);
    };
    const isSharpCorner = () => {
      return cursors.value[pointIndex.value].c;
    };
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
    const insertLayer = (index: number) => {
      recordState();
      const array = layers.value.map((layer) => layer);
      const path = pathFromPoints(roundRect);
      const newLayer = {
        points: roundRect,
        color: currentColor.value,
        path,
        svgImage: svgImageFromPath(path, currentColor.value),
      };
      array.splice(index, 0, newLayer);
      layers.value = array;
      updateLayerIndex(index);
    };
    const deleteLayer = () => {
      if (layers.value.length == 1) {
        return;
      }
      recordState();
      layers.value = layers.value.filter((layer, index) => {
        return index != layerIndex.value;
      });
      updateLayerIndex(layerIndex.value - 1);
    };
    const copyLayer = (index: number) => {
      recordState();
      const array = layers.value.map((layer) => layer);
      const newLayer = { ...layers.value[index] };
      array.splice(index, 0, newLayer);
      layers.value = array;
      updateLayerIndex(index);
    };
    const pivotLayer = (index: number) => {
      recordState();
      const array = layers.value.map((layer) => layer);
      const tmp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = tmp;
      layers.value = array;
      updateLayerIndex(index);
    };
    const onSelectLayer = (index: number) => {
      updateLayerIndex(index);
    };
    const drop = (evt: MouseEvent) => {
      evt.preventDefault();
    };
    const onClose = () => {
      const token = currentToken.value;
      const drawing: Drawing = {
        layers: layers.value,
        remixId: token ? token.tokenId + 1 : 0,
      };
      context.emit("close", drawing);
    };
    const onClickToPickLayer = (evt: MouseEvent) => {
      const { offx, offy } = canvasParams;
      const results: number[] = [];
      layers.value.forEach((layer: Layer, index: number) => {
        if (
          evt.pageX - offx >
            Math.min.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          evt.pageX - offx <
            Math.max.apply(
              null,
              layer.points.map((p) => p.x)
            ) &&
          evt.pageY - offy >
            Math.min.apply(
              null,
              layer.points.map((p) => p.y)
            ) &&
          evt.pageY - offy <
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
      }
    };
    return {
      toolHandleMode,
      Tools,
      cursors,
      pointIndex,
      currentColor,
      ...canvasParams,
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
      insertLayer,
      deleteLayer,
      copyLayer,
      pivotLayer,
      onSelectLayer,
      onColorFocus,
      onClose,
      undo,
      redo,
      isUndoable,
      isRedoable,
      layerIndex,
      layers,
      grid,
      currentTool,
      toggleGrid,
      onClickToPickLayer,
      currentToken,
      tokenSelected,

      assetXtoCanvasX,
      assetYtoCanvasY,
    };
  },
});
</script>
