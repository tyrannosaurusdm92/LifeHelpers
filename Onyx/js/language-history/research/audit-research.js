import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGUAGE_RESEARCH } from './index.js';
import { validateResearchProfiles } from './validate.js';

async function walk(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walk(path));
    else if (entry.isFile()) found.push(path);
  }
  return found;
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDir, '../../../..');
const onyxRoot = resolve(repoRoot, 'Onyx');
const docsRoot = resolve(onyxRoot, 'docs/language-history');
const researchRoot = resolve(docsRoot, 'research');
const moduleTreeFiles = await walk(moduleDir);
const moduleFiles = moduleTreeFiles.filter(path => path.endsWith('.js'));
const moduleDocs = moduleTreeFiles.filter(path => path.endsWith('.md'));
const researchDocs = (await walk(researchRoot)).filter(path => path.endsWith('.md'));
const allDocs = (await walk(docsRoot)).filter(path => path.endsWith('.md'));
const zipFiles = [...moduleTreeFiles, ...await walk(researchRoot)].filter(path => path.endsWith('.zip'));
const topicFiles = researchDocs.filter(path => /\/(01-lineage|02-chronology|03-sound-change|04-syllables-and-syntax|05-script-and-unicode)\.md$/.test(path));
const errors = [];

for (const file of allDocs) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const raw = match[1].trim();
    if (/^(https?:|mailto:|#)/i.test(raw)) continue;
    const target = decodeURIComponent(raw.split('#')[0].split('?')[0]);
    if (!target) continue;
    const path = resolve(dirname(file), target);
    if (!path.startsWith(onyxRoot + sep) || !existsSync(path)) errors.push(`${file}: broken or out-of-tree document link ${raw}`);
  }
  if (file.startsWith(researchRoot) && /\/(01-lineage|02-chronology|03-sound-change|04-syllables-and-syntax|05-script-and-unicode)\.md$/.test(file) && !content.includes('## Sources')) errors.push(`${file}: missing source section`);
}

const register = await readFile(resolve(researchRoot, 'source-register.md'), 'utf8');
const sourceIds = new Set([...register.matchAll(/\*\*([SFMHYU]\d+)\*\*/g)].map(match => match[1]));
for (const file of researchDocs) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(/\[([SFMHYU]\d+)\]/g)) if (!sourceIds.has(match[1])) errors.push(`${file}: source key ${match[1]} is missing from the register`);
}
const profileCheck = validateResearchProfiles();
if (!profileCheck.ok) errors.push(...profileCheck.errors);
const researchFileCount = moduleFiles.length + moduleDocs.length + researchDocs.length;
if (researchFileCount < 50) errors.push(`Only ${researchFileCount} research files found; at least 50 are required`);
if (topicFiles.length !== 25) errors.push(`Expected 25 language topic notes, found ${topicFiles.length}`);
if (zipFiles.length) errors.push('A zipped artifact is present in the research tree');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(JSON.stringify({ ok: true, researchFiles: researchFileCount, javascriptFiles: moduleFiles.length, markdownFiles: researchDocs.length + moduleDocs.length, languageTopicNotes: topicFiles.length, profiles: Object.keys(LANGUAGE_RESEARCH).length, localLinkAndSourceKeyErrors: 0 }, null, 2));
