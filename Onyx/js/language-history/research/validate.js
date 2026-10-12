import { LANGUAGE_RESEARCH } from './index.js';
import { codePoints } from './unicode-tools.js';
import { auditRootAgeCriteria } from './root-age-audit.js';

export function validateResearchProfiles(profiles = LANGUAGE_RESEARCH) {
  const errors = [];
  for (const [id, profile] of Object.entries(profiles)) {
    if (!profile.rootEvidence?.date || !profile.rootEvidence?.evidenceType || !profile.rootEvidence?.confidence) errors.push(`${id}: root dating must have date, evidence type, and confidence`);
    if (!Array.isArray(profile.siblings) || profile.siblings.length < 3) errors.push(`${id}: expected at least three comparison branches/varieties`);
    if (!['Romance', 'Oceanic', 'Asian / Sinitic', 'African', 'Middle Eastern'].includes(profile.category)) errors.push(`${id}: category is outside the requested set`);
    const modules = [profile.lineage, profile.chronology, profile.soundChanges, profile.prosodyAndSyntax, profile.orthography];
    for (const module of modules) {
      if (!module?.sources?.length) errors.push(`${id}: a research module has no source links`);
      for (const source of module?.sources ?? []) {
        if (!/^https:\/\//.test(source.url)) errors.push(`${id}: invalid source URL for ${source.id}`);
      }
    }
    for (const item of profile.orthography.script.unicodeExamples) {
      const actual = codePoints(item.text).map(x => x.codePoint);
      if (JSON.stringify(actual) !== JSON.stringify(item.points)) errors.push(`${id}: Unicode example mismatch for ${item.text}`);
    }
    if (!/subscript/i.test(profile.orthography.script.subscripts)) errors.push(`${id}: subscript status must be explicit`);
  }
  const ageAudit = auditRootAgeCriteria(profiles);
  if (!ageAudit.ok) errors.push(...ageAudit.errors);
  return { ok: errors.length === 0, errors, profileCount: Object.keys(profiles).length, rootAgeAudit: ageAudit };
}

export default validateResearchProfiles;
