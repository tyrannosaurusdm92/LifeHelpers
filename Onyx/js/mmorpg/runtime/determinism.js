'use strict';
function hash32(value) { let h=2166136261; for (const c of String(value)) { h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function seededRandom(seed) { let a=(typeof seed==='number'?seed:hash32(seed))>>>0; return function next(){ a=(a+0x6D2B79F5)|0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function stableKey(...parts) { return parts.map(x=>String(x).replaceAll('|','||')).join('|'); }
function idempotencyKey(scope, actor, requestId) { if (!scope||!actor||!requestId) throw new Error('scope, actor and requestId are required'); return hash32(stableKey(scope,actor,requestId)).toString(16).padStart(8,'0'); }
module.exports={hash32,seededRandom,stableKey,idempotencyKey};
