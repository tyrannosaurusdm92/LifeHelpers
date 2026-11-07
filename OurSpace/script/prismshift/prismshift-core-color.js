/** PrismShift color science. No DOM side effects. All channels use sRGB (0..255). */
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const byte=v=>Math.round(clamp(v,0,255));
export const rgb=(r,g,b,a=1)=>({r:byte(r),g:byte(g),b:byte(b),a:clamp(a)});
const parseChannel=s=>s.trim().endsWith('%')?clamp(parseFloat(s)/100)*255:parseFloat(s);
const parseAlpha=s=>s===undefined?1:(s.trim().endsWith('%')?parseFloat(s)/100:parseFloat(s));
const hue=s=>{const value=parseFloat(s);if(!Number.isFinite(value))return NaN;const factor=s.endsWith('turn')?360:s.endsWith('rad')?180/Math.PI:s.endsWith('grad')?0.9:1;return ((value*factor)%360+360)%360};
function fromHsl(h,s,l,a=1){s=clamp(s);l=clamp(l);const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return rgb(...p.map(v=>(v+m)*255),a)}
const CSS_NAMED={black:'#000',white:'#fff',red:'#f00',green:'#008000',blue:'#00f',gray:'#808080',grey:'#808080',silver:'#c0c0c0',yellow:'#ff0',cyan:'#0ff',aqua:'#0ff',magenta:'#f0f',fuchsia:'#f0f',orange:'#ffa500',purple:'#800080',rebeccapurple:'#663399',transparent:'#00000000',navy:'#000080',teal:'#008080',maroon:'#800000',olive:'#808000',lime:'#00ff00'};
/** Parse common CSS color syntaxes; optionally use an element's browser CSS resolver for named colors. */
export function parseColor(input,resolver){
 if(typeof input!=='string')return null;
 let s=input.trim().toLowerCase();if(!s||s==='currentcolor'||s==='inherit'||s==='initial'||s==='unset'||s==='none')return null;
 s=CSS_NAMED[s]??s;
 if(/^#[\da-f]{3,4}$/.test(s)){const a=[...s.slice(1)].map(v=>parseInt(v+v,16));return rgb(a[0],a[1],a[2],a[3]===undefined?1:a[3]/255)}
 if(/^#[\da-f]{6}(?:[\da-f]{2})?$/.test(s)){return rgb(parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),s.length===9?parseInt(s.slice(7,9),16)/255:1)}
 const fn=/^(rgba?|hsla?|hwb|color)\((.*)\)$/.exec(s);
 if(fn){const kind=fn[1];let str=fn[2].trim();if(kind==='color'){
   const m=/^srgb\s+(.+)$/.exec(str);if(m){const [r,g,b,a]=m[1].replace(/\s*\/\s*/,' ').split(/[\s,]+/).map(Number);if([r,g,b].every(Number.isFinite))return rgb(r*255,g*255,b*255,a??1)}
 }else{const args=str.replace(/\s*\/\s*/,' ').split(/[\s,]+/).filter(Boolean);if(args.length>=3){const a=parseAlpha(args[3]);if(!Number.isFinite(a))return null;
 if(kind==='rgb'||kind==='rgba'){const vals=args.slice(0,3).map(parseChannel);if(vals.every(Number.isFinite))return rgb(...vals,a)}
 if(kind==='hsl'||kind==='hsla'){const h=hue(args[0]),sat=parseFloat(args[1])/100,lit=parseFloat(args[2])/100;if([h,sat,lit].every(Number.isFinite))return fromHsl(h,sat,lit,a)}
 if(kind==='hwb'){const h=hue(args[0]),w=clamp(parseFloat(args[1])/100),bk=clamp(parseFloat(args[2])/100);if(Number.isFinite(h)){const c=fromHsl(h,1,.5);if(w+bk>=1)return rgb(255*w/(w+bk),255*w/(w+bk),255*w/(w+bk),a);const k=1-w-bk;return rgb(c.r*k+255*w,c.g*k+255*w,c.b*k+255*w,a)}}
 }}}
 if(typeof resolver==='function'){const resolved=resolver(s);if(resolved&&resolved!==s)return parseColor(resolved)}
 return null;
}
export const toHex=(c,alpha=false)=>'#'+[c.r,c.g,c.b,...(alpha?[Math.round(c.a*255)]:[])].map(n=>byte(n).toString(16).padStart(2,'0')).join('');
export const toCss=c=>`rgba(${c.r}, ${c.g}, ${c.b}, ${+clamp(c.a).toFixed(5)})`;
export const srgbToLinear=v=>{v=clamp(v/255);return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
export const linearToSrgb=v=>{v=clamp(v);return byte(255*(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055))};
export function luminance(c){return .2126*srgbToLinear(c.r)+.7152*srgbToLinear(c.g)+.0722*srgbToLinear(c.b)}
export const contrastRatio=(a,b)=>{const aa=luminance(a),bb=luminance(b);return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05)};
export const mix=(a,b,t)=>rgb(a.r+(b.r-a.r)*clamp(t),a.g+(b.g-a.g)*clamp(t),a.b+(b.b-a.b)*clamp(t),a.a+(b.a-a.a)*clamp(t));
export const composite=(fg,bg)=>rgb(fg.r*fg.a+bg.r*(1-fg.a),fg.g*fg.a+bg.g*(1-fg.a),fg.b*fg.a+bg.b*(1-fg.a));
export const invertColor=(c,{keepAlpha=true}={})=>rgb(255-c.r,255-c.g,255-c.b,keepAlpha?c.a:1);
/** Force black/white inversion using relative luminance (default WCAG-derived threshold). */
export const invertBlackWhite=(c,threshold=.179)=>luminance(c)>clamp(threshold)?rgb(0,0,0,c.a):rgb(255,255,255,c.a);
/** OKLab: Björn Ottosson's perceptual space, for balanced lightness remapping. */
export function toOKLab(c){const r=srgbToLinear(c.r),g=srgbToLinear(c.g),b=srgbToLinear(c.b);const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return {L:.2104542553*l+.793617785*m-.0040720468*s,a:1.9779984951*l-2.428592205*m+.4505937099*s,b:.0259040371*l+.7827717662*m-.808675766*s,alpha:c.a}}
export function fromOKLab({L,a,b,alpha=1}){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;return rgb(linearToSrgb(4.0767416621*l-3.3077115913*m+.2309699292*s),linearToSrgb(-1.2684380046*l+2.6097574011*m-.3413193965*s),linearToSrgb(-.0041960863*l-.7034186147*m+1.707614701*s),alpha)}
export function remapSurface(original,opts={}){
 const {surfaceLightness=.12,chroma=.72}=opts;const lab=toOKLab(original);
 // A white surface becomes deep charcoal; darker source surfaces retain slight elevation.
 const target=clamp(surfaceLightness+(1-lab.L)*.21,.055,.38);
 return fromOKLab({L:target,a:lab.a*chroma,b:lab.b*chroma,alpha:original.a});
}
export function ensureContrast(foreground,background,minimum=4.5){
 const bg=background.a<1?composite(background,rgb(18,20,24)):background;
 let fg=foreground.a<1?composite(foreground,bg):foreground;
 if(contrastRatio(fg,bg)>=minimum)return foreground;
 const white=rgb(255,255,255),black=rgb(0,0,0),target=contrastRatio(white,bg)>=contrastRatio(black,bg)?white:black;
 // Interpolate in perceptual OKLab space and preserve hue where possible.
 const initial=toOKLab(foreground),goal=toOKLab(target);let best=target,lo=0,hi=1;
 for(let i=0;i<18;i++){const t=(lo+hi)/2,attempt=fromOKLab({L:initial.L+(goal.L-initial.L)*t,a:initial.a*(1-t),b:initial.b*(1-t),alpha:foreground.a});const effective=attempt.a<1?composite(attempt,bg):attempt;if(contrastRatio(effective,bg)>=minimum){best=attempt;hi=t}else lo=t}
 return rgb(best.r,best.g,best.b,foreground.a);
}
export function mapText(original,background,{minimum=4.5}={}){
 let lab=toOKLab(original);if(lab.L<.67)lab.L=clamp(.72+lab.L*.27,.72,.96);else lab.L=clamp(lab.L,.72,.98);
 return ensureContrast(fromOKLab(lab),background,minimum);
}
export const remapBorder=(c,bg)=>mix(remapSurface(c,{surfaceLightness:.3}),bg,.35);
export function makePalette(source={},options={}){const base=parseColor(source.background??'#ffffff')??rgb(255,255,255);const surface=remapSurface(base,options);const foreground=mapText(parseColor(source.foreground??'#202124')??rgb(24,24,24),surface,{minimum:options.minimumContrast??4.5});const border=remapBorder(parseColor(source.border??'#ccc')??rgb(204,204,204),surface);return {surface,foreground,border,accent:ensureContrast(parseColor(source.accent??'#5b87d3')??rgb(91,135,211),surface,3)}}
/** CSS `color(display-p3 ...)` and lab colors are left untouched if not resolved by the browser. */
