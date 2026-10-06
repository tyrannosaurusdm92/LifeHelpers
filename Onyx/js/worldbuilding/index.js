import loadWriterHelper from '../creative-writing/index.js';

export async function loadWorldbuildingHelper() {
  const api = await loadWriterHelper();
  return Object.freeze({
    writer: api,
    setting: globalThis.WriterToolsSetting,
    lore: globalThis.WriterToolsLoreLibrary,
    timeline: globalThis.WriterToolsTimeline,
    storyGraph: globalThis.WriterToolsStoryGraph,
    characters: globalThis.WriterToolsCharacterLibrary,
    relationships: globalThis.WriterToolsRelationshipEngine,
    peoplePlaces: globalThis.PeoplePlaces,
  });
}

export default loadWorldbuildingHelper;
