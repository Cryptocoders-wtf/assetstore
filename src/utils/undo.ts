import { ref, computed, Ref } from "vue";

import { Layer } from "@/models/point";
import { Token } from "@/models/token";
import { Transform } from "@/models/point";

interface State {
  layers: Layer[];
  remixToken: Token | null;
  remixTransform: Transform;
}

export const useUndoStack = (
  layers: Ref<Layer[]>,
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
    console.log("**", remixTransForm.value, state.remixTransform);
    remixTransForm.value = state.remixTransform;
    undoIndex.value -= 1;
  };
  const _redo = () => {
    if (!isRedoable.value) {
      return null;
    }
    const state = undoStack.value[undoIndex.value + 1];
    layers.value = state.layers;
    remixTransForm.value = state.remixTransform;
    undoIndex.value += 1;
  };

  return {
    recordState,

    isRedoable,
    isUndoable,

    _undo,
    _redo,
  };
};
