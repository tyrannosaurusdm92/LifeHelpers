import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';
const profile = {
  id: "khmer-history", language: "Khmer (Modern Khmer; historical Old Khmer)", category: "Asian / Mainland Southeast Asian",
  family: lineage.data.familyTree, rootEvidence: lineage.data.root, siblings: lineage.data.siblings,
  lineage: {...lineage.data, sources: lineage.sources}, chronology: {...chronology.data, sources: chronology.sources},
  soundChanges: {...soundChanges.data, sources: soundChanges.sources}, prosodyAndSyntax: {...prosody.data, sources: prosody.sources},
  orthography: {...orthography.data, sources: orthography.sources}, sources: [...lineage.sources,...chronology.sources,...soundChanges.sources,...prosody.sources,...orthography.sources]
};
export {lineage, chronology, soundChanges, prosody, orthography};
export default profile;
