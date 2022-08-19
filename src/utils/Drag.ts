import { ref, Ref, ComputedRef } from "vue";

import {
  useCanvasParams,
  menuSize,
  Pos,
  UIPos,
  Tools,
  RotationInfo,
} from "@/utils/canvasUtil";
import { Point, LayerType, Transform } from "@/models/point";

// const { curw, curh } = canvasParams;

export const useDrag = (
  pointIndex: Ref<number>,
  moveToolPos: ComputedRef<UIPos>,
  cursors: Ref<Point[]>,
  recordState: () => void,
  currentLayerType: Ref<number>,
  remixTransForm: Ref<Transform>
) => {
  const {
    getPageX,
    getPageY,
    getOffsetX,
    getOffsetY,
    canvastoAsset,
    canvasParams,
  } = useCanvasParams();
  let pivotPos:Pos = { x: 0, y: 0 };
  let offsetX = 0;
  let offsetY = 0;
  let startPoint:Pos = { x: 0, y: 0 };
  let initialCursors:Point[] = [];
  let initialTransform = {tx:0, ty:0, scale:1, rotate:0};
  const grid = ref<number>(0);

  const currentTool = ref<Tools>(0);

  const toggleGrid = () => {
    grid.value = (grid.value + 8) % 40;
  };

  const dragToolHandleStart = (evt: DragEvent | TouchEvent, tool: Tools) => {
    currentTool.value = tool;
    offsetX = canvasParams.value.curw / 2;
    offsetY = canvasParams.value.curh / 2;
    startPoint = {x: getPageX(evt), y:getPageY(evt)};
    pivotPos = canvastoAsset(moveToolPos.value);
    initialCursors = cursors.value;
    initialTransform = remixTransForm.value;
    recordState();
  };
  const dragLayerImgStart = (evt: MouseEvent | TouchEvent) => {
    currentTool.value = Tools.MOVE;
    offsetX = canvasParams.value.curw / 2;
    offsetY = canvasParams.value.curh / 2;
    startPoint.x = getPageX(evt);
    startPoint.y = getPageY(evt);
    initialCursors = cursors.value;
    initialTransform = remixTransForm.value;
    recordState();
  };
  const dragStart = (evt: DragEvent | TouchEvent, index: number) => {
    currentTool.value = Tools.CURSOR;
    offsetX = getOffsetX(evt);
    offsetY = getOffsetY(evt);
    pointIndex.value = index;
    recordState();
  };
  const dragOver = (evt: DragEvent | TouchEvent) => {
    const { offx } = menuSize;
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
        x: f(
          canvasParams.value.assw,
          pos.x,
          offsetX,
          canvasParams.value.curw
        ),
        y: f(
          canvasParams.value.assh,
          pos.y,
          offsetY,
          canvasParams.value.curh
        ),
      };
    };
    const magnification =
      currentTool.value === Tools.ZOOM &&
      Math.abs(pivotPos.y - startPoint.y) !== 0
        ? Math.abs(pivotPos.y - getPageY(evt)) /
          Math.abs(pivotPos.y - startPoint.y)
        : 0;
    const rad =
      currentTool.value === Tools.ROTATE
        ? pivotPos.x + offx - startPoint.x > 1
          ? Math.atan2(
              pivotPos.y - getPageY(evt),
              pivotPos.x - getPageX(evt)
            )
          : (Math.atan2(
              pivotPos.y - getPageY(evt),
              pivotPos.x - getPageX(evt)
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

    if (currentLayerType.value === LayerType.LAYER)
      cursors.value = cursors.value.map((cursor, index) => {
        switch (currentTool.value) {
          case Tools.ZOOM:
            return {
              ...gridder(
                limiter({
                  x:
                    initialCursors[index].x * magnification +
                    (pivotPos.x - pivotPos.x * magnification),
                  y:
                    initialCursors[index].y * magnification +
                    (pivotPos.y - pivotPos.y * magnification),
                })
              ),
              c: cursor.c,
            };
          case Tools.ROTATE:
            return {
              ...gridder(
                limiter({
                  x:
                    (initialCursors[index].x - pivotPos.x) *
                      RotationInfo.cos -
                    (initialCursors[index].y - pivotPos.y) *
                      RotationInfo.sin +
                    pivotPos.x,
                  y:
                    (initialCursors[index].x - pivotPos.x) *
                      RotationInfo.sin +
                    (initialCursors[index].y - pivotPos.y) *
                      RotationInfo.cos +
                    pivotPos.y,
                })
              ),
              c: cursor.c,
            };
          case Tools.MOVE:
            return {
              ...gridder(
                limiter({
                  x:
                    initialCursors[index].x -
                    (startPoint.x - getPageX(evt)),
                  y:
                    initialCursors[index].y -
                    (startPoint.y - getPageY(evt)),
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
    if (currentLayerType.value === LayerType.REMIX) {
      // Note: We need to create a new instance in order to make it work with undo/redo.
      const tx = {tx:0, ty:0, scale:1, rotate:0};
      tx.rotate = remixTransForm.value.rotate;
      tx.scale = remixTransForm.value.scale;
      tx.tx = remixTransForm.value.tx;
      tx.ty = remixTransForm.value.ty;

      switch (currentTool.value) {
        case Tools.MOVE: {
          const { x, y } = {
            ...gridder(
              limiter({
                x: getPageX(evt),
                y: getPageY(evt),
              })
            ),
          };
          tx.tx = Math.round(x - canvasParams.value.assw / 2);
          tx.ty = Math.round(y - canvasParams.value.assh / 2);
          break;
        }
        case Tools.ZOOM: {
          tx.scale = Math.round(100 * initialTransform.scale * magnification) / 100;
          break;
        }
        case Tools.ROTATE: {
          tx.rotate = Math.round(initialTransform.rotate + RotationInfo.radian / Math.PI * 180);
          break;
        }
      }
      remixTransForm.value = tx;
    }
    evt.preventDefault();
  };

  return {
    dragLayerImgStart,
    dragToolHandleStart,
    dragStart,
    dragOver,
    toggleGrid,
    grid,
  };
};
