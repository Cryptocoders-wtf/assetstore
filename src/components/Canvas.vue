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
      <img
      @touchmove="dragOver"
    >
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
      <div v-if="!toolHadleMode">
        <div
          v-for="(cursor, index) in cursors"
          :key="index"
          :style="`width:${curw}px; height:${curh}px; left:${
            cursor.x - curw / 2
          }px; top:${cursor.y - curh / 2}px`"
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
      <div v-if="toolHadleMode">
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
        @insertLayer="insertLayer($event)"
        @pivotLayer="pivotLayer($event)"
        @copyLayer="copyLayer($event)"
        @onSelectLayer="onSelectLayer($event)"
        @deleteLayer="deleteLayer()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import {
  Point,
  Layer,
  Drawing,
  svgImageFromPath,
  pathFromPoints,
  splitPoint,
  togglePointType,
} from "@/models/point";
import { computed } from "@vue/reactivity";
import { ColorPicker } from "vue3-colorpicker";

import TokenPicker from "@/components/TokenPicker.vue";
import Layers from "@/components/Canvas/Layers.vue";

import { Token } from "@/models/token";
import "vue3-colorpicker/style.css";

import {
  canvasParams,
  roundRect,
  getPageX,
  getPageY,
  getOffsetX,
  getOffsetY,
} from "@/utils/canvasUtil";

const { curw, curh } = canvasParams;

enum Tools {
  CURSOR,
  MOVE,
  ZOOM,
  ROTATE,
}

interface State {
  layers: Layer[];
  layerIndex: number;
  pointIndex: number;
  token: Token | null;
}

interface Pos {
  x: number;
  y: number;
}

interface UIPos extends Pos {
  top: number;
  left: number;
}

interface RotationInfo {
  radian: number;
  cos: number;
  sin: number;
}

export default defineComponent({
  name: "HomePage",
  components: { ColorPicker, TokenPicker, Layers },
  props: ["drawing", "tokens"],
  setup(props, context) {
    const grid = ref<number>(0);
    const undoStack = ref<State[]>([]);
    const undoIndex = ref<number>(0);
    const currentTool = ref<Tools>(0);
    const recordState = () => {
      const array = undoStack.value.filter((state, index) => {
        return index < undoIndex.value;
      });
      array.push({
        layers: layers.value,
        layerIndex: layerIndex.value,
        pointIndex: pointIndex.value,
        token: currentToken.value,
      });
      undoStack.value = array;
      undoIndex.value = undoStack.value.length;
    };

    const isRedoable = computed(() => {
      return undoIndex.value + 1 < undoStack.value.length;
    });

    const isUndoable = computed(() => {
      return undoIndex.value > 0;
    });
    const undo = () => {
      console.log("undo", isUndoable.value);
      if (!isUndoable.value) {
        return;
      }
      if (!isRedoable.value) {
        recordState();
        undoIndex.value -= 1;
      }
      const state = undoStack.value[undoIndex.value - 1];
      layers.value = state.layers;
      updateLayerIndex(state.layerIndex);
      pointIndex.value = state.pointIndex;
      currentToken.value = state.token;
      undoIndex.value -= 1;
    };
    const redo = () => {
      if (!isRedoable.value) {
        return;
      }
      const state = undoStack.value[undoIndex.value + 1];
      layers.value = state.layers;
      updateLayerIndex(state.layerIndex);
      pointIndex.value = state.pointIndex;
      currentToken.value = state.token;
      undoIndex.value += 1;
    };
    const onColorFocus = () => {
      recordState();
    };

    const currentToken = ref<Token | null>(null);
    const tokenSelected = (token: Token) => {
      recordState();
      currentToken.value = token;
    };

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
    const cursors = ref<Point[]>([]);
    const currentColor = ref<string>("");
    const pivotPos = ref<Pos>({ x: 0, y: 0 });
    const moveToolPos = computed(() => {
      const { x, y, top, left } = cursors.value.reduce(
        ({ x, y }: Pos, cursor): UIPos => {
          return {
            x: Math.round(x + cursor.x / cursors.value.length),
            y: Math.round(y + cursor.y / cursors.value.length),
            left: Math.round(x + cursor.x / cursors.value.length) - curh / 2,
            top: Math.round(y + cursor.y / cursors.value.length) - curw / 2,
          };
        },
        { x: 0, y: 0, top: 0, left: 0 }
      );
      return { x, y, top, left };
    });
    const toolHadleMode = ref<boolean>(false);
    const toolHandles = computed(() => {
      const { toold } = canvasParams;
      return [
        {
          type: Tools.ROTATE,
          x: moveToolPos.value.left + toold,
          y: moveToolPos.value.top,
        },
        {
          type: Tools.ROTATE,
          x: moveToolPos.value.left - toold,
          y: moveToolPos.value.top,
        },
        {
          type: Tools.ZOOM,
          x: moveToolPos.value.left,
          y: moveToolPos.value.top + toold,
        },
        {
          type: Tools.ZOOM,
          x: moveToolPos.value.left,
          y: moveToolPos.value.top - toold,
        },
      ];
    });
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

    const offsetX = ref<number>(0);
    const offsetY = ref<number>(0);
    const startPoint = ref<Pos>({ x: 0, y: 0 });
    const initialCursors = ref<Point[]>([]);
    const onSelect = (evt: Event, index: number) => {
      pointIndex.value = index;
    };
    const dragToolHandleStart = (evt: DragEvent | TouchEvent, tool: Tools) => {
      currentTool.value = tool;
      offsetX.value = curw / 2;
      offsetY.value = curh / 2;
      startPoint.value.x = getPageX(evt);
      startPoint.value.y = getPageY(evt);
      pivotPos.value = moveToolPos.value;
      initialCursors.value = cursors.value;
      recordState();
    };
    const dragLayerImgStart = (evt: MouseEvent | TouchEvent) => {
      currentTool.value = Tools.MOVE;
      offsetX.value = curw / 2;
      offsetY.value = curh / 2;
      startPoint.value.x = getPageX(evt);
      startPoint.value.y = getPageY(evt);
      initialCursors.value = cursors.value;
      recordState();
    };
    const onClickToolHandle = () => {
      toolHadleMode.value = !toolHadleMode.value;
    };
    const dragStart = (evt: DragEvent | TouchEvent, index: number) => {
      currentTool.value = Tools.CURSOR;
      offsetX.value = getOffsetX(evt);
      offsetY.value = getOffsetY(evt);
      pointIndex.value = index;
      recordState();
    };
    const dragOver = (evt: DragEvent | TouchEvent) => {
      const { offx, offy } = canvasParams;
      const g = grid.value;
      const gridder = (pos: Pos): Pos => {
        const f = (n: number) => (g == 0 ? n : Math.round(n / g) * g);
        return {
          x: f(pos.x),
          y: f(pos.y),
        };
      };
      const limiter = (pos: Pos): Pos => {
        const { canw, canh } = canvasParams;
        const f = (can: number, n: number, offset: number, cur: number) =>
          Math.max(0, Math.min(can - g - 1, n - offset + cur / 2));
        return {
          x: f(canw, pos.x, offsetX.value, curw),
          y: f(canh, pos.y, offsetY.value, curh),
        };
      };
      const magnification =
        currentTool.value === Tools.ZOOM &&
        Math.abs(pivotPos.value.y + offy - startPoint.value.y) !== 0
          ? Math.abs(pivotPos.value.y + offy - getPageY(evt)) /
            Math.abs(pivotPos.value.y + offy - startPoint.value.y)
          : 0;
      const rad =
        currentTool.value === Tools.ROTATE
          ? pivotPos.value.x + offx - startPoint.value.x > 1
            ? Math.atan2(
                pivotPos.value.y + offy - getPageY(evt),
                pivotPos.value.x + offx - getPageX(evt)
              )
            : (Math.atan2(
                pivotPos.value.y + offy - getPageY(evt),
                pivotPos.value.x + offx - getPageX(evt)
              ) +
                Math.PI) %
              (2 * Math.PI)
          : 0;
      const RotationInfo: RotationInfo =
        currentTool.value === Tools.ROTATE
          ? {
              radian: rad,
              sin: Math.sin(rad),
              cos: Math.cos(rad),
            }
          : { radian: 0, sin: 0, cos: 0 };
      cursors.value = cursors.value.map((cursor, index) => {
        switch (currentTool.value) {
          case Tools.ZOOM:
            return {
              ...gridder(
                limiter({
                  x:
                    initialCursors.value[index].x * magnification +
                    (pivotPos.value.x - pivotPos.value.x * magnification),
                  y:
                    initialCursors.value[index].y * magnification +
                    (pivotPos.value.y - pivotPos.value.y * magnification),
                })
              ),
              c: cursor.c,
            };
          case Tools.ROTATE:
            return {
              ...gridder(
                limiter({
                  x:
                    (initialCursors.value[index].x - pivotPos.value.x) *
                      RotationInfo.cos -
                    (initialCursors.value[index].y - pivotPos.value.y) *
                      RotationInfo.sin +
                    pivotPos.value.x,
                  y:
                    (initialCursors.value[index].x - pivotPos.value.x) *
                      RotationInfo.sin +
                    (initialCursors.value[index].y - pivotPos.value.y) *
                      RotationInfo.cos +
                    pivotPos.value.y,
                })
              ),
              c: cursor.c,
            };
          case Tools.MOVE:
            return {
              ...gridder(
                limiter({
                  x:
                    initialCursors.value[index].x -
                    (startPoint.value.x - getPageX(evt)),
                  y:
                    initialCursors.value[index].y -
                    (startPoint.value.y - getPageY(evt)),
                })
              ),
              c: cursor.c,
            };
          case Tools.CURSOR:
          default:
            if (index == pointIndex.value) {
              return {
                ...gridder(
                  limiter({ x: getPageX(evt) - offx - 3, y: getPageY(evt) - offy - 3 })
                ),
                c: cursor.c,
              };
            }
        }
        return cursor;
      });
      evt.preventDefault();
    };
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
    const toggleGrid = () => {
      grid.value = (grid.value + 8) % 40;
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
      toolHadleMode,
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
    };
  },
});
</script>
