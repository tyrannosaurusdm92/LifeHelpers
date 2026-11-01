
(function () {
  'use strict';

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString([], { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined });
  }

  function typeIcon(type) {
    return ({ note:'✎', link:'↗', image:'▧', quote:'“', event:'◷', file:'▤' })[type] || '•';
  }

  function attachmentHTML(placement) {
    const a = placement.attachment || '';
    if (a === 'tape') return '<span class="attachment tape" aria-hidden="true"></span>';
    if (a === 'pin') return '<span class="attachment pin" aria-hidden="true"></span>';
    if (a === 'clip') return '<span class="attachment clip" aria-hidden="true">⌇</span>';
    return '';
  }

  function assetHTML(item, compact) {
    const asset = item.asset;
    if (!asset) return '';
    if (asset.kind === 'image' && asset.dataUrl) {
      return `<figure class="item-media ${compact ? 'compact' : ''}"><img src="${asset.dataUrl}" alt="${escapeHTML(item.alt || '')}"></figure>`;
    }
    if (asset.kind === 'video' && asset.dataUrl) {
      return `<div class="item-media"><video controls preload="metadata" src="${asset.dataUrl}"></video></div>`;
    }
    if (asset.kind === 'audio' && asset.dataUrl) {
      return `<div class="audio-card"><span aria-hidden="true">♪</span><audio controls preload="metadata" src="${asset.dataUrl}"></audio></div>`;
    }
    if (asset.name) {
      return `<div class="file-card"><span aria-hidden="true">▤</span><span>${escapeHTML(asset.name)}</span></div>`;
    }
    return '';
  }

  function cardContent(item, placement, options) {
    const opts = options || {};
    const source = item.source?.originalUrl ? `<a class="source-link" href="${escapeHTML(item.source.originalUrl)}" target="_blank" rel="noopener noreferrer" data-no-drag="true">${escapeHTML(item.source.domain || 'Open source')} ↗</a>` : '';
    const tags = (item.tags || []).map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('');
    const favorite = item.favorite ? '<span class="favorite-mark" title="Favorite" aria-label="Favorite">★</span>' : '';
    const eventMeta = item.event && (item.event.start || item.event.location)
      ? `<div class="event-meta">${item.event.start ? `<span>◷ ${escapeHTML(formatDate(item.event.start))}</span>` : ''}${item.event.location ? `<span>⌖ ${escapeHTML(item.event.location)}</span>` : ''}</div>` : '';
    const localCaption = placement?.localCaption ? `<p class="local-caption">${escapeHTML(placement.localCaption)}</p>` : '';
    return `
      <div class="card-type-row"><span>${typeIcon(item.type)} ${escapeHTML(item.type)}</span>${favorite}</div>
      ${assetHTML(item, opts.compact)}
      <h3>${escapeHTML(item.title)}</h3>
      ${item.body ? `<p class="item-body">${escapeHTML(item.body)}</p>` : ''}
      ${eventMeta}
      ${item.whySaved ? `<p class="why-saved"><strong>Why saved:</strong> ${escapeHTML(item.whySaved)}</p>` : ''}
      ${localCaption}
      ${tags ? `<div class="tag-row">${tags}</div>` : ''}
      ${source ? `<div class="source-row">${source}</div>` : ''}
    `;
  }

  function renderBoardList(state, activeBoardId) {
    const root = document.getElementById('boardList');
    const boards = Object.values(state.boards).filter(b => !b.archived).sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    root.innerHTML = boards.map(board => {
      const count = BulletinModel.placementsForBoard(state, board.id).length;
      return `<button class="board-list-item ${board.id === activeBoardId ? 'active' : ''}" data-board-id="${board.id}" type="button" role="listitem">
        <span class="board-swatch theme-${escapeHTML(board.theme)}" aria-hidden="true"></span>
        <span class="board-list-copy"><strong>${escapeHTML(board.title)}</strong><small>${count} ${count === 1 ? 'scrap' : 'scraps'}${board.private ? ' · private' : ''}</small></span>
      </button>`;
    }).join('');
  }

  function renderFreeform(state, board, placements, selectedPlacementId) {
    const surface = document.getElementById('boardSurface');
    surface.className = `board-surface theme-${board.theme || 'paper'} ${state.arrangeMode ? 'arrange-mode' : ''}`;
    surface.style.transform = `scale(${state.zoom || 1})`;
    surface.style.transformOrigin = 'top left';
    surface.innerHTML = placements.map(p => {
      const item = state.items[p.itemId];
      if (!item) return '';
      const selected = p.id === selectedPlacementId;
      return `<article class="scrap-card style-${escapeHTML(p.style || 'paper')} ${selected ? 'selected' : ''} ${p.locked ? 'locked' : ''}"
          data-placement-id="${p.id}" data-item-id="${item.id}" tabindex="0"
          aria-label="${escapeHTML(item.type)}: ${escapeHTML(item.title)}"
          style="left:${p.x}px;top:${p.y}px;width:${p.width}px;min-height:${p.height}px;transform:rotate(${p.rotation || 0}deg);z-index:${p.z || 1};${BulletinPostitColors.colorStyle(p)}">
        ${attachmentHTML(p)}
        <button class="card-menu-button" type="button" aria-label="Open item details" data-action="inspect" data-no-drag="true">•••</button>
        <div class="scrap-content">${cardContent(item, p)}</div>
        <span class="resize-handle" aria-hidden="true"></span>
      </article>`;
    }).join('');
  }

  function renderStructured(state, board, placements, view) {
    const root = document.getElementById('structuredView');
    const ordered = placements.slice().sort((a,b) => (a.z || 0) - (b.z || 0));
    if (view === 'journal') {
      ordered.sort((a,b) => (state.items[b.itemId]?.createdAt || '').localeCompare(state.items[a.itemId]?.createdAt || ''));
    }
    root.className = `structured-view view-${view}`;
    root.innerHTML = ordered.map(p => {
      const item = state.items[p.itemId];
      if (!item) return '';
      if (view === 'list') {
        return `<article class="reading-item" data-placement-id="${p.id}" tabindex="0">
          <div class="reading-icon" aria-hidden="true">${typeIcon(item.type)}</div>
          <div><p class="reading-meta">${escapeHTML(item.type)} · ${escapeHTML(formatDate(item.createdAt))}</p>${cardContent(item,p,{compact:true})}</div>
          <button class="button subtle" type="button" data-action="inspect" data-placement-id="${p.id}">Details</button>
        </article>`;
      }
      return `<article class="structured-card style-${escapeHTML(p.style || 'paper')}" style="${BulletinPostitColors.colorStyle(p)}" data-placement-id="${p.id}" tabindex="0">
        ${attachmentHTML(p)}
        <button class="card-menu-button" type="button" aria-label="Open item details" data-action="inspect" data-placement-id="${p.id}">•••</button>
        <div class="scrap-content">${cardContent(item,p,{compact:view==='grid'})}</div>
      </article>`;
    }).join('');
  }

  function renderInspector(state, placementId) {
    const inspector = document.getElementById('inspector');
    const body = document.getElementById('inspectorBody');
    const title = document.getElementById('inspectorTitle');
    const p = state.placements[placementId];
    if (!p) {
      inspector.setAttribute('aria-hidden','true');
      inspector.classList.remove('open');
      body.innerHTML = '';
      return;
    }
    const item = state.items[p.itemId];
    if (!item) return;
    title.textContent = item.title;
    inspector.dataset.selectedPlacementId = placementId;
    const boardChecks = Object.values(state.boards).filter(b => !b.archived).map(b => {
      const has = Object.values(state.placements).some(x => x.itemId === item.id && x.boardId === b.id);
      return `<label class="check-field compact"><input type="checkbox" data-board-connect="${b.id}" ${has ? 'checked' : ''}> ${escapeHTML(b.title)}</label>`;
    }).join('');
    const copyTargets = Object.values(state.boards).filter(b => !b.archived && b.id !== p.boardId).map(b =>
      `<option value="${b.id}">${escapeHTML(b.title)}</option>`
    ).join('');

    body.innerHTML = `
      <section class="inspector-section">
        <div class="inspector-type">${typeIcon(item.type)} ${escapeHTML(item.type)}</div>
        <label class="field">Title<input data-edit-item="title" type="text" value="${escapeHTML(item.title)}"></label>
        <label class="field">Text / note<textarea data-edit-item="body" rows="5">${escapeHTML(item.body || '')}</textarea></label>
        <label class="field">Why I saved this<input data-edit-item="whySaved" type="text" value="${escapeHTML(item.whySaved || '')}"></label>
        <label class="field">Tags<input data-edit-item="tags" type="text" value="${escapeHTML((item.tags || []).join(', '))}"></label>
        ${item.type === 'image' ? `<label class="field">Alt text<input data-edit-item="alt" type="text" value="${escapeHTML(item.alt || '')}"></label>` : ''}
        ${item.source?.originalUrl ? `<p class="source-detail"><strong>Source</strong><br><a href="${escapeHTML(item.source.originalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.source.originalUrl)}</a></p>` : ''}
        <label class="check-field"><input type="checkbox" data-edit-item="favorite" ${item.favorite ? 'checked' : ''}> Favorite</label>
      </section>

      <section class="inspector-section">
        <h3>Placement on this board</h3>
        <div class="button-grid three">
          <button class="button subtle" type="button" data-nudge="up">↑ Up</button>
          <button class="button subtle" type="button" data-nudge="left">← Left</button>
          <button class="button subtle" type="button" data-nudge="right">Right →</button>
          <button class="button subtle" type="button" data-nudge="down">↓ Down</button>
          <button class="button subtle" type="button" data-rotate="-5">↶ -5°</button>
          <button class="button subtle" type="button" data-rotate="5">+5° ↷</button>
        </div>
        <div class="button-grid two">
          <button class="button subtle" type="button" data-size="smaller">Smaller</button>
          <button class="button subtle" type="button" data-size="larger">Larger</button>
          <button class="button subtle" type="button" data-layer="back">Send back</button>
          <button class="button subtle" type="button" data-layer="front">Bring front</button>
        </div>
        <label class="field">Paper style
          <select data-edit-placement="style">
            ${['paper','note','clipping','photo','ticket','clean'].map(v => `<option value="${v}" ${p.style===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </label>
        <div class="bulletin-note-color-field" aria-label="Post-it note palette">
          <strong class="bulletin-palette-label">Post-it note color (${BulletinPostitColors.colors().length} choices)</strong>
          <span class="bulletin-palette-help">Selecting a swatch makes this scrap a Post-it, without changing its pins or placement.</span>
          <div class="bulletin-palette-caption">${BulletinPostitColors.colors().find(c=>c.hex===BulletinPostitColors.valid(p.noteColor))?.name || 'Pale Lemon'} · ${BulletinPostitColors.valid(p.noteColor)}</div>
          ${BulletinPostitColors.swatchesHtml(p.noteColor)}
        </div>
        <label class="field">Attachment
          <select data-edit-placement="attachment">
            ${['none','tape','pin','clip'].map(v => `<option value="${v}" ${(p.attachment||'none')===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </label>
        <label class="field">Board caption<input data-edit-placement="localCaption" type="text" value="${escapeHTML(p.localCaption || '')}"></label>
        <label class="check-field"><input type="checkbox" data-edit-placement="locked" ${p.locked ? 'checked' : ''}> Lock placement</label>
      </section>

      <section class="inspector-section">
        <h3>Copy pin to another board</h3>
        ${copyTargets ? `<div class="copy-pin-row"><select id="copyPinBoardSelect" aria-label="Choose destination board">${copyTargets}</select><button class="button subtle" type="button" data-action="copy-pin">Copy pin</button></div>` : `<p class="inspector-help">Create another board to copy this pin somewhere else.</p>`}
      </section>

      <section class="inspector-section">
        <h3>Boards using this item</h3>
        <div class="board-picker vertical">${boardChecks}</div>
      </section>

      <section class="inspector-section danger-zone">
        <button class="button danger-outline full" type="button" data-action="delete-pin">Delete pin from this board</button>
        <button class="button danger full" type="button" data-action="delete-item">Delete item everywhere</button>
      </section>`;

    inspector.setAttribute('aria-hidden','false');
    inspector.classList.add('open');
  }

  function renderLibraryCollection(state, mode, query) {
    const root = document.getElementById('structuredView');
    const surface = document.getElementById('boardViewport');
    surface.hidden = true;
    root.hidden = false;
    let items = Object.values(state.items);
    if (mode === 'inbox') items = items.filter(i => i.inbox && !i.archived);
    if (mode === 'favorites') items = items.filter(i => i.favorite && !i.archived);
    if (mode === 'archive') items = items.filter(i => i.archived);
    if (mode === 'all') items = items.filter(i => !i.archived);
    items = items.filter(i => BulletinModel.matchesSearch(i, query));
    items.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    root.className = 'structured-view view-library';
    root.innerHTML = items.length ? items.map(item => `<article class="library-item" data-item-id="${item.id}">
      <div class="library-item-icon" aria-hidden="true">${typeIcon(item.type)}</div>
      <div class="library-item-copy">${assetHTML(item,true)}<h3>${escapeHTML(item.title)}</h3>${item.body ? `<p>${escapeHTML(item.body)}</p>` : ''}<div class="tag-row">${(item.tags||[]).map(t=>`<span class="tag">#${escapeHTML(t)}</span>`).join('')}</div></div>
      <div class="library-item-actions"><button class="button subtle" type="button" data-action="place-current" data-item-id="${item.id}">Add to current board</button><button class="button subtle" type="button" data-action="toggle-favorite" data-item-id="${item.id}">${item.favorite?'★ Favorite':'☆ Favorite'}</button></div>
    </article>`).join('') : '<div class="empty-list"><h2>Nothing here yet.</h2><p>Your saved material will appear here.</p></div>';
  }

  window.BulletinRender = {
    escapeHTML, formatDate, renderBoardList, renderFreeform, renderStructured, renderInspector, renderLibraryCollection
  };
})();

