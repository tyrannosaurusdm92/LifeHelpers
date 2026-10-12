/* Texture catalog helper for the 250x250 embedded CSS texture library. */
(function (global) {
  'use strict';

  const DEFAULT_MANIFEST_URL = 'json/happy-home-texture-manifest.json';
  const loadedCss = new Map();

  function normalizeBase(base) {
    if (!base) return '';
    return String(base).replace(/\/?$/, '/');
  }

  async function fetchManifest(url = DEFAULT_MANIFEST_URL) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Texture manifest failed to load: ${response.status} ${response.statusText}`);
    const manifest = await response.json();
    if (!manifest || !Array.isArray(manifest.textures) || !Array.isArray(manifest.categories)) {
      throw new Error('Texture manifest has an invalid shape.');
    }
    return manifest;
  }

  function indexManifest(manifest) {
    const byId = new Map();
    const byCategory = new Map();
    for (const texture of manifest.textures) {
      byId.set(texture.id, texture);
      if (!byCategory.has(texture.category)) byCategory.set(texture.category, []);
      byCategory.get(texture.category).push(texture);
    }
    return { byId, byCategory };
  }

  function categoryInfo(manifest, category) {
    return manifest.categories.find(item => item.id === category) || null;
  }

  function loadCategoryCss(manifest, category, options = {}) {
    const info = categoryInfo(manifest, category);
    if (!info) return Promise.reject(new Error(`Unknown texture category: ${category}`));
    const base = normalizeBase(options.baseUrl || '');
    const href = base + info.cssFile;
    if (loadedCss.has(href)) return loadedCss.get(href);

    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`link[data-texture-category="${CSS.escape(category)}"]`);
      if (existing) { resolve(existing); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.textureCategory = category;
      link.onload = () => resolve(link);
      link.onerror = () => reject(new Error(`Failed to load texture stylesheet: ${href}`));
      document.head.appendChild(link);
    });
    loadedCss.set(href, promise);
    return promise;
  }

  async function loadAllCategoryCss(manifest, options = {}) {
    return Promise.all(manifest.categories.map(category => loadCategoryCss(manifest, category.id, options)));
  }

  function applyTexture(element, texture, options = {}) {
    if (!element || !texture) return;
    const previous = element.dataset.textureClass;
    if (previous) element.classList.remove(previous);
    element.classList.add(texture.cssClass);
    element.dataset.textureClass = texture.cssClass;
    element.dataset.textureId = texture.id;
    element.dataset.textureCategory = texture.category;
    if (options.size) element.style.backgroundSize = options.size;
    if (options.repeat === false) element.style.backgroundRepeat = 'no-repeat';
  }

  async function create(options = {}) {
    const manifest = options.manifest || await fetchManifest(options.manifestUrl || DEFAULT_MANIFEST_URL);
    const index = indexManifest(manifest);
    return {
      manifest,
      byId: index.byId,
      byCategory: index.byCategory,
      get(id) { return index.byId.get(id) || null; },
      list(category) { return category ? [...(index.byCategory.get(category) || [])] : [...manifest.textures]; },
      categories() { return [...manifest.categories]; },
      categoryInfo(category) { return categoryInfo(manifest, category); },
      loadCategoryCss(category, cssOptions = {}) { return loadCategoryCss(manifest, category, { ...options, ...cssOptions }); },
      loadAllCategoryCss(cssOptions = {}) { return loadAllCategoryCss(manifest, { ...options, ...cssOptions }); },
      apply(element, textureOrId, applyOptions = {}) {
        const texture = typeof textureOrId === 'string' ? index.byId.get(textureOrId) : textureOrId;
        if (!texture) throw new Error(`Unknown texture: ${textureOrId}`);
        return applyTexture(element, texture, applyOptions);
      }
    };
  }

  global.TextureCatalog = {
    DEFAULT_MANIFEST_URL,
    fetchManifest,
    indexManifest,
    categoryInfo,
    loadCategoryCss,
    loadAllCategoryCss,
    applyTexture,
    create
  };
})(window);
