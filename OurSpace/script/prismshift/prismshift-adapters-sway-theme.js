/** Optional Sway/i3 IPC CONFIG TEXT exporter, not an operating-system control program.
 * A host application must explicitly choose whether/how to submit these commands.
 * No source code from the Sway compositor is embedded.
 */
import {parseColor,toHex,remapSurface,mapText,rgb,mix} from './prismshift-core-color.js';
const safeColor=value=>{const c=parseColor(value);if(!c)throw new TypeError('Expected CSS hex/rgb color: '+String(value));return toHex(c)};
const STATES=['focused','focused_inactive','unfocused','urgent','placeholder'];
export function makeSwayTheme({background='#ececec',foreground='#222222',accent='#477bba',urgent='#00FFFF'}={}){
 const base=parseColor(background),text=parseColor(foreground),focus=parseColor(accent),alarm=parseColor(urgent);
 const dark=remapSurface(base),font=mapText(text,dark,{minimum:4.5});
 return {
  focused:[toHex(focus),toHex(dark),toHex(font),toHex(focus),toHex(focus)],
  focused_inactive:[toHex(mix(focus,dark,.55)),toHex(mix(base,dark,.83)),toHex(font),toHex(dark),toHex(dark)],
  unfocused:[toHex(dark),toHex(dark),toHex(font),toHex(dark),toHex(dark)],
  urgent:[toHex(alarm),toHex(dark),toHex(font),toHex(alarm),toHex(alarm)],
  placeholder:[toHex(dark),toHex(dark),toHex(font),toHex(dark),toHex(dark)]
 };
}
export function toSwayConfig(theme){return STATES.map(key=>{const value=theme[key];if(!Array.isArray(value)||value.length!==5)throw new TypeError('Bad Sway palette');return `client.${key} ${value.map(safeColor).join(' ')}`}).join('\n')+'\n'}
export function getSwayCommands(theme){return toSwayConfig(theme).trim().split('\n')}
