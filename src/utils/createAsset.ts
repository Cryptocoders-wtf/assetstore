const assetBase:any = {
  width: 24, height: 24,
  minter: ""
};

const regexNum = /[+-]?(\d*\.\d*|\d+)/;
const regexNumG = /[+-]?(\d*\.\d*|\d+)/g;
const regexDivG = /[,\s]+/g;
const encoder = new TextEncoder();

const normalizePath = (body:string, width:number) => {
  const ret = body.replace(regexNumG, (str:string)=>{
    return ` ${parseFloat(str)} `;
  });
  const items = ret.split(regexDivG);

  let isArc = false;
  let offset = 0;
  const numArray2:Array<string> = items.reduce((prev:Array<string>, item:string) => {
    if (regexNum.test(item)) {
      let value = Math.round(parseFloat(item) * 1024 / width);
      if (isArc) {
        const off7 = offset % 7;
        if (off7 >=2 && off7 <=4) {
          // we don't want to normalize 'angle', and two flags for 'a' or 'A'
          value = Math.round(parseFloat(item));        
        }
        offset++;
      }
      prev.push(value.toString());
    } else {
      prev.push(item);
      const ch = item.substring(-1);
      if (ch == 'a' || ch == 'A') {
        isArc = true;
        offset = 0;
      } else {
        isArc = false;
      }
    }
    return prev;
  }, []);

  return numArray2.join(' ');
} 

const compressPath = (body:string, width:number) => {
  const ret = body.replace(regexNumG, (str:string)=>{
    return ` ${parseFloat(str)} `;
  });
  const items = ret.split(regexDivG);

  let isArc = false;
  let offset = 0;
  const numArray:Array<number> = items.reduce((prev:Array<number>, item:string) => {
    if (regexNum.test(item)) {
      let value = Math.round(parseFloat(item) * 1024 / width);
      if (isArc) {
        const off7 = offset % 7;
        if (off7 >=2 && off7 <=4) {
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
      if (ch == 'a' || ch == 'A') {
        isArc = true;
        offset = 0;
      } else {
        isArc = false;
      }
    }
    return prev;
  }, []);

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
} 

export const createAsset = (_asset:any, group:string, category:string, _width:number) => {
  const asset = Object.assign({}, assetBase);
  asset.group = group;
  asset.category = category;
  asset.name = _asset.name;
  asset.metadata = new Uint8Array();
  const width = _asset.width || _width;
  let svgPath = "";
  if (_asset.parts) {
    asset.parts = _asset.parts.map((part:any) => {
      part.color = part.color || "";
      svgPath = normalizePath(part.body, width);
      part.body = compressPath(part.body, width);
      return part;
    });
  } else {
    svgPath = normalizePath(_asset.body, width);
    asset.parts = [{
      color: "",
      body: compressPath(_asset.body, width)
    }];
  }
  asset.asset = Object.assign({}, asset)
  asset.svgPath = svgPath;
  asset.svgPart = '<g id="item"> <path d="' + svgPath + '" /> </g>'; 
  asset.svg = '<svg viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg">'
    + asset.svgPart
    + '</svg>';
  asset.image = 'data:image/svg+xml;base64,' + Buffer.from(asset.svg).toString('base64');
  return asset;  
}

export const loadAssets = (_resource:any) => {
  return _resource.assets.map((asset:any) => {
    return createAsset(asset, _resource.group, _resource.category, _resource.width);
  });
}
