/** Streaming, lossless SGR foreground/background/underline color conversion. */
import {invertColor,parseColor,toCss} from './prismshift-core-color.js';
const flip8=n=>n<=7?7-n:n<=15?23-n:n<=231?247-n:n<=255?487-n:n;
function flipIndex(n){if(n<0||n>255)return n;return flip8(n)}
function mapSgr(parameters,{foreground=true,background=true,underline=true,base16=true,palette256=true,truecolor=true}={}){
 const p=parameters.split(';');let last=0;for(let i=0;i<p.length;i++){
  const raw=p[i],n=Number(raw);if(raw===''||!Number.isInteger(n))continue;
  if(base16){if(foreground&&n>=30&&n<=37)p[i]=String(37-(n-30));else if(background&&n>=40&&n<=47)p[i]=String(47-(n-40));else if(foreground&&n>=90&&n<=97)p[i]=String(97-(n-90));else if(background&&n>=100&&n<=107)p[i]=String(107-(n-100))}
  if(n!==38&&n!==48&&n!==58)continue;const allowed=n===38?foreground:n===48?background:underline;
  const mode=Number(p[i+1]);if(mode===5&&i+2<p.length){const idx=Number(p[i+2]);if(allowed&&palette256&&Number.isInteger(idx)&&idx>=0&&idx<=255)p[i+2]=String(flipIndex(idx));i+=2;continue}
  if(mode===2&&i+4<p.length){if(allowed&&truecolor){for(let j=2;j<=4;j++){const v=Number(p[i+j]);if(Number.isInteger(v)&&v>=0&&v<=255)p[i+j]=String(255-v)}}i+=4;continue}
  last=i;
 }
 return p.join(';');
}
/** ANSI CSI patterns without SGR are left exactly as supplied. */
export function invertAnsi(text,options={}){if(typeof text!=='string')throw new TypeError('String required');return text.replace(/\x1b\[([0-9;]*)m/g,(sequence,params)=>'\x1b['+mapSgr(params,options)+'m')}
/** Keeps incomplete escape sequences until the next chunk; call finish() to drain. */
export function createAnsiTransformer(options={}){let pending='';const maxPending=Math.max(32,Math.min(4096,options.maxPending??256));return {
 write(chunk){if(typeof chunk!=='string')throw new TypeError('String chunks only');let s=pending+chunk;pending='';
  const i=s.lastIndexOf('\x1b');if(i>=0){const tail=s.slice(i);if(/^\x1b(?:\[[0-9;]*)?$/.test(tail)&&tail.length<=maxPending){pending=tail;s=s.slice(0,i)}}
  return invertAnsi(s,options);
 },
 finish(){const result=pending;pending='';return result},
 get pendingLength(){return pending.length}
 }}
export function invertAnsiColorPair(foreground,background){const fg=parseColor(foreground),bg=parseColor(background);return {foreground:fg?toCss(invertColor(fg)):foreground,background:bg?toCss(invertColor(bg)):background}}
