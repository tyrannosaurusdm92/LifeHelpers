/** Host-independent presets. None assumes any particular application's colors. */
import {makePalette,toCss,parseColor,invertColor,ensureContrast} from './prismshift-core-color.js';
export const COLOR_PRESETS=Object.freeze({
 charcoal:Object.freeze({background:'#f8fafc',foreground:'#222731',accent:'#557ec8',surfaceLightness:.11}),
 midnight:Object.freeze({background:'#faf6ee',foreground:'#302d31',accent:'#5a6ba9',surfaceLightness:.075}),
 oled:Object.freeze({background:'#ffffff',foreground:'#121212',accent:'#5178cc',surfaceLightness:.04}),
 soft:Object.freeze({background:'#fffaf2',foreground:'#383534',accent:'#79936e',surfaceLightness:.22}),
 highContrast:Object.freeze({background:'#ffffff',foreground:'#111111',accent:'#226fbd',surfaceLightness:.045,minimumContrast:7})
});
export function presetTokens(name,overrides={}){const preset=COLOR_PRESETS[name];if(!preset)throw new RangeError('Unknown preset');const settings={...preset,...overrides};const p=makePalette(settings,settings);return {'--prism-semantic-bg':toCss(p.surface),'--prism-semantic-fg':toCss(p.foreground),'--prism-semantic-surface':toCss(p.surface),'--prism-semantic-border':toCss(p.border),'--prism-semantic-accent':toCss(p.accent)}}
