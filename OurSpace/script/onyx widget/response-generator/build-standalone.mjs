/**
 * Build the complete Pass 7 engine into a single lazy-loaded JavaScript file.
 * The widget's existing HTML and stylesheet remain the only runtime shell;
 * this build does not emit another HTML page or import generator.css.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../../..');
const sourceDir = path.join(projectRoot, 'script/onyx widget/response-generator');
const jsonDir = path.join(projectRoot, 'json/onyx widget/response-generator');
const wasmFile = path.join(projectRoot, 'script/wasm/onyx-response-generator/lexical-score.wasm');
const moduleNames = [
  'conversation-intents.js', 'turn-understanding.js', 'dialogue-evaluator.js',
  'social-replies.js', 'backend-client.js', 'context-memory.js',
  'learning-store.js', 'lexical-retrieval.js', 'quality-guard.js',
  'local-composer.js', 'conversation-engine.js', 'onyx-responses.js',
  'ourspace-adapter.js', 'generator-app.js'
];

function compileModule(name, input) {
  const exported = [];
  let source = input.replaceAll(
    'import.meta.url',
    JSON.stringify(`https://onyx.local/script/onyx%20widget/response-generator/${name}`)
  );
  source = source.replace(
    /^import\s*\{([^}]+)\}\s*from\s*['"]\.\/([^'"]+)['"];?\s*$/gm,
    (_match, specifiers, dependency) => `const {${specifiers}}=__modules[${JSON.stringify(dependency)}];`
  );
  source = source.replace(
    /^export\s+(const|class|async function|function)\s+(\w+)/gm,
    (_match, kind, name) => { exported.push(name); return `${kind} ${name}`; }
  );
  if (/^\s*(?:import\s|export\s)/m.test(source)) {
    throw new Error(`Uncompiled ES module syntax remains in ${name}`);
  }
  return `__modules[${JSON.stringify(name)}]=(()=>{\n'use strict';\n${source}\nreturn {${exported.join(',')}};\n})();`;
}

const modules = [];
for (const name of moduleNames) {
  modules.push(compileModule(name, await fs.readFile(path.join(sourceDir, name), 'utf8')));
}

const assets = {};
for (const name of ['canon.json', 'influences.json', 'manifest.json', 'voice-strategy.json', 'voice-exemplars.json']) {
  assets[name] = JSON.parse(await fs.readFile(path.join(jsonDir, name), 'utf8'));
}
assets['lexical-score.wasm'] = (await fs.readFile(wasmFile)).toString('base64');
const assetJSON = JSON.stringify(assets).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, ' ');
const output = `'use strict';\nconst __assets=${assetJSON};\n` +
  `const __originalFetch=globalThis.fetch?.bind(globalThis);\nconst __modules=Object.create(null);\n` +
  `globalThis.__ONYX_ASSET_FETCH=async(input,options)=>{\n` +
  ` const url=String(input?.url||input);\n` +
  ` const match=url.match(/(?:^|\\/)(voice-exemplars\\.json|canon\\.json|influences\\.json|manifest\\.json|voice-strategy\\.json|lexical-score\\.wasm)(?:[?#].*)?$/);\n` +
  ` const key=match?.[1];\n` +
  ` if(key&&Object.hasOwn(__assets,key)){\n` +
  `  if(key.endsWith('.wasm')){const raw=atob(__assets[key]);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Response(bytes,{status:200,headers:{'Content-Type':'application/wasm'}});}\n` +
  `  return new Response(JSON.stringify(__assets[key]),{status:200,headers:{'Content-Type':'application/json'}});\n` +
  ` }\n` +
  ` if(!__originalFetch)throw new Error('Fetch unavailable for '+url);\n` +
  ` return __originalFetch(input,options);\n};\n` +
  `${modules.join('\n')}\n` +
  `globalThis.__ONYX_WORKSHOP_CHECK=()=>({loaded:!!__modules['onyx-responses.js'],examples:__assets['voice-exemplars.json'].entries.length,moods:__modules['onyx-responses.js'].ONYX_MOODS.length,assetMode:'integrated-widget'});\n`;

const destination = path.join(sourceDir, 'standalone-bundle.generated.js');
await fs.writeFile(destination, output, 'utf8');
console.log(JSON.stringify({
  output: path.relative(projectRoot, destination),
  bytes: Buffer.byteLength(output),
  modules: moduleNames.length,
  examples: assets['voice-exemplars.json'].entries.length,
  wasmBytes: Buffer.from(assets['lexical-score.wasm'], 'base64').length
}));
