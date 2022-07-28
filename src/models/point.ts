export interface Point {
  x: number;
  y: number;
  c: boolean;
}

export interface Layer {
  points: Point[];
  color: string;
  path: string;
  svgImage: string;
}

export const pathFromPoints = (points: Point[]) => {
  const length = points.length;
  return points.reduce((path, cursor, index) => {
    const prev = points[(index + length - 1) % length];
    const next = points[(index + 1) % length];
    const head =
      index == 0
        ? `M${(cursor.x + prev.x) / 2},${(cursor.y + prev.y) / 2},`
        : "";
    return (
      path +
      head +
      (cursor.c ? "L" : "Q") +
      `${cursor.x},${cursor.y},` +
      `${(cursor.x + next.x) / 2},${(cursor.y + next.y) / 2}`
    );
  }, "");
};

const svgHead =
  '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">' +
  '<defs><g id="asset">';

export const svgImageFromPath = (path: string, color:string) => {
  const svgTail = "</g></defs>" + `<use href="#asset" fill="${color}" /></svg>`;
  const svg = svgHead + '<path d="' + path + '" />' + svgTail;
  const image =
    "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  return image;
};

export const togglePointType = (points: Point[], index: number) => {
  return points.map((point, _index) => {
    if (_index == index) {
      return { x: point.x, y: point.y, c: !point.c };
    }
    return point;
  });
};

export const splitPoint = (points: Point[], index: number) => {
  const prev = points[index];
  const next = points[(index + 1) % points.length];
  const newItem = {
    x: (prev.x + next.x) / 2,
    y: (prev.y + next.y) / 2,
    c: false,
  };
  const array = points.map((point) => point);
  array.splice(index + 1, 0, newItem);
  return array;
};
