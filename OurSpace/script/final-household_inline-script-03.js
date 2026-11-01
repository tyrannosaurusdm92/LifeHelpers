
(function () {
  'use strict';

  /*
    OurSpace Retro Branding + Appearance Layer
    ------------------------------------------
    Features kept intentionally narrow:
      - applies the OurSpace retro visual system
      - keeps OurSpace text in the brand font
      - gives users color-wheel controls
      - lets users upload a page background and brand/logo image
      - supports reusable image-upload inputs and drop zones
      - stores appearance settings locally
      - stores uploaded image blobs in IndexedDB when available

    Optional HTML hooks:
      <img data-os-brand-logo alt="OurSpace logo">
      <input type="file" accept="image/*" data-os-image-upload="#target">
      <div id="target"></div>
      <div data-os-image-drop="#target">Drop an image here</div>
  */

  const ROOT_CLASS = 'os-retro-enabled';
  const SETTINGS_KEY = 'ourspace.retro.appearance.v1';
  const DB_NAME = 'OurSpaceRetroAssets';
  const DB_VERSION = 1;
  const STORE_NAME = 'images';
  const BRAND_PATTERN = /\b(?:OurSpace|Ourspace|ourspace)\b/g;
  const BRAND_SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'NOSCRIPT',
    'CODE', 'PRE', 'TITLE', 'SVG', 'PATH'
  ]);
  const activeObjectUrls = new Map();

  const defaults = Object.freeze({
    pageBackground: '#d5e8fb',
    panel: '#ffffff',
    panelText: '#003399',
    titlebar: '#243950',
    titlebarText: '#ffffff',
    accent: '#b1d0f0',
    secondary: '#6699cc',
    button: '#f3f7fc',
    heading: '#243950',
    link: '#243950',
    focus: '#b1d0f0',
    backgroundOpacity: 0.16,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    scanlineOpacity: 0.02,
    backgroundFileName: '',
    logoFileName: ''
  });

  let settings = loadSettings();
  let brandObserver = null;
  let customizer = null;
  let launcher = null;
  let lastFocusedElement = null;
  let brandRefreshQueued = false;

  function safeParse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_error) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (_error) { return false; }
  }

  function storageRemove(key) {
    try { window.localStorage.removeItem(key); return true; } catch (_error) { return false; }
  }

  function loadSettings() {
    const saved = safeParse(storageGet(SETTINGS_KEY), {});
    return Object.assign({}, defaults, saved);
  }

  function saveSettings() {
    try {
      if (!storageSet(SETTINGS_KEY, JSON.stringify(settings))) {
        throw new Error('Browser storage is unavailable.');
      }
    } catch (error) {
      setStatus('Appearance changed, but browser storage is full or blocked.', 'error');
      console.warn('[OurSpaceRetro] Could not save appearance settings.', error);
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '').trim());
  }

  function validColor(value, fallback) {
    return isHexColor(value) ? String(value).toLowerCase() : fallback;
  }

  function setCss(name, value) {
    document.documentElement.style.setProperty(name, String(value));
  }

  function applySettings() {
    document.documentElement.classList.add(ROOT_CLASS);
    setCss('--os-retro-page-bg', validColor(settings.pageBackground, defaults.pageBackground));
    setCss('--os-retro-panel', validColor(settings.panel, defaults.panel));
    setCss('--os-retro-panel-text', validColor(settings.panelText, defaults.panelText));
    setCss('--os-retro-titlebar', validColor(settings.titlebar, defaults.titlebar));
    setCss('--os-retro-titlebar-text', validColor(settings.titlebarText, defaults.titlebarText));
    setCss('--os-retro-accent', validColor(settings.accent, defaults.accent));
    setCss('--os-retro-secondary', validColor(settings.secondary, defaults.secondary));
    setCss('--os-retro-button', validColor(settings.button, defaults.button));
    setCss('--os-retro-heading', validColor(settings.heading, defaults.heading));
    setCss('--os-retro-link', validColor(settings.link, defaults.link));
    setCss('--os-retro-focus', validColor(settings.focus, defaults.focus));
    setCss('--os-retro-page-image-opacity', clamp(settings.backgroundOpacity, 0, 1));
    setCss('--os-retro-page-image-size', settings.backgroundSize || defaults.backgroundSize);
    setCss('--os-retro-page-image-position', settings.backgroundPosition || defaults.backgroundPosition);
    setCss('--os-retro-page-image-repeat', settings.backgroundRepeat || defaults.backgroundRepeat);
    setCss('--os-retro-scanline-opacity', clamp(settings.scanlineOpacity, 0, 0.3));
    fillCustomizerFromSettings();
  }

  function shouldSkipBrandNode(node) {
    const parent = node && node.parentElement;
    if (!parent) return true;
    if (parent.closest('.ourspace-brand-text, .os-retro-customizer')) return true;
    let current = parent;
    while (current) {
      if (BRAND_SKIP_TAGS.has(current.tagName)) return true;
      current = current.parentElement;
    }
    return false;
  }

  function wrapBrandTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipBrandNode(node)) return;
    const text = node.nodeValue || '';
    BRAND_PATTERN.lastIndex = 0;
    if (!BRAND_PATTERN.test(text)) {
      BRAND_PATTERN.lastIndex = 0;
      return;
    }
    BRAND_PATTERN.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    text.replace(BRAND_PATTERN, function (match, offset) {
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      }
      const span = document.createElement('span');
      span.className = 'ourspace-brand-text';
      span.textContent = 'OurSpace';
      fragment.appendChild(span);
      lastIndex = offset + match.length;
      return match;
    });
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    node.parentNode.replaceChild(fragment, node);
  }

  function applyBranding(root) {
    const target = root || document.body;
    if (!target) return;
    if (target.nodeType === Node.TEXT_NODE) {
      wrapBrandTextNode(target);
      return;
    }
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) return;

    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return shouldSkipBrandNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapBrandTextNode);
  }

  function queueBrandRefresh() {
    if (brandRefreshQueued) return;
    brandRefreshQueued = true;
    window.setTimeout(function () {
      brandRefreshQueued = false;
      applyBranding(document.body);
      ensureBrandBadge();
      applyStoredLogo();
    }, 50);
  }

  function startBrandObserver() {
    if (!document.body || brandObserver) return;
    brandObserver = new MutationObserver(function (records) {
      for (const record of records) {
        if (record.type !== 'childList' || !record.addedNodes.length) continue;
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE && /ourspace/i.test(node.nodeValue || '')) {
            queueBrandRefresh();
            return;
          }
          if (node.nodeType === Node.ELEMENT_NODE && /ourspace/i.test(node.textContent || '')) {
            queueBrandRefresh();
            return;
          }
        }
      }
    });
    brandObserver.observe(document.body, { childList: true, subtree: true });
  }

  function findBrandContainer() {
    return document.querySelector(
      '[data-ourspace-brand-container], .brand, .retro-logo, .app-brand, .site-brand, .topbar .brand'
    );
  }

  function ensureBrandBadge() {
    const container = findBrandContainer();
    if (!container || container.querySelector('.os-retro-brand-badge')) return;

    const existingLogo = container.querySelector('[data-os-brand-logo], .logo, .brand-logo');
    const existingName = container.querySelector('[data-ourspace-brand], .ourspace-brand, h1, .brand-name');
    if (existingLogo) existingLogo.setAttribute('data-os-brand-logo', '');
    if (existingName) existingName.setAttribute('data-ourspace-brand', '');

    if (existingName && !existingLogo) {
      const logo = document.createElement('span');
      logo.className = 'os-retro-brand-logo';
      logo.setAttribute('data-os-brand-logo', '');
      logo.setAttribute('aria-hidden', 'true');
      logo.textContent = 'O';
      container.insertBefore(logo, existingName);
      return;
    }
    if (existingLogo || existingName) return;

    const badge = document.createElement('span');
    badge.className = 'os-retro-brand-badge';
    badge.innerHTML =
      '<span class="os-retro-brand-logo" data-os-brand-logo aria-hidden="true">O</span>' +
      '<span class="os-retro-brand-name" data-ourspace-brand>OurSpace</span>';
    container.prepend(badge);
  }

  function openDatabase() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  async function putImage(key, fileOrBlob) {
    const database = await openDatabase();
    if (!database) {
      const dataUrl = await blobToDataUrl(fileOrBlob);
      if (!storageSet(SETTINGS_KEY + '.image.' + key, dataUrl)) throw new Error('Browser image storage is unavailable.');
      return;
    }
    await new Promise(function (resolve, reject) {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(fileOrBlob, key);
      transaction.oncomplete = function () { resolve(); };
      transaction.onerror = function () { reject(transaction.error); };
    });
    database.close();
  }

  async function getImage(key) {
    const database = await openDatabase();
    if (!database) {
      const dataUrl = storageGet(SETTINGS_KEY + '.image.' + key);
      return dataUrl || null;
    }
    const result = await new Promise(function (resolve, reject) {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error); };
    });
    database.close();
    return result;
  }

  async function deleteImage(key) {
    const database = await openDatabase();
    if (!database) {
      storageRemove(SETTINGS_KEY + '.image.' + key);
      return;
    }
    await new Promise(function (resolve, reject) {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = function () { resolve(); };
      transaction.onerror = function () { reject(transaction.error); };
    });
    database.close();
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(reader.error || new Error('Could not read image.')); };
      reader.readAsDataURL(blob);
    });
  }

  function validateImageFile(file) {
    if (!file) throw new Error('No image was selected.');
    if (!String(file.type || '').startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('Please choose an image smaller than 25 MB.');
    }
    return file;
  }

  function objectUrlFor(key, blob) {
    const oldUrl = activeObjectUrls.get(key);
    if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
    const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
    activeObjectUrls.set(key, url);
    return url;
  }

  function escapeCssUrl(url) {
    return String(url || '').replace(/["\\\n\r]/g, function (character) {
      return encodeURIComponent(character);
    });
  }

  async function applyStoredBackground() {
    try {
      const blob = await getImage('background');
      if (!blob) {
        setCss('--os-retro-page-image', 'none');
        updateImagePreview('background', '');
        return;
      }
      const url = objectUrlFor('background', blob);
      setCss('--os-retro-page-image', 'url("' + escapeCssUrl(url) + '")');
      updateImagePreview('background', url);
    } catch (error) {
      console.warn('[OurSpaceRetro] Could not restore background image.', error);
    }
  }

  function logoTargets() {
    return Array.from(document.querySelectorAll('[data-os-brand-logo], .os-retro-brand-logo'));
  }

  function applyLogoUrl(url) {
    logoTargets().forEach(function (target) {
      if (target.tagName === 'IMG') {
        target.src = url;
        target.style.display = 'block';
        return;
      }
      let image = target.querySelector(':scope > img.os-retro-uploaded-logo');
      if (!image) {
        image = document.createElement('img');
        image.className = 'os-retro-uploaded-logo';
        image.alt = 'OurSpace logo';
        target.textContent = '';
        target.appendChild(image);
      }
      image.src = url;
    });
    updateImagePreview('logo', url);
  }

  function clearLogoTargets() {
    logoTargets().forEach(function (target) {
      if (target.tagName === 'IMG') {
        target.removeAttribute('src');
        target.style.display = 'none';
        return;
      }
      target.querySelectorAll(':scope > img.os-retro-uploaded-logo').forEach(function (image) {
        image.remove();
      });
      if (!target.textContent.trim()) target.textContent = 'O';
    });
    updateImagePreview('logo', '');
  }

  async function applyStoredLogo() {
    try {
      const blob = await getImage('logo');
      if (!blob) {
        clearLogoTargets();
        return;
      }
      const url = objectUrlFor('logo', blob);
      applyLogoUrl(url);
    } catch (error) {
      console.warn('[OurSpaceRetro] Could not restore logo image.', error);
    }
  }

  async function saveUploadedImage(kind, file) {
    validateImageFile(file);
    setStatus('Saving ' + file.name + '…');
    await putImage(kind, file);
    if (kind === 'background') {
      settings.backgroundFileName = file.name;
      await applyStoredBackground();
    } else if (kind === 'logo') {
      settings.logoFileName = file.name;
      await applyStoredLogo();
    }
    saveSettings();
    fillCustomizerFromSettings();
    setStatus(file.name + ' is now in use.', 'success');
  }

  async function removeUploadedImage(kind) {
    await deleteImage(kind);
    const oldUrl = activeObjectUrls.get(kind);
    if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
    activeObjectUrls.delete(kind);
    if (kind === 'background') {
      settings.backgroundFileName = '';
      setCss('--os-retro-page-image', 'none');
      updateImagePreview('background', '');
    } else if (kind === 'logo') {
      settings.logoFileName = '';
      clearLogoTargets();
    }
    saveSettings();
    fillCustomizerFromSettings();
    setStatus('Uploaded ' + kind + ' image removed.', 'success');
  }

  function colorField(key, label) {
    return (
      '<label class="os-retro-customizer__field" for="os-retro-' + key + '">' +
        escapeHtml(label) +
        '<span class="os-retro-customizer__color-row">' +
          '<input type="color" id="os-retro-' + key + '" data-setting="' + key + '" value="' + escapeHtml(settings[key]) + '">' +
          '<input type="text" id="os-retro-' + key + '-hex" data-hex-for="' + key + '" value="' + escapeHtml(settings[key]) + '" maxlength="7" spellcheck="false" aria-label="' + escapeHtml(label) + ' hex color">' +
        '</span>' +
      '</label>'
    );
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[character];
    });
  }

  function buildCustomizer() {
    if (customizer) return;

    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'os-retro-customizer-launcher';
    launcher.textContent = 'Customize Profile';
    launcher.hidden = true;
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.addEventListener('click', openCustomizer);
    (document.getElementById('householdSidebar')||document.body).appendChild(launcher);

    const backdrop = document.createElement('div');
    backdrop.className = 'os-retro-customizer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML =
      '<section class="os-retro-customizer" role="dialog" aria-modal="true" aria-labelledby="os-retro-customizer-title">' +
        '<header class="os-retro-customizer__titlebar">' +
          '<h2 id="os-retro-customizer-title">OurSpace Profile Designer</h2>' +
          '<button type="button" class="os-retro-customizer__close" data-retro-close aria-label="Close appearance editor">×</button>' +
        '</header>' +
        '<div class="os-retro-customizer__body">' +
          '<section class="os-retro-customizer__section">' +
            '<h3>Brand Images</h3>' +
            '<div class="os-retro-customizer__grid">' +
              imageUploadBlock('background', 'Page background', 'Upload a JPG, PNG, WEBP, or GIF.') +
              imageUploadBlock('logo', 'OurSpace logo / badge', 'The OurSpace name remains locked to the brand font.') +
            '</div>' +
          '</section>' +
          '<section class="os-retro-customizer__section">' +
            '<h3>Page &amp; Profile Colors</h3>' +
            '<div class="os-retro-customizer__grid">' +
              colorField('pageBackground', 'Page background') +
              colorField('panel', 'Panels and windows') +
              colorField('panelText', 'Panel text') +
              colorField('titlebar', 'Title bars') +
              colorField('titlebarText', 'Title-bar text') +
              colorField('accent', 'Primary cyan accent') +
              colorField('secondary', 'Secondary orange accent') +
              colorField('button', 'Buttons') +
              colorField('heading', 'Headings') +
              colorField('link', 'Links') +
              colorField('focus', 'Keyboard focus') +
            '</div>' +
          '</section>' +
          '<section class="os-retro-customizer__section">' +
            '<h3>Background and CRT</h3>' +
            '<div class="os-retro-customizer__grid">' +
              '<label class="os-retro-customizer__field">Image opacity' +
                '<input type="range" data-setting="backgroundOpacity" min="0" max="1" step="0.01">' +
              '</label>' +
              '<label class="os-retro-customizer__field">Scanline strength' +
                '<input type="range" data-setting="scanlineOpacity" min="0" max="0.3" step="0.005">' +
              '</label>' +
              '<label class="os-retro-customizer__field">Image fit' +
                '<select data-setting="backgroundSize">' +
                  '<option value="cover">Cover</option>' +
                  '<option value="contain">Contain</option>' +
                  '<option value="auto">Original size</option>' +
                  '<option value="100% 100%">Stretch</option>' +
                '</select>' +
              '</label>' +
              '<label class="os-retro-customizer__field">Image repeat' +
                '<select data-setting="backgroundRepeat">' +
                  '<option value="no-repeat">No repeat</option>' +
                  '<option value="repeat">Tile both directions</option>' +
                  '<option value="repeat-x">Tile horizontally</option>' +
                  '<option value="repeat-y">Tile vertically</option>' +
                '</select>' +
              '</label>' +
              '<label class="os-retro-customizer__field">Image position' +
                '<select data-setting="backgroundPosition">' +
                  '<option value="center center">Center</option>' +
                  '<option value="top center">Top</option>' +
                  '<option value="bottom center">Bottom</option>' +
                  '<option value="center left">Left</option>' +
                  '<option value="center right">Right</option>' +
                '</select>' +
              '</label>' +
            '</div>' +
          '</section>' +
          '<div class="os-retro-customizer__status" data-retro-status aria-live="polite">Changes save in this browser.</div>' +
          '<div class="os-retro-customizer__actions">' +
            '<button type="button" data-retro-reset>Reset colors and settings</button>' +
            '<button type="button" class="primary" data-retro-done>Done</button>' +
          '</div>' +
        '</div>' +
      '</section>';

    document.body.appendChild(backdrop);
    customizer = backdrop;

    backdrop.querySelector('[data-retro-close]').addEventListener('click', closeCustomizer);
    backdrop.querySelector('[data-retro-done]').addEventListener('click', closeCustomizer);
    backdrop.querySelector('[data-retro-reset]').addEventListener('click', resetAppearance);
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeCustomizer();
    });
    backdrop.addEventListener('input', handleCustomizerInput);
    backdrop.addEventListener('change', handleCustomizerChange);
    backdrop.addEventListener('click', handleCustomizerClick);
    document.addEventListener('keydown', handleDialogKeydown);

    fillCustomizerFromSettings();
  }

  function imageUploadBlock(kind, label, note) {
    return (
      '<div class="os-retro-customizer__field">' +
        '<strong>' + escapeHtml(label) + '</strong>' +
        '<div class="os-retro-customizer__preview" data-preview="' + kind + '">' +
          '<span class="os-retro-customizer__preview-empty">No image uploaded</span>' +
        '</div>' +
        '<span>' + escapeHtml(note) + '</span>' +
        '<input class="os-retro-visually-hidden" type="file" accept="image/*,.gif" id="os-retro-upload-' + kind + '" data-upload-kind="' + kind + '">' +
        '<div class="os-retro-customizer__actions">' +
          '<button type="button" data-choose-image="' + kind + '">Choose image</button>' +
          '<button type="button" data-remove-image="' + kind + '">Remove</button>' +
        '</div>' +
        '<small data-file-name="' + kind + '"></small>' +
      '</div>'
    );
  }

  function fillCustomizerFromSettings() {
    if (!customizer) return;
    customizer.querySelectorAll('[data-setting]').forEach(function (input) {
      const key = input.dataset.setting;
      if (!(key in settings)) return;
      if (input.type === 'color') input.value = validColor(settings[key], defaults[key]);
      else input.value = String(settings[key]);
    });
    customizer.querySelectorAll('[data-hex-for]').forEach(function (input) {
      const key = input.dataset.hexFor;
      input.value = validColor(settings[key], defaults[key]);
    });
    const backgroundName = customizer.querySelector('[data-file-name="background"]');
    const logoName = customizer.querySelector('[data-file-name="logo"]');
    if (backgroundName) backgroundName.textContent = settings.backgroundFileName || 'No background image saved.';
    if (logoName) logoName.textContent = settings.logoFileName || 'No logo image saved.';
  }

  function updateImagePreview(kind, url) {
    if (!customizer) return;
    const preview = customizer.querySelector('[data-preview="' + kind + '"]');
    if (!preview) return;
    preview.textContent = '';
    if (!url) {
      const empty = document.createElement('span');
      empty.className = 'os-retro-customizer__preview-empty';
      empty.textContent = 'No image uploaded';
      preview.appendChild(empty);
      return;
    }
    const image = document.createElement('img');
    image.src = url;
    image.alt = kind === 'logo' ? 'Uploaded OurSpace logo preview' : 'Uploaded background preview';
    preview.appendChild(image);
  }

  function setStatus(message, state) {
    if (!customizer) return;
    const element = customizer.querySelector('[data-retro-status]');
    if (!element) return;
    element.textContent = message;
    if (state) element.dataset.state = state;
    else element.removeAttribute('data-state');
  }

  function handleCustomizerInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;

    if (input.dataset.hexFor) {
      const key = input.dataset.hexFor;
      if (!isHexColor(input.value)) return;
      settings[key] = input.value.toLowerCase();
      const wheel = customizer.querySelector('[data-setting="' + key + '"][type="color"]');
      if (wheel) wheel.value = settings[key];
      saveSettings();
      applySettings();
      return;
    }

    const key = input.dataset.setting;
    if (!key) return;
    settings[key] = input.type === 'range' ? Number(input.value) : input.value;
    if (input.type === 'color') {
      const hex = customizer.querySelector('[data-hex-for="' + key + '"]');
      if (hex) hex.value = input.value;
    }
    saveSettings();
    applySettings();
    setStatus('Appearance saved.', 'success');
  }

  async function handleCustomizerChange(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const kind = input.dataset.uploadKind;
    if (!kind || !input.files || !input.files[0]) return;
    try {
      await saveUploadedImage(kind, input.files[0]);
    } catch (error) {
      setStatus(error.message || 'Could not use that image.', 'error');
    } finally {
      input.value = '';
    }
  }

  function handleCustomizerClick(event) {
    const choose = event.target.closest('[data-choose-image]');
    if (choose) {
      const input = customizer.querySelector('#os-retro-upload-' + choose.dataset.chooseImage);
      if (input) input.click();
      return;
    }

    const remove = event.target.closest('[data-remove-image]');
    if (remove) {
      removeUploadedImage(remove.dataset.removeImage).catch(function (error) {
        setStatus(error.message || 'Could not remove the image.', 'error');
      });
    }
  }

  function openCustomizer() {
    buildCustomizer();
    lastFocusedElement = document.activeElement;
    customizer.classList.add('is-open');
    customizer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = customizer.querySelector('[data-retro-close]');
    if (close) close.focus();
    applyStoredBackground();
    applyStoredLogo();
  }

  function closeCustomizer() {
    if (!customizer) return;
    customizer.classList.remove('is-open');
    customizer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    } else if (launcher) {
      launcher.focus();
    }
  }

  function handleDialogKeydown(event) {
    if (!customizer || !customizer.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCustomizer();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(customizer.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) { return element.offsetParent !== null; });
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function resetAppearance() {
    settings = Object.assign({}, defaults, {
      backgroundFileName: settings.backgroundFileName || '',
      logoFileName: settings.logoFileName || ''
    });
    saveSettings();
    applySettings();
    setStatus('Colors and display settings reset. Uploaded images were kept.', 'success');
  }

  function resolveTarget(selectorOrElement) {
    if (selectorOrElement instanceof Element) return selectorOrElement;
    if (typeof selectorOrElement !== 'string' || !selectorOrElement.trim()) return null;
    try {
      return document.querySelector(selectorOrElement.trim());
    } catch (_error) {
      return null;
    }
  }

  function applyImageToTarget(target, url) {
    if (!target) return;
    if (target.tagName === 'IMG' || target.tagName === 'SOURCE') {
      target.src = url;
    } else if (target.tagName === 'VIDEO') {
      target.poster = url;
    } else {
      target.style.backgroundImage = 'url("' + escapeCssUrl(url) + '")';
      target.style.backgroundSize = target.dataset.osImageFit || 'cover';
      target.style.backgroundPosition = target.dataset.osImagePosition || 'center';
      target.style.backgroundRepeat = 'no-repeat';
    }
    target.dispatchEvent(new CustomEvent('ourspace:image-applied', {
      bubbles: true,
      detail: { url: url }
    }));
  }

  function genericImageKey(source, target) {
    return 'slot:' + (
      source.dataset.osImageKey ||
      source.name ||
      source.id ||
      target.id ||
      source.dataset.osImageUpload ||
      source.dataset.osImageDrop ||
      Math.random().toString(36).slice(2)
    );
  }

  async function storeAndApplyGenericImage(file, source, target) {
    validateImageFile(file);
    const key = genericImageKey(source, target);
    await putImage(key, file);
    const blob = await getImage(key);
    if (!blob) return;
    const url = objectUrlFor(key, blob);
    applyImageToTarget(target, url);
  }

  function bindImageUpload(input, target) {
    const fileInput = typeof input === 'string' ? document.querySelector(input) : input;
    const imageTarget = resolveTarget(target || (fileInput && fileInput.dataset.osImageUpload));
    if (!(fileInput instanceof HTMLInputElement) || fileInput.type !== 'file' || !imageTarget) return false;
    if (fileInput.dataset.osRetroBound === '1') return true;
    fileInput.dataset.osRetroBound = '1';
    fileInput.accept = fileInput.accept || 'image/*';
    fileInput.addEventListener('change', async function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      try {
        await storeAndApplyGenericImage(file, fileInput, imageTarget);
      } catch (error) {
        console.warn('[OurSpaceRetro] Image upload failed.', error);
        window.alert(error.message || 'Could not use that image.');
      } finally {
        fileInput.value = '';
      }
    });
    restoreGenericImage(fileInput, imageTarget);
    return true;
  }

  async function restoreGenericImage(source, target) {
    try {
      const key = genericImageKey(source, target);
      const blob = await getImage(key);
      if (!blob) return;
      applyImageToTarget(target, objectUrlFor(key, blob));
    } catch (error) {
      console.warn('[OurSpaceRetro] Could not restore an uploaded image.', error);
    }
  }

  function bindDropZone(zone, target) {
    const dropZone = typeof zone === 'string' ? document.querySelector(zone) : zone;
    const imageTarget = resolveTarget(target || (dropZone && dropZone.dataset.osImageDrop));
    if (!(dropZone instanceof Element) || !imageTarget) return false;
    if (dropZone.dataset.osRetroBound === '1') return true;
    dropZone.dataset.osRetroBound = '1';
    dropZone.setAttribute('role', dropZone.getAttribute('role') || 'button');
    dropZone.setAttribute('tabindex', dropZone.getAttribute('tabindex') || '0');

    ['dragenter', 'dragover'].forEach(function (name) {
      dropZone.addEventListener(name, function (event) {
        event.preventDefault();
        dropZone.classList.add('is-dragging');
      });
    });
    ['dragleave', 'drop'].forEach(function (name) {
      dropZone.addEventListener(name, function (event) {
        event.preventDefault();
        dropZone.classList.remove('is-dragging');
      });
    });
    dropZone.addEventListener('drop', async function (event) {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (!file) return;
      try {
        await storeAndApplyGenericImage(file, dropZone, imageTarget);
      } catch (error) {
        console.warn('[OurSpaceRetro] Dropped image failed.', error);
        window.alert(error.message || 'Could not use that image.');
      }
    });
    dropZone.addEventListener('click', function () {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'file';
      hiddenInput.accept = 'image/*';
      hiddenInput.className = 'os-retro-visually-hidden';
      hiddenInput.addEventListener('change', async function () {
        const file = hiddenInput.files && hiddenInput.files[0];
        if (file) await storeAndApplyGenericImage(file, dropZone, imageTarget);
        hiddenInput.remove();
      });
      document.body.appendChild(hiddenInput);
      hiddenInput.click();
    });
    dropZone.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        dropZone.click();
      }
    });
    restoreGenericImage(dropZone, imageTarget);
    return true;
  }

  function bindDeclaredImageControls(root) {
    const scope = root || document;
    scope.querySelectorAll('input[type="file"][data-os-image-upload]').forEach(function (input) {
      bindImageUpload(input);
    });
    scope.querySelectorAll('[data-os-image-drop]').forEach(function (zone) {
      bindDropZone(zone);
    });
  }

  async function initialize() {
    document.documentElement.classList.add(ROOT_CLASS);
    applySettings();
    ensureBrandBadge();
    applyBranding(document.body);
    startBrandObserver();
    buildCustomizer();
    bindDeclaredImageControls(document);
    await Promise.allSettled([applyStoredBackground(), applyStoredLogo()]);

    window.dispatchEvent(new CustomEvent('ourspace:retro-ready', {
      detail: { version: '1.0.0' }
    }));
  }

  window.OurSpaceRetro = Object.freeze({
    version: '1.0.0',
    open: openCustomizer,
    close: closeCustomizer,
    apply: function (patch) {
      if (patch && typeof patch === 'object') {
        settings = Object.assign({}, settings, patch);
        saveSettings();
      }
      applySettings();
    },
    getSettings: function () { return Object.assign({}, settings); },
    reset: resetAppearance,
    applyBranding: applyBranding,
    bindImageUpload: bindImageUpload,
    bindDropZone: bindDropZone,
    refreshImageControls: function (root) { bindDeclaredImageControls(root || document); },
    setImage: async function (target, file, key) {
      const imageTarget = resolveTarget(target);
      if (!imageTarget) throw new Error('Image target was not found.');
      validateImageFile(file);
      const storageKey = 'slot:' + (key || imageTarget.id || Math.random().toString(36).slice(2));
      await putImage(storageKey, file);
      const blob = await getImage(storageKey);
      applyImageToTarget(imageTarget, objectUrlFor(storageKey, blob));
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

