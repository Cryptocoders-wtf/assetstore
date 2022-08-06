import { ref, computed, Ref } from "vue";

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

const canvasSize = { w: 1024, h: 1024 };
const assetSize = { w: 512, h: 512 };

export const canvasParams = {
  canw: canvasSize.w,
  canh: canvasSize.h,
  offx: 40, // fix
  offy: 80, // fix
  curw: (canvasSize.w * 30) / assetSize.w,
  curh: (canvasSize.h * 30) / assetSize.h,
  sidew: 150, //fix
  toold: (canvasSize.w * 60) / assetSize.w,
};

const { canw, canh } = canvasParams;

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

const canvasXtoAssetX = (x: number) => {
  return (x / canvasSize.w) * assetSize.w;
};
const canvasYtoAssetY = (y: number) => {
  return (y / canvasSize.h) * assetSize.h;
};
export const assetXtoCanvasX = (x: number) => {
  return (x / assetSize.w) * canvasSize.w;
};
export const assetYtoCanvasY = (y: number) => {
  return (y / assetSize.h) * canvasSize.h;
};

export const getPageX = (evt: DragEvent | MouseEvent | TouchEvent): number => {
  const x = evt instanceof TouchEvent ? evt.targetTouches[0].pageX : evt.pageX;
  return canvasXtoAssetX(x);
};
export const getPageY = (evt: DragEvent | MouseEvent | TouchEvent): number => {
  const y = evt instanceof TouchEvent ? evt.targetTouches[0].pageY : evt.pageY;
  return canvasYtoAssetY(y);
};
export const getOffsetX = (evt: DragEvent | MouseEvent | TouchEvent): number =>
  evt instanceof TouchEvent ? 0 : evt.offsetX;

export const getOffsetY = (evt: DragEvent | MouseEvent | TouchEvent): number =>
  evt instanceof TouchEvent ? 0 : evt.offsetY;

export const useToolHandleMode = () => {
  const cursors = ref<Point[]>([]);
  const toolHandleMode = ref<boolean>(false);
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
            Math.round(x + vx / cursors.value.length) - canvasParams.curh / 2,
          top:
            Math.round(y + vy / cursors.value.length) - canvasParams.curw / 2,
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
