export interface Point {
  x: number;
  y: number;
  c: boolean;
}

export enum LayerType {
  REMIX,
  LAYER,
  OVERLAY,
}

export interface Layer {
  points: Point[];
  color: string;
  path: string;
  svgImage: string;
}

export interface Overlay {
  assetId: number;
  provider: string;
  fill: string;
  transform: string;
}
export interface Drawing {
  layers: Layer[];
  remixId: number; // optional remix tokenId (0 = no remix)
  color?: string;
  transform?: string;
  overlays?: Overlay[];
}

// asset,
// props.remixId, // remixId
// "", // color
// "", // transform
// [] // overlays
/*
  [{
    assetId: 54,
    provider: "asset",
    fill: "blue",
    transform: "scale(0.4, 0.4)"
  }]
*/

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
  '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n';

export const svgImageFromPath = (path: string, color: string) => {
  const svgTail = "</g></defs>" + `<use href="#asset" fill="${color}" /></svg>`;
  const svg =
    svgHead + '<defs><g id="asset"><path d="' + path + '" />' + svgTail;
  const image =
    "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  return image;
};

export const svgImageFromDrawing = (drawing: Drawing) => {
  const paths = drawing.layers.map((layer) => {
    return `<path d="${layer.path}" fill="${layer.color}" />`;
  });
  const svg = svgHead + "<g>\n" + paths.join("\n") + "</g>\n</svg>\n";
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
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
