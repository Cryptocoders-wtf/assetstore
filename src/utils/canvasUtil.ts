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
