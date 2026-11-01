
(function () {
  'use strict';

  let drag = null;

  function bindWorkspace() {
    const surface = document.getElementById('boardSurface');
    const structured = document.getElementById('structuredView');

    surface.addEventListener('pointerdown', onPointerDown);
    surface.addEventListener('click', onSurfaceClick);
    surface.addEventListener('keydown', onCardKeydown);
    structured.addEventListener('click', onStructuredClick);
    structured.addEventListener('keydown', onStructuredKeydown);

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function placementCard(target) {
    return target.closest?.('[data-placement-id]');
  }

  function onSurfaceClick(event) {
    const action = event.target.closest?.('[data-action="inspect"]');
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      const card = placementCard(action);
      if (card) BulletinApp.selectPlacement(card.dataset.placementId);
      return;
    }
    const card = placementCard(event.target);
    if (card) BulletinApp.selectPlacement(card.dataset.placementId);
  }

  function onPointerDown(event) {
    const card = placementCard(event.target);
    if (!card) return;
    BulletinApp.selectPlacement(card.dataset.placementId, { render: false });
    if (!BulletinApp.getState().arrangeMode) return;
    if (event.target.closest?.('[data-no-drag="true"],a,button,input,textarea,select')) return;

    const placement = BulletinApp.getState().placements[card.dataset.placementId];
    if (!placement || placement.locked) return;

    event.preventDefault();
    card.setPointerCapture?.(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      placementId: placement.id,
      startX: event.clientX,
      startY: event.clientY,
      x: placement.x,
      y: placement.y
    };
    card.classList.add('dragging');
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const state = BulletinApp.getState();
    const p = state.placements[drag.placementId];
    if (!p) return;
    const zoom = state.zoom || 1;
    let x = drag.x + (event.clientX - drag.startX) / zoom;
    let y = drag.y + (event.clientY - drag.startY) / zoom;
    const board = state.boards[p.boardId];
    if (board?.snap) {
      x = Math.round(x / 10) * 10;
      y = Math.round(y / 10) * 10;
    }
    p.x = Math.max(0, Math.round(x));
    p.y = Math.max(0, Math.round(y));
    p.updatedAt = BulletinModel.now();
    const el = document.querySelector(`[data-placement-id="${CSS.escape(p.id)}"]`);
    if (el) {
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
    }
  }

  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const el = document.querySelector(`[data-placement-id="${CSS.escape(drag.placementId)}"]`);
    if (el) el.classList.remove('dragging');
    drag = null;
    BulletinApp.commit('Moved scrap');
  }

  function onCardKeydown(event) {
    const card = placementCard(event.target);
    if (!card) return;
    const id = card.dataset.placementId;
    if (event.key === 'Enter') {
      event.preventDefault();
      BulletinApp.selectPlacement(id);
      return;
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key) && (event.altKey || BulletinApp.getState().arrangeMode)) {
      event.preventDefault();
      const amount = event.shiftKey ? 20 : 5;
      const dx = event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0;
      const dy = event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0;
      BulletinApp.nudgePlacement(id, dx, dy);
    }
  }

  function onStructuredClick(event) {
    const action = event.target.closest?.('[data-action]');
    if (action?.dataset.action === 'place-current') {
      BulletinApp.placeItemOnCurrentBoard(action.dataset.itemId);
      return;
    }
    if (action?.dataset.action === 'toggle-favorite') {
      BulletinApp.toggleFavorite(action.dataset.itemId);
      return;
    }
    const pNode = placementCard(event.target);
    if (pNode) BulletinApp.selectPlacement(pNode.dataset.placementId);
  }

  function onStructuredKeydown(event) {
    if (event.key !== 'Enter') return;
    const pNode = placementCard(event.target);
    if (pNode) {
      event.preventDefault();
      BulletinApp.selectPlacement(pNode.dataset.placementId);
    }
  }

  window.BulletinInteractions = { bindWorkspace };
})();

