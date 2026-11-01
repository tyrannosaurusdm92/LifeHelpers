
(function () {
  'use strict';
  const route=new URLSearchParams(location.search);if((route.get('page')||'profile')!=='profile'||route.get('public')==='1')return;

  let state = null;
  let selectedPlacementId = null;
  let libraryMode = null;
  let saveTimer = null;
  let fullscreenFallback = false;

  const $ = id => document.getElementById(id);

  async function init() {
    const stored = await BulletinStorage.getState();
    state = BulletinModel.migrateState(stored || BulletinModel.defaultState());
    if (!stored) BulletinModel.seedPlacements?.(state);
    bindUI();
    BulletinInteractions.bindWorkspace();
    await hydrateOptionalDefaults();
    render();
    commit('Ready', { silent: true });
  }

  async function hydrateOptionalDefaults() {
    // JSON files are useful when served over HTTP, but bulletin.html also works directly from file://.
    try {
      const response = await Promise.reject(new Error('Using embedded defaults'));
      if (!response.ok) return;
      const defaults = await response.json();
      state.referenceDefaults = defaults;
    } catch (_) {}
  }

  function bindUI() {
    $('newBoardBtn').addEventListener('click', openBoardDialog);
    $('addItemBtn').addEventListener('click', openItemDialog);
    $('emptyAddBtn').addEventListener('click', openItemDialog);
    $('boardSettingsBtn').addEventListener('click', openSettingsDialog);
    $('fullscreenBoardBtn').addEventListener('click', enterBoardFullscreen);
    $('fullscreenExitBtn').addEventListener('click', exitBoardFullscreen);
    $('closeInspectorBtn').addEventListener('click', () => selectPlacement(null));
    $('arrangeModeBtn').addEventListener('click', toggleArrangeMode);
    $('zoomInBtn').addEventListener('click', () => setZoom((state.zoom || 1) + .1));
    $('zoomOutBtn').addEventListener('click', () => setZoom((state.zoom || 1) - .1));
    $('fitBoardBtn').addEventListener('click', () => setZoom(1));
    $('searchInput').addEventListener('input', event => { state.search = event.target.value; renderBoardContent(); });
    $('boardTitleButton').addEventListener('click', renameActiveBoard);
    $('sidebarToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
    $('collapseBoardsBtn').addEventListener('click', () => $('boardList').classList.toggle('collapsed'));

    $('boardList').addEventListener('click', event => {
      const btn = event.target.closest('[data-board-id]');
      if (!btn) return;
      state.activeBoardId = btn.dataset.boardId;
      libraryMode = null;
      selectedPlacementId = null;
      $('sidebar').classList.remove('open');
      render();
      commit('Opened board', { silent: true });
    });

    document.querySelector('.library-nav').addEventListener('click', event => {
      const btn = event.target.closest('[data-library]');
      if (!btn) return;
      const mode = btn.dataset.library;
      if (mode === 'boards') {
        libraryMode = null;
      } else {
        libraryMode = mode;
      }
      selectedPlacementId = null;
      document.querySelectorAll('.nav-button').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });

    document.querySelector('.view-switcher').addEventListener('click', event => {
      const btn = event.target.closest('[data-view]');
      if (!btn || libraryMode) return;
      const board = activeBoard();
      if (!board) return;
      board.view = btn.dataset.view;
      board.updatedAt = BulletinModel.now();
      selectedPlacementId = null;
      render();
      commit(`View changed to ${board.view}`);
    });

    document.querySelector('.type-picker').addEventListener('click', event => {
      const btn = event.target.closest('[data-type]');
      if (!btn) return;
      setItemType(btn.dataset.type);
    });

    $('itemForm').addEventListener('submit', onItemSubmit);
    $('boardForm').addEventListener('submit', onBoardSubmit);
    $('settingsForm').addEventListener('submit', onSettingsSubmit);
    $('archiveBoardBtn').addEventListener('click', archiveActiveBoard);
    $('renameBoardBtn').addEventListener('click', renameActiveBoard);
    $('duplicateBoardBtn').addEventListener('click', duplicateActiveBoard);
    $('deleteBoardBtn').addEventListener('click', deleteActiveBoard);
    $('fullscreenBoardSettingsBtn').addEventListener('click', () => { $('settingsDialog').close(); enterBoardFullscreen(); });
    $('exportBoardBtn').addEventListener('click', () => BulletinIO.exportBoard(state, state.activeBoardId));
    $('exportAllBtn').addEventListener('click', () => BulletinIO.exportArchive(state));
    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', onImportFile);
    $('inspectorBody').addEventListener('input', onInspectorInput);
    $('inspectorBody').addEventListener('change', onInspectorChange);
    $('inspectorBody').addEventListener('click', onInspectorClick);

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !fullscreenFallback) cleanupFullscreenUI();
    });

    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        commit('Saved');
      }
      if (event.key === 'Escape' && fullscreenFallback) {
        event.preventDefault();
        exitBoardFullscreen();
      } else if (event.key === 'Escape' && selectedPlacementId) selectPlacement(null);
    });
  }

  function activeBoard() { return state.boards[state.activeBoardId]; }

  function render() {
    const board = activeBoard();
    BulletinRender.renderBoardList(state, state.activeBoardId);
    $('inboxCount').textContent = Object.values(state.items).filter(i => i.inbox && !i.archived).length;
    $('allCount').textContent = Object.values(state.items).filter(i => !i.archived).length;
    $('searchInput').value = state.search || '';
    $('arrangeModeBtn').textContent = `Arrange: ${state.arrangeMode ? 'on' : 'off'}`;
    $('arrangeModeBtn').setAttribute('aria-pressed', String(Boolean(state.arrangeMode)));
    $('zoomLabel').textContent = `${Math.round((state.zoom || 1) * 100)}%`;

    if (libraryMode) {
      $('boardEyebrow').textContent = 'LIBRARY';
      $('boardTitleButton').textContent = libraryTitle(libraryMode);
      $('boardTitleButton').disabled = true;
      document.querySelector('.view-switcher').classList.add('disabled');
      $('boardSettingsBtn').disabled = true;
      $('fullscreenBoardBtn').disabled = true;
      BulletinRender.renderLibraryCollection(state, libraryMode, state.search || '');
      $('emptyState').hidden = true;
      $('boardViewport').hidden = true;
      BulletinRender.renderInspector(state, null);
      return;
    }

    if (!board) return;
    $('boardEyebrow').textContent = board.private ? 'PRIVATE BOARD' : 'BOARD';
    $('boardTitleButton').textContent = board.title;
    $('boardTitleButton').disabled = false;
    document.querySelector('.view-switcher').classList.remove('disabled');
    $('boardSettingsBtn').disabled = false;
    $('fullscreenBoardBtn').disabled = false;
    document.querySelectorAll('.view-button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === board.view));
    renderBoardContent();
    BulletinRender.renderInspector(state, selectedPlacementId);
  }

  function renderBoardContent() {
    if (libraryMode) {
      BulletinRender.renderLibraryCollection(state, libraryMode, state.search || '');
      return;
    }
    const board = activeBoard();
    if (!board) return;
    let placements = BulletinModel.placementsForBoard(state, board.id);
    placements = placements.filter(p => BulletinModel.matchesSearch(state.items[p.itemId], state.search || ''));
    const empty = BulletinModel.placementsForBoard(state, board.id).length === 0;
    $('emptyState').hidden = !empty;
    if (empty) {
      $('boardViewport').hidden = false;
      $('structuredView').hidden = true;
      $('boardSurface').innerHTML = '';
      return;
    }
    if (board.view === 'freeform') {
      $('boardViewport').hidden = false;
      $('structuredView').hidden = true;
      BulletinRender.renderFreeform(state, board, placements, selectedPlacementId);
    } else {
      $('boardViewport').hidden = true;
      $('structuredView').hidden = false;
      BulletinRender.renderStructured(state, board, placements, board.view);
    }
  }

  function libraryTitle(mode) {
    return ({ inbox: 'Clipping basket', all: 'All items', favorites: 'Favorites', archive: 'Archive' })[mode] || 'Library';
  }

  function setItemType(type) {
    $('itemType').value = type;
    document.querySelectorAll('.type-button').forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
    document.querySelectorAll('[data-for-type]').forEach(field => {
      const visible = field.dataset.forType.split(/\s+/).includes(type);
      field.hidden = !visible;
    });
    const file = $('itemFile');
    if (type === 'image') file.accept = 'image/*';
    else if (type === 'file') file.accept = 'image/*,video/*,audio/*,.pdf,.txt,.md,.doc,.docx';
  }

  function openItemDialog() {
    populateItemBoardPicker();
    $('itemForm').reset();
    setItemType('note');
    populateItemBoardPicker();
    $('itemDialog').showModal();
    setTimeout(() => $('itemTitle').focus(), 20);
  }

  function populateItemBoardPicker() {
    const current = state.activeBoardId;
    $('itemBoardPicker').innerHTML = Object.values(state.boards).filter(b => !b.archived).map(board =>
      `<label class="check-field compact"><input type="checkbox" name="targetBoard" value="${board.id}" ${board.id===current && !libraryMode ? 'checked' : ''}> ${BulletinRender.escapeHTML(board.title)}</label>`
    ).join('');
  }

  async function onItemSubmit(event) {
    event.preventDefault();
    const submitter = event.submitter;
    if (submitter?.value === 'cancel') { $('itemDialog').close(); return; }
    const type = $('itemType').value;
    let asset = null;
    const file = $('itemFile').files?.[0];
    if (file) asset = await fileToAsset(file);
    const item = BulletinModel.createItem(state, {
      type,
      title: $('itemTitle').value,
      url: $('itemUrl').value,
      body: $('itemBody').value,
      tags: $('itemTags').value,
      whySaved: $('whySaved').value,
      alt: $('itemAlt').value,
      eventDate: $('eventDate').value,
      eventLocation: $('eventLocation').value,
      asset
    });
    const boardIds = [...document.querySelectorAll('input[name="targetBoard"]:checked')].map(n => n.value);
    boardIds.forEach(boardId => {
      const placement = BulletinModel.createPlacement(state, item.id, boardId);
      if (type === 'note') { placement.style='note';placement.noteColor=BulletinPostitColors.valid($('itemNoteColor')?.value); }
    });
    item.inbox = boardIds.length === 0;
    if (boardIds.length) state.activeBoardId = boardIds[0];
    libraryMode = boardIds.length ? null : 'inbox';
    $('itemDialog').close();
    render();
    commit(boardIds.length ? 'Scrap saved to board' : 'Scrap saved to clipping basket');
  }

  function fileToAsset(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
        resolve({ name: file.name, type: file.type, size: file.size, kind, dataUrl: reader.result });
      };
      reader.readAsDataURL(file);
    });
  }

  function openBoardDialog() {
    $('boardForm').reset();
    $('newBoardPrivate').checked = true;
    $('boardDialog').showModal();
    setTimeout(() => $('newBoardName').focus(), 20);
  }

  function onBoardSubmit(event) {
    event.preventDefault();
    if (event.submitter?.value === 'cancel') { $('boardDialog').close(); return; }
    BulletinModel.createBoard(state, {
      title: $('newBoardName').value,
      theme: $('newBoardTheme').value,
      view: $('newBoardView').value,
      private: $('newBoardPrivate').checked
    });
    libraryMode = null;
    selectedPlacementId = null;
    $('boardDialog').close();
    render();
    commit('Board created');
  }

  function openSettingsDialog() {
    const board = activeBoard();
    if (!board) return;
    $('settingsTheme').value = board.theme || 'paper';
    $('settingsSnap').checked = Boolean(board.snap);
    $('settingsPrivate').checked = board.private !== false;
    $('settingsDialog').showModal();
  }

  function onSettingsSubmit(event) {
    event.preventDefault();
    if (event.submitter?.value === 'cancel') { $('settingsDialog').close(); return; }
    const board = activeBoard();
    if (!board) return;
    board.theme = $('settingsTheme').value;
    board.snap = $('settingsSnap').checked;
    board.private = $('settingsPrivate').checked;
    board.updatedAt = BulletinModel.now();
    $('settingsDialog').close();
    render();
    commit('Board settings saved');
  }

  function archiveActiveBoard() {
    const board = activeBoard();
    if (!board) return;
    if (!confirm(`Archive “${board.title}”? Its scraps stay in the archive and All Items.`)) return;
    board.archived = true;
    const next = Object.values(state.boards).find(b => !b.archived && b.id !== board.id);
    if (next) state.activeBoardId = next.id;
    else BulletinModel.createBoard(state, { title: 'My Bulletin', theme: 'paper', view: 'freeform', private: true });
    $('settingsDialog').close();
    selectedPlacementId = null;
    render();
    commit('Board archived');
  }

  function renameActiveBoard() {
    const board = activeBoard();
    if (!board || libraryMode) return;
    const name = prompt('Rename board:', board.title);
    if (!name?.trim()) return;
    board.title = name.trim().slice(0,80);
    board.updatedAt = BulletinModel.now();
    render();
    commit('Board renamed');
  }

  function duplicateActiveBoard() {
    const board = activeBoard();
    if (!board || libraryMode) return;
    const copy = BulletinModel.duplicateBoard(state, board.id);
    if (!copy) return;
    libraryMode = null;
    selectedPlacementId = null;
    $('settingsDialog').close();
    render();
    commit(`Duplicated board as “${copy.title}”`);
  }

  function deleteActiveBoard() {
    const board = activeBoard();
    if (!board || libraryMode) return;
    const count = BulletinModel.placementsForBoard(state, board.id).length;
    const message = `Delete board “${board.title}”?\n\n${count} pin${count===1?'':'s'} will be removed from this board. Items that are not used on another board will return to the Clipping Basket.`;
    if (!confirm(message)) return;
    exitBoardFullscreen();
    BulletinModel.deleteBoard(state, board.id);
    libraryMode = null;
    selectedPlacementId = null;
    $('settingsDialog').close();
    render();
    commit('Board deleted');
  }

  async function enterBoardFullscreen() {
    if (libraryMode || !activeBoard()) return;
    const workspace = $('workspace');
    workspace.classList.add('fullscreen-board');
    $('fullscreenExitBtn').hidden = false;
    try {
      if (workspace.requestFullscreen && !document.fullscreenElement) {
        await workspace.requestFullscreen();
        fullscreenFallback = false;
      } else if (!document.fullscreenElement) {
        throw new Error('Fullscreen API unavailable');
      }
    } catch (_) {
      fullscreenFallback = true;
      $('appShell').classList.add('board-fullscreen-fallback');
    }
  }

  async function exitBoardFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    fullscreenFallback = false;
    cleanupFullscreenUI();
  }

  function cleanupFullscreenUI() {
    $('appShell').classList.remove('board-fullscreen-fallback');
    $('workspace').classList.remove('fullscreen-board');
    $('fullscreenExitBtn').hidden = true;
  }

  function toggleArrangeMode() {
    state.arrangeMode = !state.arrangeMode;
    render();
    commit(state.arrangeMode ? 'Arrange mode on' : 'Arrange mode off');
  }

  function setZoom(value) {
    state.zoom = BulletinModel.clamp(Math.round(value * 10) / 10, .4, 2);
    renderBoardContent();
    $('zoomLabel').textContent = `${Math.round(state.zoom * 100)}%`;
    commit('Zoom changed', { silent: true });
  }

  function selectPlacement(id, options) {
    selectedPlacementId = id && state.placements[id] ? id : null;
    if (options?.render === false) {
      BulletinRender.renderInspector(state, selectedPlacementId);
      document.querySelectorAll('.scrap-card').forEach(el => el.classList.toggle('selected', el.dataset.placementId === selectedPlacementId));
      return;
    }
    render();
  }

  function nudgePlacement(id, dx, dy) {
    const p = state.placements[id];
    if (!p || p.locked) return;
    p.x = Math.max(0, p.x + dx);
    p.y = Math.max(0, p.y + dy);
    p.updatedAt = BulletinModel.now();
    selectedPlacementId = id;
    render();
    commit('Moved scrap');
  }

  function onInspectorInput(event) {
    const p = selectedPlacementId ? state.placements[selectedPlacementId] : null;
    const item = p ? state.items[p.itemId] : null;
    if (!p || !item) return;
    const itemField = event.target.dataset.editItem;
    const placementField = event.target.dataset.editPlacement;
    if (itemField) {
      if (itemField === 'tags') item.tags = BulletinModel.normalizeTags(event.target.value);
      else if (itemField === 'favorite') item.favorite = event.target.checked;
      else item[itemField] = event.target.value;
      item.updatedAt = BulletinModel.now();
      debouncedCommit('Item updated');
    }
    if (placementField) {
      p[placementField] = placementField === 'locked' ? event.target.checked : event.target.value;
      p.updatedAt = BulletinModel.now();
      debouncedCommit('Placement updated');
    }
  }

  function onInspectorChange(event) {
    const p = selectedPlacementId ? state.placements[selectedPlacementId] : null;
    if (!p) return;
    if (event.target.dataset.boardConnect) {
      const boardId = event.target.dataset.boardConnect;
      if (event.target.checked) {
        BulletinModel.createPlacement(state, p.itemId, boardId);
      } else {
        const target = Object.values(state.placements).find(x => x.itemId === p.itemId && x.boardId === boardId);
        if (target) {
          const removingSelected = target.id === selectedPlacementId;
          BulletinModel.removePlacement(state, target.id);
          if (removingSelected) selectedPlacementId = null;
        }
      }
      render();
      commit('Board connections updated');
      return;
    }
    onInspectorInput(event);
    renderBoardContent();
  }

  function onInspectorClick(event) {
    const target = event.target.closest('[data-nudge],[data-rotate],[data-size],[data-layer],[data-action]');
    if (!target || !selectedPlacementId) return;
    const p = state.placements[selectedPlacementId];
    if (!p) return;
    if (target.dataset.nudge) {
      const amount = 10;
      const map = { up:[0,-amount], down:[0,amount], left:[-amount,0], right:[amount,0] };
      const [dx,dy] = map[target.dataset.nudge];
      nudgePlacement(p.id,dx,dy);
      return;
    }
    if (target.dataset.rotate) {
      p.rotation = (p.rotation || 0) + Number(target.dataset.rotate);
      render(); commit('Rotated scrap'); return;
    }
    if (target.dataset.size) {
      const factor = target.dataset.size === 'larger' ? 1.1 : .9;
      p.width = Math.round(BulletinModel.clamp(p.width * factor, 180, 720));
      p.height = Math.round(BulletinModel.clamp(p.height * factor, 120, 800));
      render(); commit('Resized scrap'); return;
    }
    if (target.dataset.layer) {
      const all = BulletinModel.placementsForBoard(state,p.boardId).map(x => x.z || 0);
      p.z = target.dataset.layer === 'front' ? Math.max(...all,0)+1 : Math.min(...all,0)-1;
      render(); commit('Layer changed'); return;
    }
    if (target.dataset.action === 'copy-pin') {
      const boardId = $('copyPinBoardSelect')?.value;
      if (!boardId) return;
      const existing = Object.values(state.placements).find(x => x.itemId === p.itemId && x.boardId === boardId);
      if (existing) { toast('That pin is already on the selected board'); return; }
      BulletinModel.copyPlacementToBoard(state, p.id, boardId);
      render(); commit('Pin copied to another board'); return;
    }
    if (target.dataset.action === 'delete-pin' || target.dataset.action === 'remove-placement') {
      const item = state.items[p.itemId];
      if (!confirm(`Delete the pin “${item?.title || 'Untitled'}” from this board? The saved item will remain available on any other boards.`)) return;
      BulletinModel.removePlacement(state,p.id);
      selectedPlacementId = null;
      render(); commit('Pin deleted from this board'); return;
    }
    if (target.dataset.action === 'delete-item') {
      const item = state.items[p.itemId];
      const boards = BulletinModel.boardsForItem(state,item.id);
      if (!confirm(`Delete “${item.title}” everywhere? It is used on ${boards.length} board${boards.length===1?'':'s'}.`)) return;
      BulletinModel.deleteItemEverywhere(state,item.id);
      selectedPlacementId = null;
      render(); commit('Item deleted everywhere');
    }
  }

  function placeItemOnCurrentBoard(itemId) {
    const board = activeBoard();
    if (!board) return;
    BulletinModel.createPlacement(state,itemId,board.id);
    state.items[itemId].inbox = false;
    libraryMode = null;
    selectedPlacementId = null;
    render();
    commit('Added item to current board');
  }

  function toggleFavorite(itemId) {
    const item = state.items[itemId];
    if (!item) return;
    item.favorite = !item.favorite;
    item.updatedAt = BulletinModel.now();
    render(); commit(item.favorite ? 'Added to favorites' : 'Removed from favorites');
  }

  async function onImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = await BulletinIO.readJSONFile(file);
      state = BulletinIO.importPayload(state,payload);
      libraryMode = null;
      selectedPlacementId = null;
      render();
      await commit('Import complete');
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      event.target.value = '';
    }
  }

  function debouncedCommit(message) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { renderBoardContent(); commit(message,{silent:true}); }, 350);
  }

  async function commit(message, options) {
    state.updatedAt = BulletinModel.now();
    const status = $('storageStatus');
    if (status) status.textContent = 'Saving locally…';
    const ok = await BulletinStorage.setState(state);
    if (status) status.textContent = ok ? 'Saved locally' : 'Save problem — export a backup';
    if (!options?.silent) toast(message || (ok ? 'Saved' : 'Could not save'));
  }

  function toast(message) {
    if (!message) return;
    const node = $('toastTemplate').content.firstElementChild.cloneNode(true);
    node.textContent = message;
    $('toastRegion').appendChild(node);
    setTimeout(() => node.classList.add('show'), 20);
    setTimeout(() => { node.classList.remove('show'); setTimeout(() => node.remove(),250); }, 2200);
  }

  window.BulletinApp = {
    getState: () => state,
    selectPlacement,
    nudgePlacement,
    placeItemOnCurrentBoard,
    toggleFavorite,
    commit,
    render
  };

  document.addEventListener('DOMContentLoaded', init);
})();

