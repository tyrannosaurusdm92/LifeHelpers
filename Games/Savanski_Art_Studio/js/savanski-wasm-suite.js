/* Savanski browser-safe WebAssembly loader. Only C/C++ kernels are executed in WASM;
 * UI, canvas ownership and backend sync stay in the original JavaScript engine. */
(function(w){'use strict';
const modules=Object.create(null);
async function load(name){if(!modules[name])modules[name]=(async()=>{try{const response=await fetch('script/'+name+'.wasm');if(!response.ok)throw Error(response.status+' '+response.statusText);const bytes=await response.arrayBuffer();const {instance}=await WebAssembly.instantiate(bytes);return instance.exports}catch(e){console.warn('[Savanski] WASM unavailable: '+name,e);return null}})();return modules[name]}
function pixels(ex,ptr,data){const offset=ptr(),len=data.data.length,mem=ex.memory.buffer;if(offset+len>mem.byteLength)throw Error('WASM scratch buffer too small');new Uint8Array(mem,offset,len).set(data.data);return offset}
async function raster(data,mode,strength){if(data.width>2048||data.height>2048)return null;const ex=await load('savanski-raster-fx');if(!ex)return null;const offset=pixels(ex,ex.fx_pixels,data);const status=ex.fx_apply(data.width,data.height,mode,strength);if(status!==0)return null;return new ImageData(new Uint8ClampedArray(ex.memory.buffer,offset,data.data.length).slice(),data.width,data.height)}
async function normal(data,strength=6){if(data.width>2048||data.height>2048)return null;const ex=await load('savanski-geometry');if(!ex)return null;const offset=pixels(ex,ex.geo_pixels,data);if(ex.geo_normal_map(data.width,data.height,strength)!==0)return null;return new ImageData(new Uint8ClampedArray(ex.memory.buffer,offset,data.data.length).slice(),data.width,data.height)}
async function checker(wide,high,cells=12){if(wide>2048||high>2048)return null;const ex=await load('savanski-geometry');if(!ex)return null;const offset=ex.geo_pixels();if(ex.geo_uv_grid(wide,high,cells)!==0)return null;return new ImageData(new Uint8ClampedArray(ex.memory.buffer,offset,wide*high*4).slice(),wide,high)}
w.SavanskiWasmSuite={load,raster,normal,checker};
})(window);
