import { ref, computed, Ref } from "vue";

import { Layer, Remix, Drawing, identityTransform } from "@/models/point";
import { id } from "ethers/lib/utils";

export const useUndoStack = (
  layers: Ref<Layer[]>,
  remix: Ref<Remix>
) => {
  const undoStack = ref<Drawing[]>([]);
  const undoIndex = ref<number>(0);

  const recordState = () => {
    const array = undoStack.value.filter((state, index) => {
      return index < undoIndex.value;
    });
    array.push({
      layers: layers.value,
      remix: remix.value,
      overlays: []
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
    const drawing = undoStack.value[undoIndex.value - 1];
    layers.value = drawing.layers;
    remix.value = drawing.remix || { tokenId:0, transform:identityTransform };
    undoIndex.value -= 1;
  };
  const _redo = () => {
    if (!isRedoable.value) {
      return null;
    }
    const drawing = undoStack.value[undoIndex.value + 1];
    layers.value = drawing.layers;
    remix.value = drawing.remix || { tokenId:0, transform:identityTransform };
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
