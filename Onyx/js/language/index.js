import loadWriterHelper from '../creative-writing/index.js';

export async function loadLanguageHelper() {
  const api = await loadWriterHelper();
  return Object.freeze({
    writer: api,
    evolveLanguage: api.evolveLanguage,
    createConlang: api.createConlang,
    createFont: api.createFont,
    languageArtifacts: api.languageArtifacts,
    health: api.health,
  });
}

export default loadLanguageHelper;
