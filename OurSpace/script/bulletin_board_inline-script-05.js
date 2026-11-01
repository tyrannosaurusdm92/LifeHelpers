
(function () {
  'use strict';

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportArchive(state) {
    const payload = {
      format: 'Bulletin Archive',
      schemaVersion: BulletinModel.VERSION,
      exportedAt: new Date().toISOString(),
      state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `bulletin-archive-${new Date().toISOString().slice(0,10)}.json`);
  }

  function exportBoard(state, boardId) {
    const board = state.boards[boardId];
    if (!board) return;
    const placements = Object.values(state.placements).filter(p => p.boardId === boardId);
    const itemIds = [...new Set(placements.map(p => p.itemId))];
    const items = Object.fromEntries(itemIds.filter(id => state.items[id]).map(id => [id, state.items[id]]));
    const placementMap = Object.fromEntries(placements.map(p => [p.id, p]));
    const payload = {
      format: 'Bulletin Board',
      schemaVersion: BulletinModel.VERSION,
      exportedAt: new Date().toISOString(),
      board,
      items,
      placements: placementMap
    };
    const safe = board.title.replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() || 'board';
    downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}), `${safe}-bulletin.json`);
  }

  async function readJSONFile(file) {
    const text = await file.text();
    return JSON.parse(text);
  }

  function importPayload(currentState, payload) {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid JSON backup.');
    if (payload.format === 'Bulletin Archive' && payload.state) {
      return BulletinModel.migrateState(payload.state);
    }
    if (payload.format === 'Bulletin Board' && payload.board && payload.items && payload.placements) {
      const state = currentState;
      let boardId = payload.board.id;
      if (state.boards[boardId]) boardId = BulletinModel.uid('board');
      state.boards[boardId] = Object.assign({}, payload.board, { id: boardId, title: `${payload.board.title} (imported)`, updatedAt: BulletinModel.now() });
      const itemMap = {};
      Object.values(payload.items).forEach(item => {
        let id = item.id;
        if (state.items[id]) id = BulletinModel.uid('item');
        itemMap[item.id] = id;
        state.items[id] = Object.assign({}, item, { id, updatedAt: BulletinModel.now() });
      });
      Object.values(payload.placements).forEach(p => {
        const id = BulletinModel.uid('place');
        state.placements[id] = Object.assign({}, p, { id, boardId, itemId: itemMap[p.itemId] || p.itemId, updatedAt: BulletinModel.now() });
      });
      state.activeBoardId = boardId;
      return state;
    }
    if (payload.boards && payload.items && payload.placements) return BulletinModel.migrateState(payload);
    throw new Error('This file does not look like a Bulletin archive or board export.');
  }

  window.BulletinIO = { exportArchive, exportBoard, readJSONFile, importPayload };
})();

