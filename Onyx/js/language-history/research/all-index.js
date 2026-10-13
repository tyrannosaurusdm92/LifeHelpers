import original from './index.js';
import extended from './extended-index.js';
export const ALL_LANGUAGE_RESEARCH = { ...original, ...extended };
export function getAnyLanguageResearch(id) { return ALL_LANGUAGE_RESEARCH[id] ?? null; }
export default ALL_LANGUAGE_RESEARCH;
