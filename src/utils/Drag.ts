import { ref, Ref, ComputedRef } from "vue";

import {
  useCanvasParams,
  menuSize,
  Pos,
  UIPos,
  Tools,
  RotationInfo,
} from "@/utils/canvasUtil";
import { Point } from "@/models/point";

// const { curw, curh } = canvasParams;

export const useDrag = (
  pointIndex: Ref<number>,
  moveToolPos: ComputedRef<UIPos>,
  cursors: Ref<Point[]>,
  recordState: () => void
) => {
  const {
    getPageX,
    getPageY,
    getOffsetX,
    getOffsetY,
    canvastoAsset,
    canvasParams,
  } = useCanvasParams();
  const pivotPos = ref<Pos>({ x: 0, y: 0 });
  const offsetX = ref<number>(0);
  const offsetY = ref<number>(0);
  const startPoint = ref<Pos>({ x: 0, y: 0 });
  const initialCursors = ref<Point[]>([]);
  const grid = ref<number>(0);

  const currentTool = ref<Tools>(0);

  const toggleGrid = () => {
    grid.value = (grid.value + 8) % 40;
  };

  const dragToolHandleStart = (evt: DragEvent | TouchEvent, tool: Tools) => {
    currentTool.value = tool;
    offsetX.value = canvasParams.value.curw / 2;
    offsetY.value = canvasParams.value.curh / 2;
    startPoint.value.x = getPageX(evt);
    startPoint.value.y = getPageY(evt);
    pivotPos.value = canvastoAsset(moveToolPos.value);
    initialCursors.value = cursors.value;
    recordState();
  };
  const dragLayerImgStart = (evt: MouseEvent | TouchEvent) => {
    currentTool.value = Tools.MOVE;
    offsetX.value = canvasParams.value.curw / 2;
    offsetY.value = canvasParams.value.curh / 2;
    startPoint.value.x = getPageX(evt);
    startPoint.value.y = getPageY(evt);
    initialCursors.value = cursors.value;
    recordState();
  };
  const dragStart = (evt: DragEvent | TouchEvent, index: number) => {
    currentTool.value = Tools.CURSOR;
    offsetX.value = getOffsetX(evt);
    offsetY.value = getOffsetY(evt);
    pointIndex.value = index;
    recordState();
  };
  const dragOver = (evt: DragEvent | TouchEvent) => {
    const { offx, offy } = menuSize;
    const g = grid.value;
    const gridder = (pos: Pos): Pos => {
      const f = (n: number) => (g == 0 ? n : Math.round(n / g) * g);
      return {
        x: f(pos.x),
        y: f(pos.y),
      };
    };
    const limiter = (pos: Pos): Pos => {
      const f = (can: number, n: number, offset: number, cur: number) =>
        Math.max(0, Math.min(can - g - 1, n - offset + cur / 2));
      return {
        x: f(canvasParams.value.assw, pos.x, offsetX.value, canvasParams.value.curw),
        y: f(canvasParams.value.assh, pos.y, offsetY.value, canvasParams.value.curh),
      };
    };
    const magnification =
      currentTool.value === Tools.ZOOM &&
      Math.abs(pivotPos.value.y - startPoint.value.y) !== 0
        ? Math.abs(pivotPos.value.y - getPageY(evt)) /
          Math.abs(pivotPos.value.y - startPoint.value.y)
        : 0;
    const rad =
      currentTool.value === Tools.ROTATE
        ? pivotPos.value.x + offx - startPoint.value.x > 1
          ? Math.atan2(
              pivotPos.value.y - getPageY(evt),
              pivotPos.value.x - getPageX(evt)
            )
          : (Math.atan2(
              pivotPos.value.y - getPageY(evt),
              pivotPos.value.x - getPageX(evt)
            ) +
              Math.PI) %
            (2 * Math.PI)
        : 0;
    const RotationInfo: RotationInfo =
      currentTool.value === Tools.ROTATE
        ? {
            radian: rad,
            sin: Math.sin(rad),
            cos: Math.cos(rad),
          }
        : { radian: 0, sin: 0, cos: 0 };
    cursors.value = cursors.value.map((cursor, index) => {
      switch (currentTool.value) {
        case Tools.ZOOM:
          return {
            ...gridder(
              limiter({
                x:
                  initialCursors.value[index].x * magnification +
                  (pivotPos.value.x - pivotPos.value.x * magnification),
                y:
                  initialCursors.value[index].y * magnification +
                  (pivotPos.value.y - pivotPos.value.y * magnification),
              })
            ),
            c: cursor.c,
          };
        case Tools.ROTATE:
          return {
            ...gridder(
              limiter({
                x:
                  (initialCursors.value[index].x - pivotPos.value.x) *
                    RotationInfo.cos -
                  (initialCursors.value[index].y - pivotPos.value.y) *
                    RotationInfo.sin +
                  pivotPos.value.x,
                y:
                  (initialCursors.value[index].x - pivotPos.value.x) *
                    RotationInfo.sin +
                  (initialCursors.value[index].y - pivotPos.value.y) *
                    RotationInfo.cos +
                  pivotPos.value.y,
              })
            ),
            c: cursor.c,
          };
        case Tools.MOVE:
          return {
            ...gridder(
              limiter({
                x:
                  initialCursors.value[index].x -
                  (startPoint.value.x - getPageX(evt)),
                y:
                  initialCursors.value[index].y -
                  (startPoint.value.y - getPageY(evt)),
              })
            ),
            c: cursor.c,
          };
        case Tools.CURSOR:
        default:
          if (index == pointIndex.value) {
            return {
              ...gridder(
                limiter({
                  x: getPageX(evt),
                  y: getPageY(evt),
                })
              ),
              c: cursor.c,
            };
          }
      }
      return cursor;
    });
    evt.preventDefault();
  };

  return {
    dragLayerImgStart,
    dragToolHandleStart,
    dragStart,
    dragOver,
    currentTool,
    toggleGrid,
    grid,
  };
};
