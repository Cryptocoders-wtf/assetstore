import { ref, computed, Ref } from "vue";

import { Layer } from "@/models/point";
import { Token } from "@/models/token";
import { TransForm } from "@/utils/canvasUtil";

interface State {
  layers: Layer[];
  layerIndex: number;
  pointIndex: number;
  token: Token | null;
  remixTransform: TransForm;
}

export const useUndoStack = (
  layers: Ref<Layer[]>,
  layerIndex: Ref<number>,
  pointIndex: Ref<number>,
  currentToken: Ref<Token | null>,
  remixTransForm: Ref<TransForm>
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
      token: currentToken.value,
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
    currentToken.value = state.token;
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
    currentToken.value = state.token;
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
