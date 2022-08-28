import { ref, Ref, computed } from "vue";
import { useStore } from "vuex";

import { Point, LayerType, Drawing } from "@/models/point";

export enum Tools {
  CURSOR,
  MOVE,
  ZOOM,
  ROTATE,
}

export interface Pos {
  x: number;
  y: number;
}

export interface UIPos extends Pos {
  top: number;
  left: number;
}

export interface RotationInfo {
  radian: number;
  cos: number;
  sin: number;
}

const menuSize = {
  sidew: 150, //fix
  headh: 50,
};

// const canvasSize = { w: 1024, h: 1024 };
export const assetSize = { w: 1024, h: 1024 };

export const useCanvasParams = () => {
  const store = useStore();
  // HACK: These numbers must match margin specified for Draw and Canvas
  const drawMargin = 32; // m-4 (Draw)
  const canvasMargin = 4; // m-1 (Canvas)

  const canvasSize = computed<{ w: number; h: number }>(() => {
    const canvasWidth = store.state.windowWidth - menuSize.sidew - drawMargin * 2 - canvasMargin * 3;
    return { w: canvasWidth, h: canvasWidth };
  });

  const canvasParams = computed(() => {
    return {
      canw: canvasSize.value.w,
      canh: canvasSize.value.h,
      curw: (canvasSize.value.w * 30) / assetSize.w,
      curh: (canvasSize.value.h * 30) / assetSize.h,
      toold: (canvasSize.value.w * 100) / assetSize.w,
      assw: assetSize.w,
      assh: assetSize.h,
      caratio: canvasSize.value.w / assetSize.w,
      ...menuSize,
    };
  });

  const canvasXtoAssetX = (x: number) => {
    return (x / canvasSize.value.w) * assetSize.w;
  };
  const canvasYtoAssetY = (y: number) => {
    return (y / canvasSize.value.h) * assetSize.h;
  };
  const assetXtoCanvasX = (x: number) => {
    return (x / assetSize.w) * canvasSize.value.w;
  };
  const assetYtoCanvasY = (y: number) => {
    return (y / assetSize.h) * canvasSize.value.h;
  };

  const canvastoAsset = ({ x, y }: Pos): Pos => {
    return { x: canvasXtoAssetX(x), y: canvasYtoAssetY(y) };
  };

  const getOffsetX = (evt: DragEvent | MouseEvent | TouchEvent): number =>
    evt instanceof TouchEvent ? 0 : evt.offsetX / canvasParams.value.caratio;

  const getOffsetY = (evt: DragEvent | MouseEvent | TouchEvent): number =>
    evt instanceof TouchEvent ? 0 : evt.offsetY / canvasParams.value.caratio;

  return {
    canvasParams,
    assetXtoCanvasX,
    assetYtoCanvasY,
    getOffsetX,
    getOffsetY,
    canvastoAsset,
  };
};

export const useCanasAsset = (canvasOffset:Ref<Pos>) => {
  const { canvastoAsset } = useCanvasParams();
  const getAssetPos = (evt: DragEvent | MouseEvent | TouchEvent): Pos => {
    const x =
      evt instanceof TouchEvent ? evt.targetTouches[0].pageX : evt.pageX - canvasOffset.value.x;
    const y =
      evt instanceof TouchEvent ? evt.targetTouches[0].pageY : evt.pageY - canvasOffset.value.y;
    return canvastoAsset({x,y});
  };
  return {
    getAssetPos
  };
};

export const roundRect: Point[] = [
  { x: assetSize.w / 4, y: assetSize.h / 4, c: false },
  { x: assetSize.w - assetSize.w / 4, y: assetSize.h / 4, c: false },
  {
    x: assetSize.w - assetSize.w / 4,
    y: assetSize.h - assetSize.h / 4,
    c: false,
  },
  { x: assetSize.w / 4, y: assetSize.h - assetSize.h / 4, c: false },
];

export const useToolHandleMode = (
  currentLayerType: Ref<number>,
  currentDrawing: Ref<Drawing>,
  overlayIndex: Ref<number>
) => {
  const { assetXtoCanvasX, assetYtoCanvasY, canvasParams } = useCanvasParams();
  const cursors = ref<Point[]>([]);
  const toolHandleMode = ref<boolean>(true);
  const toolHandles = computed(() => {
    return [
      {
        type: Tools.ROTATE,
        x: moveToolPos.value.left + canvasParams.value.toold,
        y: moveToolPos.value.top,
      },
      {
        type: Tools.ROTATE,
        x: moveToolPos.value.left - canvasParams.value.toold,
        y: moveToolPos.value.top,
      },
      {
        type: Tools.ZOOM,
        x: moveToolPos.value.left,
        y: moveToolPos.value.top + canvasParams.value.toold,
      },
      {
        type: Tools.ZOOM,
        x: moveToolPos.value.left,
        y: moveToolPos.value.top - canvasParams.value.toold,
      },
    ];
  });
  const onClickToolHandle = () => {
    if (currentLayerType.value == LayerType.LAYER) {
      toolHandleMode.value = !toolHandleMode.value;
    }
  };
  const moveToolPos = computed<UIPos>(() => {
    switch (currentLayerType.value) {
      case LayerType.LAYER:
        return cursors.value.reduce(
          ({ x, y }: Pos, cursor): UIPos => {
            const resultX = Math.round(
              x + assetXtoCanvasX(cursor.x) / cursors.value.length
            );
            const resultY = Math.round(
              y + assetYtoCanvasY(cursor.y) / cursors.value.length
            );
            return {
              x: resultX,
              y: resultY,
              left: resultX - canvasParams.value.curh / 2,
              top: resultY - canvasParams.value.curw / 2,
            };
          },
          { x: 0, y: 0, top: 0, left: 0 }
        );

      case LayerType.REMIX: {
        const resultX =
          canvasParams.value.canh / 2 +
          assetXtoCanvasX(currentDrawing.value.remix.transform.tx || 0);
        const resultY =
          canvasParams.value.canw / 2 +
          assetYtoCanvasY(currentDrawing.value.remix.transform.ty || 0);
        return {
          x: resultX,
          y: resultY,
          left: resultX - canvasParams.value.curh / 2,
          top: resultY - canvasParams.value.curw / 2,
        };
      }
      case LayerType.OVERLAY: {
        const overlay = currentDrawing.value.overlays[overlayIndex.value];
        const resultX =
          canvasParams.value.canh / 2 +
          assetXtoCanvasX(overlay.transform.tx || 0);
        const resultY =
          canvasParams.value.canw / 2 +
          assetYtoCanvasY(overlay.transform.ty || 0);
        return {
          x: resultX,
          y: resultY,
          left: resultX - canvasParams.value.curh / 2,
          top: resultY - canvasParams.value.curw / 2,
        };
      }
    }
    return { x: 0, y: 0, top: 0, left: 0 };
  });

  return {
    toolHandleMode,
    toolHandles,
    onClickToolHandle,
    moveToolPos,
    cursors,
  };
};
