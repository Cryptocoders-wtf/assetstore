import { ref, computed, Ref } from "vue";

import { Layer } from "@/models/point";
import { Token } from "@/models/token";
import { Transform } from "@/models/point";

interface State {
  layers: Layer[];
  layerIndex: number;
  pointIndex: number;
  remixToken: Token | null;
  remixTransform: Transform;
}

export const useUndoStack = (
  layers: Ref<Layer[]>,
  layerIndex: Ref<number>,
  pointIndex: Ref<number>,
  remixToken: Ref<Token | null>,
  remixTransForm: Ref<Transform>
) => {
  const undoStack = ref<State[]>([]);
  const undoIndex = ref<number>(0);

  const recordState = () => {
    const array = undoStack.value.filter((state, index) => {
      return index < undoIndex.value;
    });
    array.push({
      layers: layers.value,
      layerIndex: layerIndex.value,
      pointIndex: pointIndex.value,
      remixToken: remixToken.value,
      remixTransform: remixTransForm.value,
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

  const _undo = () => {
    console.log("undo", isUndoable.value);
    if (!isUndoable.value) {
      return null;
    }
    if (!isRedoable.value) {
      recordState();
      undoIndex.value -= 1;
    }
    const state = undoStack.value[undoIndex.value - 1];
    layers.value = state.layers;
    // updateLayerIndex(state.layerIndex);
    pointIndex.value = state.pointIndex;
    remixToken.value = state.remixToken;
    console.log("**", remixTransForm.value, state.remixTransform);
    remixTransForm.value = state.remixTransform;
    undoIndex.value -= 1;
    return state.layerIndex;
  };
  const _redo = () => {
    if (!isRedoable.value) {
      return null;
    }
    const state = undoStack.value[undoIndex.value + 1];
    layers.value = state.layers;
    // updateLayerIndex(state.layerIndex);
    pointIndex.value = state.pointIndex;
    remixToken.value = state.remixToken;
    remixTransForm.value = state.remixTransform;
    undoIndex.value += 1;
    return state.layerIndex;
  };

  return {
    recordState,

    isRedoable,
    isUndoable,

    _undo,
    _redo,
  };
};
