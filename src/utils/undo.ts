import { ref, computed, Ref } from "vue";
import { Layer, Remix } from "@/models/point";

interface State {
  layers: Layer[];
  remix: Remix;
}

export const useUndoStack = (
  layers: Ref<Layer[]>,
  remix: Ref<Remix>
) => {
  const undoStack = ref<State[]>([]);
  const undoIndex = ref<number>(0);

  const recordState = () => {
    const array = undoStack.value.filter((state, index) => {
      return index < undoIndex.value;
    });
    array.push({
      layers: layers.value,
      remix: remix.value
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
    //console.log("**", remixTransForm.value, state.remixTransform);
    remix.value = state.remix;
    undoIndex.value -= 1;
  };
  const _redo = () => {
    if (!isRedoable.value) {
      return null;
    }
    const state = undoStack.value[undoIndex.value + 1];
    layers.value = state.layers;
    remix.value = state.remix;
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
