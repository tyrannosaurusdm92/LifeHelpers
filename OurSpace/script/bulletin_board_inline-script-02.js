
(function () {
  'use strict';

  const VERSION = 1;

  function uid(prefix) {
    const random = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${random}`;
  }

  function now() { return new Date().toISOString(); }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function normalizeTags(input) {
    const values = Array.isArray(input) ? input : String(input || '').split(',');
    return [...new Set(values.map(v => v.trim().toLowerCase()).filter(Boolean))];
  }

  function domainFromUrl(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
  }

  function defaultState() {
    const boardId = uid('board');
    const welcomeId = uid('item');
    const noteId = uid('item');
    const linkId = uid('item');
    const eventId = uid('item');
    const created = now();

    return {
      schemaVersion: VERSION,
      createdAt: created,
      updatedAt: created,
      activeBoardId: boardId,
      arrangeMode: false,
      zoom: 1,
      search: '',
      boards: {
        [boardId]: {
          id: boardId,
          title: 'My Bulletin',
          description: 'A private visual surface for scraps, ideas, links and memories.',
          theme: 'paper',
          view: 'freeform',
          private: true,
          archived: false,
          snap: false,
          createdAt: created,
          updatedAt: created
        }
      },
      items: {
        [welcomeId]: {
          id: welcomeId,
          type: 'note',
          title: 'Welcome to Bulletin',
          body: 'This package combines a freeform scrapbook surface with pinboard saving and a searchable archive. Turn Arrange on to drag cards, or select a card and use the inspector for precise non-drag controls.',
          whySaved: 'Starter guide',
          tags: ['welcome', 'guide'],
          favorite: true,
          archived: false,
          inbox: false,
          source: {},
          asset: null,
          event: null,
          createdAt: created,
          updatedAt: created
        },
        [noteId]: {
          id: noteId,
          type: 'quote',
          title: 'One object, many contexts',
          body: 'The same saved thing can live on several boards without being duplicated. Each placement keeps its own visual arrangement.',
          whySaved: 'Core architecture from the research dossier',
          tags: ['research', 'architecture'],
          favorite: false,
          archived: false,
          inbox: false,
          source: {},
          asset: null,
          event: null,
          createdAt: created,
          updatedAt: created
        },
        [linkId]: {
          id: linkId,
          type: 'link',
          title: 'Research reference',
          body: 'Keep a source link and your own annotation separate so the scrapbook can stay expressive without losing provenance.',
          whySaved: 'Example source card',
          tags: ['source', 'research'],
          favorite: false,
          archived: false,
          inbox: false,
          source: { originalUrl: 'https://help.are.na/docs/getting-started/blocks', domain: 'help.are.na' },
          asset: null,
          event: null,
          createdAt: created,
          updatedAt: created
        },
        [eventId]: {
          id: eventId,
          type: 'event',
          title: 'Example event scrap',
          body: 'Events can start as planning cards and later become memory packets with photos, notes and ticket images.',
          whySaved: 'Shows a structured item on a scrapbook surface',
          tags: ['event', 'example'],
          favorite: false,
          archived: false,
          inbox: false,
          source: {},
          asset: null,
          event: { start: '', location: 'Anywhere' },
          createdAt: created,
          updatedAt: created
        }
      },
      placements: {},
      deleted: []
    };
  }

  function seedPlacements(state) {
    if (Object.keys(state.placements || {}).length) return state;
    const ids = Object.keys(state.items);
    const boardId = state.activeBoardId;
    const presets = [
      { x: 80, y: 80, width: 330, height: 245, rotation: -2, style: 'paper', attachment: 'tape' },
      { x: 465, y: 105, width: 310, height: 225, rotation: 2.5, style: 'note', attachment: 'pin' },
      { x: 170, y: 390, width: 350, height: 235, rotation: 1.5, style: 'clipping', attachment: 'clip' },
      { x: 575, y: 375, width: 315, height: 220, rotation: -1.5, style: 'ticket', attachment: 'pin' }
    ];
    ids.forEach((itemId, i) => {
      const p = presets[i % presets.length];
      const id = uid('place');
      state.placements[id] = {
        id, itemId, boardId,
        x: p.x, y: p.y, width: p.width, height: p.height,
        rotation: p.rotation, z: i + 1,
        style: p.style, attachment: p.attachment,
        localCaption: '', localNote: '', locked: false,
        createdAt: now(), updatedAt: now()
      };
    });
    return state;
  }

  function migrateState(input) {
    if (!input || typeof input !== 'object') return seedPlacements(defaultState());
    const state = input;
    state.schemaVersion = VERSION;
    state.boards = state.boards || {};
    state.items = state.items || {};
    state.placements = state.placements || {};
    state.deleted = state.deleted || [];
    state.arrangeMode = Boolean(state.arrangeMode);
    state.zoom = clamp(Number(state.zoom) || 1, 0.4, 2);
    if (!state.activeBoardId || !state.boards[state.activeBoardId]) {
      state.activeBoardId = Object.keys(state.boards)[0] || null;
    }
    return state.activeBoardId ? state : seedPlacements(defaultState());
  }

  function createBoard(state, data) {
    const id = uid('board');
    state.boards[id] = {
      id,
      title: (data.title || 'Untitled board').trim(),
      description: '',
      theme: data.theme || 'paper',
      view: data.view || 'freeform',
      private: data.private !== false,
      archived: false,
      snap: false,
      createdAt: now(),
      updatedAt: now()
    };
    state.activeBoardId = id;
    return state.boards[id];
  }

  function createItem(state, data) {
    const id = uid('item');
    const sourceUrl = (data.url || '').trim();
    state.items[id] = {
      id,
      type: data.type || 'note',
      title: (data.title || '').trim() || defaultTitleForType(data.type),
      body: (data.body || '').trim(),
      whySaved: (data.whySaved || '').trim(),
      alt: (data.alt || '').trim(),
      tags: normalizeTags(data.tags),
      favorite: false,
      archived: false,
      inbox: true,
      source: sourceUrl ? { originalUrl: sourceUrl, domain: domainFromUrl(sourceUrl) } : {},
      asset: data.asset || null,
      event: data.type === 'event' ? { start: data.eventDate || '', location: (data.eventLocation || '').trim() } : null,
      createdAt: now(),
      updatedAt: now()
    };
    return state.items[id];
  }

  function defaultTitleForType(type) {
    return ({ note: 'Untitled note', link: 'Saved link', image: 'Saved image', quote: 'Saved quote', event: 'Event', file: 'Saved file' })[type] || 'Untitled scrap';
  }

  function createPlacement(state, itemId, boardId, overrides) {
    const existing = Object.values(state.placements).find(p => p.itemId === itemId && p.boardId === boardId);
    if (existing) return existing;
    const count = Object.values(state.placements).filter(p => p.boardId === boardId).length;
    const id = uid('place');
    const baseX = 70 + (count % 4) * 285;
    const baseY = 70 + Math.floor(count / 4) * 250;
    const item = state.items[itemId];
    const styleByType = { note: 'note', quote: 'clipping', event: 'ticket', image: 'photo', file: 'paper', link: 'paper' };
    state.placements[id] = Object.assign({
      id, itemId, boardId,
      x: baseX, y: baseY, width: 300, height: item && item.type === 'image' ? 300 : 220,
      rotation: ((count % 5) - 2) * 1.2,
      z: count + 1,
      style: styleByType[item?.type] || 'paper',
      attachment: count % 3 === 0 ? 'tape' : (count % 3 === 1 ? 'pin' : 'clip'),
      localCaption: '', localNote: '', locked: false,
      createdAt: now(), updatedAt: now()
    }, overrides || {});
    if (state.items[itemId]) state.items[itemId].inbox = false;
    return state.placements[id];
  }

  function placementsForBoard(state, boardId) {
    return Object.values(state.placements).filter(p => p.boardId === boardId && state.items[p.itemId]);
  }

  function boardsForItem(state, itemId) {
    const ids = new Set(Object.values(state.placements).filter(p => p.itemId === itemId).map(p => p.boardId));
    return [...ids].map(id => state.boards[id]).filter(Boolean);
  }

  function removePlacement(state, placementId) {
    const placement = state.placements[placementId];
    if (!placement) return;
    const itemId = placement.itemId;
    delete state.placements[placementId];
    const stillPlaced = Object.values(state.placements).some(p => p.itemId === itemId);
    if (!stillPlaced && state.items[itemId]) state.items[itemId].inbox = true;
  }

  function deleteItemEverywhere(state, itemId) {
    Object.keys(state.placements).forEach(pid => {
      if (state.placements[pid].itemId === itemId) delete state.placements[pid];
    });
    if (state.items[itemId]) {
      state.deleted.push({ type: 'item', data: state.items[itemId], deletedAt: now() });
      delete state.items[itemId];
    }
  }

  function copyPlacementToBoard(state, placementId, boardId) {
    const source = state.placements[placementId];
    if (!source || !state.boards[boardId] || !state.items[source.itemId]) return null;
    const existing = Object.values(state.placements).find(p => p.itemId === source.itemId && p.boardId === boardId);
    if (existing) return existing;
    return createPlacement(state, source.itemId, boardId, {
      x: source.x, y: source.y, width: source.width, height: source.height,
      rotation: source.rotation, z: source.z, style: source.style, attachment: source.attachment,
      localCaption: source.localCaption || '', localNote: source.localNote || '', locked: false
    });
  }

  function duplicateBoard(state, boardId) {
    const source = state.boards[boardId];
    if (!source) return null;
    const copy = createBoard(state, {
      title: `${source.title} (copy)`, theme: source.theme, view: source.view, private: source.private
    });
    copy.description = source.description || '';
    copy.snap = Boolean(source.snap);
    const sourcePlacements = placementsForBoard(state, boardId).slice().sort((a,b) => (a.z || 0) - (b.z || 0));
    sourcePlacements.forEach(p => createPlacement(state, p.itemId, copy.id, {
      x: p.x, y: p.y, width: p.width, height: p.height, rotation: p.rotation, z: p.z,
      style: p.style, attachment: p.attachment, localCaption: p.localCaption || '',
      localNote: p.localNote || '', locked: Boolean(p.locked)
    }));
    copy.updatedAt = now();
    return copy;
  }

  function deleteBoard(state, boardId) {
    const board = state.boards[boardId];
    if (!board) return false;
    const boardPlacements = placementsForBoard(state, boardId).map(p => ({...p}));
    state.deleted.push({ type: 'board', data: { board: {...board}, placements: boardPlacements }, deletedAt: now() });
    const affectedItems = new Set(boardPlacements.map(p => p.itemId));
    boardPlacements.forEach(p => delete state.placements[p.id]);
    delete state.boards[boardId];
    affectedItems.forEach(itemId => {
      const stillPlaced = Object.values(state.placements).some(p => p.itemId === itemId);
      if (!stillPlaced && state.items[itemId]) state.items[itemId].inbox = true;
    });
    const next = Object.values(state.boards).find(b => !b.archived) || Object.values(state.boards)[0];
    if (next) state.activeBoardId = next.id;
    else createBoard(state, { title: 'My Bulletin', theme: 'paper', view: 'freeform', private: true });
    return true;
  }

  function matchesSearch(item, query) {
    if (!query) return true;
    const haystack = [item.title, item.body, item.whySaved, item.alt, ...(item.tags || []), item.source?.domain, item.source?.originalUrl, item.event?.location]
      .filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  window.BulletinModel = {
    VERSION, uid, now, clamp, normalizeTags, domainFromUrl,
    defaultState, seedPlacements, migrateState, createBoard, createItem, createPlacement,
    copyPlacementToBoard, duplicateBoard, deleteBoard,
    placementsForBoard, boardsForItem, removePlacement, deleteItemEverywhere,
    matchesSearch
  };
})();

