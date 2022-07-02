const assetBase:any = {
  width: 24, height: 24,
  minter: ""
};

const regexNum = /[+-]?(\d*\.\d*|\d+)/;
const regexNumG = /[+-]?(\d*\.\d*|\d+)/g;
const regexDivG = /[,\s]+/g;
const encoder = new TextEncoder();

const compressPath = (body:string, width:number) => {
  const ret = body.replace(regexNumG, (str:string)=>{
    return ` ${parseFloat(str)} `;
  });
  const items = ret.split(regexDivG);

  let isArc = false;
  let offset = 0;
  const numArray:Array<string> = items.reduce((prev:Array<string>, item:string) => {
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
      isArc = (item=="c" || item=="C");
    }
    return prev;
  }, []);

  return numArray.join(' ');
} 

export const createAsset = (_asset:any, group:string, category:string, _width:number) => {
  const asset = Object.assign({}, assetBase);
  asset.group = group;
  asset.category = category;
  asset.name = _asset.name;
  const width = _asset.width || _width;
  if (_asset.parts) {
    asset.parts = _asset.parts.map((part:any) => {
      part.color = part.color || "";
      part.body = compressPath(part.body, width);
      return part;
    });
  } else {
    asset.parts = [{
      color: "",
      body: compressPath(_asset.body, width)
    }];
  }
  asset.svg = '<svg viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg">'
    + '<path d="' + asset.parts[0].body + '" />'
    + '</svg>';
  return asset;  
}

export const loadAssets = (_resource:any) => {
  return _resource.assets.map((asset:any) => {
    return createAsset(asset, _resource.group, _resource.category, _resource.width);
  });
}
