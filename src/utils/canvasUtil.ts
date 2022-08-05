import { Point } from "@/models/point";

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
