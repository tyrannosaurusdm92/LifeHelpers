import assert from 'node:assert/strict';
import { EXTENDED_LANGUAGE_RESEARCH } from './extended-index.js';
import { auditRootAgeCriteria } from './root-age-audit.js';

const age = auditRootAgeCriteria(EXTENDED_LANGUAGE_RESEARCH, 2500, { strictEvidence: true });
const errors = [...age.errors];

const scriptBlocks = {
  georgian: [[0x10a0, 0x10ff], [0x1c90, 0x1cbf], [0x2d00, 0x2d2f]],
  khmer: [[0x1780, 0x17ff], [0x19e0, 0x19ff]],
  hindi: [[0x0900, 0x097f], [0xa8e0, 0xa8ff]],
  aramaic: [[0x10840, 0x1085f]],
  egyptian: [[0x13000, 0x1345f]],
  'linear-b-mycenaean': [[0x10000, 0x1013f]]
};

for (const [id, profile] of Object.entries(EXTENDED_LANGUAGE_RESEARCH)) {
  for (const module of [profile.lineage, profile.chronology, profile.soundChanges, profile.prosodyAndSyntax, profile.orthography]) {
    if (!module.sources?.length) errors.push(`${id}: missing module sources`);
  }

  const examples = profile.orthography.script.unicodeExamples ?? [];
  for (const example of examples) {
    const points = [...example.text].map(character => character.codePointAt(0));
    if (JSON.stringify(points) !== JSON.stringify(example.points)) errors.push(`${id}: Unicode mismatch ${example.text}`);

    if (id !== 'proto-oceanic') {
      const ranges = scriptBlocks[id] ?? [];
      for (const point of points) {
        if (!ranges.some(([start, end]) => point >= start && point <= end)) {
          errors.push(`${id}: U+${point.toString(16).toUpperCase()} is outside the documented script blocks`);
        }
      }
    }
  }

  if (!/subscript/i.test(profile.orthography.script.subscripts ?? '')) errors.push(`${id}: subscript status missing`);
}

const protoOceanicScript = EXTENDED_LANGUAGE_RESEARCH['proto-oceanic'].orthography.script;
if (protoOceanicScript.nativeScriptStatus !== 'none-known') errors.push('proto-oceanic: reconstructed language must be marked as having no known native script');
if (protoOceanicScript.exampleType !== 'scholarly-transcription') errors.push('proto-oceanic: Unicode samples must be identified as modern transcription, not ancient glyphs');

const mycenaean = EXTENDED_LANGUAGE_RESEARCH['linear-b-mycenaean'];
if (mycenaean.siblings.some(name => /Linear A/i.test(name))) errors.push('linear-b-mycenaean: Linear A is a script comparison, not a Greek language sibling');
if (!mycenaean.relatedScripts?.some(script => script.name === 'Linear A' && /not a Greek language sibling/i.test(script.note))) {
  errors.push('linear-b-mycenaean: keep the Linear A language/script distinction explicit');
}

assert.equal(errors.length, 0, errors.join('\n'));
console.log(JSON.stringify({
  ok: true,
  profiles: Object.keys(EXTENDED_LANGUAGE_RESEARCH).length,
  ageAudit: age.results.map(({ id, ageBP, rangeBP, rangeUpperOpen, documentationStatus, documentationDate, meetsAgeFloor }) => ({ id, ageBP, rangeBP, rangeUpperOpen, documentationStatus, documentationDate, meetsAgeFloor })),
  unicodeExamples: 'code points and script blocks valid',
  modules: 'sourced and evidence-classified'
}, null, 2));
