import assert from 'node:assert/strict';
import { EXTENDED_LANGUAGE_RESEARCH } from './extended-index.js';
import { auditRootAgeCriteria } from './root-age-audit.js';
const age = auditRootAgeCriteria(EXTENDED_LANGUAGE_RESEARCH);
const errors = [...age.errors];
for (const [id,p] of Object.entries(EXTENDED_LANGUAGE_RESEARCH)) {
  for (const module of [p.lineage,p.chronology,p.soundChanges,p.prosodyAndSyntax,p.orthography]) if (!module.sources?.length) errors.push(`${id}: missing module sources`);
  for (const example of p.orthography.script.unicodeExamples) {
    const points = [...example.text].map(c => c.codePointAt(0));
    if (JSON.stringify(points) !== JSON.stringify(example.points)) errors.push(`${id}: Unicode mismatch ${example.text}`);
  }
  if (!/subscript/i.test(p.orthography.script.subscripts)) errors.push(`${id}: subscript status missing`);
}
assert.equal(errors.length,0,errors.join('\n'));
console.log(JSON.stringify({ok:true,profiles:Object.keys(EXTENDED_LANGUAGE_RESEARCH).length,ageAudit:age.results.map(({id,ageBP,ancestorStage,meetsAgeFloor})=>({id,ageBP,ancestorStage,meetsAgeFloor})),unicodeExamples:'valid',modules:'sourced'},null,2));
