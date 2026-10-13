import { ALL_LANGUAGE_RESEARCH } from './all-index.js';

/** Return a compact, uncertainty-preserving comparison for any two atlas IDs. */
export function compareLanguageHistories(leftId, rightId) {
  const left = ALL_LANGUAGE_RESEARCH[leftId];
  const right = ALL_LANGUAGE_RESEARCH[rightId];
  if (!left || !right) throw new RangeError('Unknown language-history profile');
  const summarize = p => ({ id:p.id, language:p.language, category:p.category, family:p.family, root:p.rootEvidence?.node ?? p.rootEvidence?.ageAssessment?.ancestorStage ?? null, age:p.rootEvidence?.ageAssessment ?? null, siblings:p.siblings, script:p.orthography?.script?.history ?? p.orthography?.script?.writingSystems ?? null, unicode:p.orthography?.script?.unicodeExamples ?? [] });
  return { left:summarize(left), right:summarize(right), cautions:['A shared typological feature does not establish genetic relationship.','Dates for reconstructed ancestors, written attestations, and modern standards are different evidence classes.'] };
}
export default compareLanguageHistories;
