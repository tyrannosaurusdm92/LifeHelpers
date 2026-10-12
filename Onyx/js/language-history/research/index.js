import spanishProfile from './spanish/index.js';
import fijianProfile from './fijian/index.js';
import mandarinProfile from './mandarin/index.js';
import yorubaProfile from './yoruba/index.js';
import hebrewProfile from './hebrew/index.js';
import { auditRootAgeCriteria } from './root-age-audit.js';

export const LANGUAGE_RESEARCH = {
  spanish: spanishProfile,
  fijian: fijianProfile,
  mandarin: mandarinProfile,
  yoruba: yorubaProfile,
  hebrew: hebrewProfile,
};
export function getLanguageResearch(id) { return LANGUAGE_RESEARCH[id] ?? null; }
export { auditRootAgeCriteria };
export default LANGUAGE_RESEARCH;
