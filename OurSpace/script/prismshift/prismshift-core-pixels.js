/** Pixel pipelines; alpha is never inverted, and mutating is opt-in. */
import {clamp} from './prismshift-core-color.js';
const modes={invert:0,grayscale:1,sepia:2,threshold:3,brightness:4};
export function processPixels(input,{mode='invert',mutate=false,strength=1,threshold=127,brightness=0}={}){
 if(!(input instanceof Uint8ClampedArray))throw new TypeError('Expected Uint8ClampedArray RGBA pixels');
 if(input.length%4!==0)throw new RangeError('RGBA pixel array length must be a multiple of 4');
 if(!(mode in modes))throw new RangeError('Unsupported pixel mode: '+mode);
 const out=mutate?input:new Uint8ClampedArray(input);strength=clamp(strength);brightness=clamp(brightness,-255,255);
 for(let i=0;i<out.length;i+=4){const r=out[i],g=out[i+1],b=out[i+2];let nr=r,ng=g,nb=b;
 switch(mode){case 'invert':nr=255-r;ng=255-g;nb=255-b;break;
 case 'grayscale':nr=ng=nb=.2126*r+.7152*g+.0722*b;break;
 case 'sepia':nr=.393*r+.769*g+.189*b;ng=.349*r+.686*g+.168*b;nb=.272*r+.534*g+.131*b;break;
 case 'threshold':nr=ng=nb=(.2126*r+.7152*g+.0722*b)>=threshold?255:0;break;
 case 'brightness':nr=r+brightness;ng=g+brightness;nb=b+brightness;break;
 }
 out[i]=r+(nr-r)*strength;out[i+1]=g+(ng-g)*strength;out[i+2]=b+(nb-b)*strength;
 }
 return out;
}
export function processImageData(imageData,options={}){if(!imageData||!Number.isInteger(imageData.width)||!Number.isInteger(imageData.height)||!(imageData.data instanceof Uint8ClampedArray))throw new TypeError('Expected ImageData-like object');const pixels=processPixels(imageData.data,options);if(options.mutate)return imageData;if(typeof ImageData!=='undefined')return new ImageData(pixels,imageData.width,imageData.height);return {data:pixels,width:imageData.width,height:imageData.height}}
export function invertPixels(pixels,options={}){return processPixels(pixels,{...options,mode:'invert'})}
export const invertImageData=(imageData,options={})=>processImageData(imageData,{...options,mode:'invert'});
/** Optional WASM vectorized path with chunked copying, no network calls by this helper. */
export async function createWasmProcessor(source){
 if(typeof WebAssembly==='undefined')throw new Error('WebAssembly unavailable');
 let binary=source;
 if(source instanceof WebAssembly.Module){const instance=await WebAssembly.instantiate(source,{});return wasmWrapper(instance.exports)}
 if(source instanceof WebAssembly.Instance)return wasmWrapper(source.exports);
 if(source instanceof ArrayBuffer||ArrayBuffer.isView(source)){binary=source;}
 else throw new TypeError('Supply WASM bytes, Module, or Instance; loading is the host’s responsibility');
 const instance=await WebAssembly.instantiate(binary,{});return wasmWrapper(instance.instance?.exports??instance.exports);
}
function wasmWrapper(ex){if(!ex.memory||typeof ex.process_rgba!=='function')throw new Error('Incompatible WASM module');const bytes=new Uint8Array(ex.memory.buffer);return {
 process(pixels,{mode='invert',mutate=false,strength=1,threshold=127,brightness=0}={}){
  if(!(pixels instanceof Uint8ClampedArray)||pixels.length%4)throw new TypeError('RGBA pixels required');if(!(mode in modes))throw new RangeError('Unknown mode');const output=mutate?pixels:new Uint8ClampedArray(pixels);const offset=131072;const chunk=(bytes.byteLength-offset)-((bytes.byteLength-offset)%4);
  if(chunk<4)throw new Error('WASM memory too small');for(let i=0;i<output.length;i+=chunk){const n=Math.min(chunk,output.length-i);bytes.set(output.subarray(i,i+n),offset);ex.process_rgba(offset,n,modes[mode],Math.round(clamp(strength)*65535),Math.round(clamp(threshold,0,255)),Math.round(clamp(brightness,-255,255)));output.set(bytes.subarray(offset,offset+n),i)}return output;
 },
 memoryBytes:bytes.byteLength
 }}
