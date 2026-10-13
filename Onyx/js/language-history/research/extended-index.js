import georgianProfile from './georgian/index.js';
import khmerProfile from './khmer/index.js';
import hindiProfile from './hindi/index.js';
import aramaicProfile from './aramaic/index.js';
import protooceanicProfile from './proto-oceanic/index.js';
import egyptianProfile from './egyptian/index.js';
import linearbmycenaeanProfile from './linear-b-mycenaean/index.js';

export const EXTENDED_LANGUAGE_RESEARCH = {
  "georgian": georgianProfile,
  "khmer": khmerProfile,
  "hindi": hindiProfile,
  "aramaic": aramaicProfile,
  "proto-oceanic": protooceanicProfile,
  "egyptian": egyptianProfile,
  "linear-b-mycenaean": linearbmycenaeanProfile
};
export function getExtendedLanguageResearch(id) { return EXTENDED_LANGUAGE_RESEARCH[id] ?? null; }
export default EXTENDED_LANGUAGE_RESEARCH;
