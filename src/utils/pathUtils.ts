export const assetBase: any = {
  width: 24,
  height: 24,
  minter: "",
};

const regexNum = /[+-]?(\d*\.\d*|\d+)/;
const regexNumG = /[+-]?(\d*\.\d*|\d+)/g;
const regexDivG = /[,\s]+/g;

export const compressPath = (body: string, width: number) => {
  const ret = body.replace(regexNumG, (str: string) => {
    return ` ${parseFloat(str)} `;
  });
  const items = ret.split(regexDivG);

  let isArc = false;
  let offset = 0;
  const numArray: Array<number> = items.reduce(
    (prev: Array<number>, item: string) => {
      if (regexNum.test(item)) {
        let value = Math.round((parseFloat(item) * 1024) / width);
        if (isArc) {
          const off7 = offset % 7;
          if (off7 >= 2 && off7 <= 4) {
            // we don't want to normalize 'angle', and two flags for 'a' or 'A'
            value = Math.round(parseFloat(item));
          }
          offset++;
        }
        prev.push(value + 0x100 + 1024);
      } else {
        let i;
        for (i = 0; i < item.length; i++) {
          prev.push(item.charCodeAt(i));
        }
        const ch = item.substring(-1);
        if (ch == "a" || ch == "A") {
          isArc = true;
          offset = 0;
        } else {
          isArc = false;
        }
      }
      return prev;
    },
    []
  );

  // 12-bit middle-endian compression
  const bytes = new Uint8Array((numArray.length * 3 + 1) / 2);
  numArray.map((value, index) => {
    const offset = Math.floor(index / 2) * 3;
    if (index % 2 == 0) {
      bytes[offset] = value % 0x100; // low 8 bits in the first byte
      bytes[offset + 1] = (value >> 8) & 0x0f; // hight 4 bits in the low 4 bits of middle byte
    } else {
      bytes[offset + 2] = value % 0x100; // low 8 bits in the third byte
      bytes[offset + 1] |= (value >> 8) * 0x10; // high 4 bits in the high 4 bits of middle byte
    }
  });

  return bytes;
};

export const normalizePath = (body: string, width: number) => {
  const ret = body.replace(regexNumG, (str: string) => {
    return ` ${parseFloat(str)} `;
  });
  const items = ret.split(regexDivG);

  let isArc = false;
  let offset = 0;
  const numArray2: Array<string> = items.reduce(
    (prev: Array<string>, item: string) => {
      if (regexNum.test(item)) {
        let value = Math.round((parseFloat(item) * 1024) / width);
        if (isArc) {
          const off7 = offset % 7;
          if (off7 >= 2 && off7 <= 4) {
            // we don't want to normalize 'angle', and two flags for 'a' or 'A'
            value = Math.round(parseFloat(item));
          }
          offset++;
        }
        prev.push(value.toString());
      } else {
        prev.push(item);
        const ch = item.substring(-1);
        if (ch == "a" || ch == "A") {
          isArc = true;
          offset = 0;
        } else {
          isArc = false;
        }
      }
      return prev;
    },
    []
  );

  return numArray2.join(" ");
};
