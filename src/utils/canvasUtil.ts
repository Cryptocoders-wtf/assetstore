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

export const canvasParams = {
  canw: 512,
  canh: 512,
  offx: 40,
  offy: 80,
  curw: 30,
  curh: 30,
  sidew: 150,
  toold: 60,
};

const { canw, canh } = canvasParams;

export const roundRect: Point[] = [
  { x: canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh / 4, c: false },
  { x: canw - canw / 4, y: canh - canh / 4, c: false },
  { x: canw / 4, y: canh - canh / 4, c: false },
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
