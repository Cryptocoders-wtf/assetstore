import { useCanvasParams } from "@/utils/canvasUtil";
export interface TransForm {
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
}

export const defaultTransForm: TransForm = {
  rotate: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const getCanvasTransFormString = (transform: TransForm) => {
  const { assetXtoCanvasX, assetYtoCanvasY } = useCanvasParams();
  return (
    `translate(${assetXtoCanvasX(transform.translateX)}px,` +
    `${assetYtoCanvasY(transform.translateY)}px) ` +
    `scale(${transform.scale}) ` +
    `rotate(${transform.rotate}rad) `
  );
};

const getAssetTransFormString = (transform: TransForm) => {
  return (
    `translate(${transform.translateX}px,` +
    `${transform.translateY}px) ` +
    `scale(${transform.scale}) ` +
    `rotate(${transform.rotate}rad) `
  );
};

const getTransFormFromString = (value: string) => {
  const [rotate, scale, translateX, translateY] = (
    value?.match(
      /translate\(([0-1.]*)px,([0-1.]*)px\) scale\(([0-1.]*)\) rotate\(([0-1.]*)deg\)/
    ) ?? ["0", "0", "1", "0", "0"]
  ).map((v) => parseFloat(v));

  return { rotate, scale, translateX, translateY };
};

export const TransFormUtil = {
  getCanvasTransFormString: getCanvasTransFormString,
  getAssetTransFormString: getAssetTransFormString,
  getTransFormFromString: getTransFormFromString,
};
