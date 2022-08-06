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

const canvasSize = {w: 1024, h: 1024};
export const canvasParams = {
  canw: canvasSize.w,
  canh: canvasSize.h,
  offx: 40, // fix
  offy: 80, // fix
  curw: canvasSize.w * 30 / 512,
  curh: canvasSize.h  * 30 / 512,
  sidew: 150,  //fix
  toold: canvasSize.w * 60 / 512,
};

const { canw, canh } = canvasParams;

const assetSize = {w: 512, h: 512 };
export const roundRect: Point[] = [
  { x: assetSize.w / 4, y: assetSize.h / 4, c: false },
  { x: assetSize.w - assetSize.w / 4, y: assetSize.h / 4, c: false },
  { x: assetSize.w - assetSize.w / 4, y: assetSize.h - assetSize.h / 4, c: false },
  { x: assetSize.w / 4, y: assetSize.h - assetSize.h / 4, c: false },
];

export const getPageX = (evt: DragEvent | MouseEvent | TouchEvent): number =>
  evt instanceof TouchEvent ? evt.targetTouches[0].pageX : evt.pageX;

export const getPageY = (evt: DragEvent | MouseEvent | TouchEvent): number =>
  evt instanceof TouchEvent ? evt.targetTouches[0].pageY : evt.pageY;

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
  const moveToolPos = computed(() => {
    const { x, y, top, left } = cursors.value.reduce(
      ({ x, y }: Pos, cursor): UIPos => {
        return {
          x: Math.round(x + cursor.x / cursors.value.length),
          y: Math.round(y + cursor.y / cursors.value.length),
          left:
            Math.round(x + cursor.x / cursors.value.length) -
            canvasParams.curh / 2,
          top:
            Math.round(y + cursor.y / cursors.value.length) -
            canvasParams.curw / 2,
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
