import { ref, computed } from "vue";
import { useStore } from "vuex";

import { Point } from "@/models/point";

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

export const menuSize = {
  offx: 40, // fix
  offy: 145, // fix
  sidew: 150, //fix
  headh: 50,
};

// const canvasSize = { w: 1024, h: 1024 };
const assetSize = { w: 1024, h: 1024 };
export const useCanvasParams = () => {
  const store = useStore();

  const windowWidth = computed(() => {
    return store.state.windowWidth - menuSize.sidew - menuSize.offx * 2;
  });

  const canvasSize = computed<{ w: number; h: number }>(() => {
    return { w: windowWidth.value, h: windowWidth.value };
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

  const getPageX = (evt: DragEvent | MouseEvent | TouchEvent): number => {
    const x =
      evt instanceof TouchEvent ? evt.targetTouches[0].pageX : evt.pageX;
    return canvasXtoAssetX(x - offx);
  };
  const getPageY = (evt: DragEvent | MouseEvent | TouchEvent): number => {
    const y =
      evt instanceof TouchEvent ? evt.targetTouches[0].pageY : evt.pageY;
    return canvasYtoAssetY(y - offy);
  };
  const getOffsetX = (evt: DragEvent | MouseEvent | TouchEvent): number =>
    evt instanceof TouchEvent ? 0 : evt.offsetX / canvasParams.value.caratio;

  const getOffsetY = (evt: DragEvent | MouseEvent | TouchEvent): number =>
    evt instanceof TouchEvent ? 0 : evt.offsetY / canvasParams.value.caratio;

  return {
    canvasParams,
    assetXtoCanvasX,
    assetYtoCanvasY,
    getPageX,
    getPageY,
    getOffsetX,
    getOffsetY,
    canvastoAsset,
  };
};
const { offx, offy } = menuSize;

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

export const useToolHandleMode = () => {
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
    toolHandleMode.value = !toolHandleMode.value;
  };
  const moveToolPos = computed<UIPos>(() => {
    const { x, y, top, left } = cursors.value.reduce(
      ({ x, y }: Pos, cursor): UIPos => {
        const vx = assetXtoCanvasX(cursor.x);
        const vy = assetYtoCanvasY(cursor.y);
        return {
          x: Math.round(x + vx / cursors.value.length),
          y: Math.round(y + vy / cursors.value.length),
          left:
            Math.round(x + vx / cursors.value.length) -
            canvasParams.value.curh / 2,
          top:
            Math.round(y + vy / cursors.value.length) -
            canvasParams.value.curw / 2,
        };
      },
      { x: 0, y: 0, top: 0, left: 0 }
    );
    return { x, y, top, left };
  });
  return {
    toolHandleMode,
    toolHandles,
    onClickToolHandle,
    moveToolPos,
    cursors,
  };
};
