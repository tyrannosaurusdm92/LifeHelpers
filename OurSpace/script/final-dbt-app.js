(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const metaNode = $("#pairing-data");
  const META = metaNode ? JSON.parse(metaNode.textContent) : {};
  const embedded = window.parent !== window;
  const notifyBook = data => {
    if (embedded) window.parent.postMessage(data, location.protocol === "file:" ? "*" : location.origin);
  };
  const STORAGE = {
    get(key, fallback = null) {
      try { const value = localStorage.getItem(key); return value === null ? fallback : value; }
      catch (_) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; }
      catch (_) { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); return true; }
      catch (_) { return false; }
    }
  };

  const pageState = { current: "handouts" };
  const master = $("#masterNav");
  const masterCurrent = $("#masterCurrent");
  const masterToggle = $("#masterToggle");
  const routes = $$("[data-page-route]");

  function showPage(page, updateHash = true) {
    const target = $("#page-" + page);
    if (!target) return;
    pageState.current = page;
    $$(".site-page").forEach(node => node.classList.toggle("is-active", node === target));
    routes.forEach(node => node.classList.toggle("is-current", node.dataset.pageRoute === page));
    if (masterCurrent) masterCurrent.textContent = page === "handouts" ? "01 · Handouts" : "02 · Worksheets";
    $$(".jump-nav").forEach(node => node.classList.remove("open"));
    if (updateHash) history.replaceState(null, "", "#" + page);
    notifyBook({type: "dbt:pair-view", pairId: META.id, view: page});
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (page === "worksheets") setTimeout(() => window.dispatchEvent(new Event("dbt:worksheets-visible")), 0);
    if (page === "handouts") setTimeout(() => growVisible(), 0);
  }

  routes.forEach(button => button.addEventListener("click", () => showPage(button.dataset.pageRoute)));
  const initialPage = location.hash === "#worksheets" ? "worksheets" : "handouts";
  showPage(initialPage, false);

  const routeSearch = $("#routeSearch");
  routeSearch?.addEventListener("input", () => {
    const query = routeSearch.value.trim().toLowerCase();
    $$(".master-panel .page-route").forEach(button => {
      button.hidden = !!query && !button.textContent.toLowerCase().includes(query);
    });
  });

  const modeSelect = $("#modeSelect");
  const savedMode = STORAGE.get("ourspace.colorMode.v1", STORAGE.get("dbtPair.ui.mode", "light"));
  document.documentElement.dataset.mode = savedMode === "dark" ? "dark" : "light";
  document.documentElement.dataset.colorMode = document.documentElement.dataset.mode;
  if (modeSelect) modeSelect.value = document.documentElement.dataset.mode;
  function applyMode(mode, tellBook = false) {
    mode = mode === "dark" ? "dark" : "light";
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.colorMode = mode;
    if (modeSelect) modeSelect.value = mode;
    STORAGE.set("dbtPair.ui.mode", mode);
    STORAGE.set("ourspace.colorMode.v1", mode);
    if (tellBook) notifyBook({type: "dbt:mode", mode});
  }
  modeSelect?.addEventListener("change", () => applyMode(modeSelect.value, true));
  window.addEventListener("storage", event => {
    if ((event.key === "dbtPair.ui.mode" || event.key === "ourspace.colorMode.v1") && ["light", "dark"].includes(event.newValue) && event.newValue !== document.documentElement.dataset.mode) applyMode(event.newValue, true);
  });
  window.addEventListener("message", event => {
    if (!embedded || event.source !== window.parent || (location.protocol !== "file:" && event.origin !== location.origin)) return;
    const data = event.data;
    if (data?.type === "dbt:mode" && ["light", "dark"].includes(data.mode)) applyMode(data.mode);
    if (data?.type === "dbt:view" && ["handouts", "worksheets"].includes(data.view) && data.view !== pageState.current) showPage(data.view);
  });
  $$('a[data-hub-pair]').forEach(link => link.addEventListener("click", event => {
    if (!embedded || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    notifyBook({type: "dbt:open-pair", pairId: link.dataset.hubPair, view: pageState.current});
  }));

  function setMasterCollapsed(collapsed) {
    if (!master) return;
    master.classList.toggle("collapsed", collapsed);
    if (masterToggle) {
      masterToggle.textContent = collapsed ? "☰" : "−";
      masterToggle.title = collapsed ? "Drag to move · click to expand" : "Drag to move · click to collapse";
      masterToggle.setAttribute("aria-expanded", String(!collapsed));
    }
    STORAGE.set("dbtPair.ui.masterCollapsed", collapsed ? "1" : "0");
  }
  setMasterCollapsed(STORAGE.get("dbtPair.ui.masterCollapsed", "1") === "1");

  function wireDrag(element, handle, key, onClick) {
    if (!element || !handle) return () => {};
    let active = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    const saved = STORAGE.get(key);
    if (saved) {
      try {
        const position = JSON.parse(saved);
        element.style.left = position.x + "px";
        element.style.top = position.y + "px";
        element.style.right = "auto";
      } catch (_) {}
    }
    handle.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      active = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      const rect = element.getBoundingClientRect();
      baseX = rect.left;
      baseY = rect.top;
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", event => {
      if (!active) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (!moved) return;
      const x = Math.max(4, Math.min(innerWidth - element.offsetWidth - 4, baseX + dx));
      const y = Math.max(4, Math.min(innerHeight - element.offsetHeight - 4, baseY + dy));
      element.style.left = x + "px";
      element.style.top = y + "px";
      element.style.right = "auto";
    });
    handle.addEventListener("pointerup", event => {
      if (!active) return;
      active = false;
      try { handle.releasePointerCapture(event.pointerId); } catch (_) {}
      if (moved) {
        const rect = element.getBoundingClientRect();
        STORAGE.set(key, JSON.stringify({ x: rect.left, y: rect.top }));
      } else if (onClick) {
        onClick();
      }
    });
    return () => {
      STORAGE.remove(key);
      element.style.left = "";
      element.style.top = "";
      element.style.right = "";
    };
  }

  const resetMasterFromHandle = wireDrag(master, $("#masterHandle"), "dbtPair.ui.masterPosition");
  const resetMasterFromToggle = wireDrag(master, masterToggle, "dbtPair.ui.masterPosition", () => setMasterCollapsed(!master.classList.contains("collapsed")));
  $("#resetMasterNav")?.addEventListener("click", () => {
    resetMasterFromHandle();
    resetMasterFromToggle();
    setMasterCollapsed(false);
  });

  const jumpResets = [];
  $$(".jump-nav").forEach(jump => {
    const orb = $(".jump-orb", jump);
    const page = jump.dataset.jumpNav;
    jumpResets.push(wireDrag(jump, orb, "dbtPair.ui.jumpPosition." + page, () => {
      jump.classList.toggle("open");
      orb.setAttribute('aria-expanded', String(jump.classList.contains('open')));
    }));
  });
  $("#resetJumpNav")?.addEventListener("click", () => jumpResets.forEach(reset => reset()));
  $$(".jump-link[data-target]").forEach(button => button.addEventListener("click", () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({behavior:"smooth",block:"start"});
    const jump = button.closest('.jump-nav');
    jump?.classList.remove('open');
    $('.jump-orb',jump)?.setAttribute('aria-expanded','false');
  }));

  // Keyboard activation complements the pointer drag behavior.
  masterToggle?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setMasterCollapsed(!master.classList.contains('collapsed'));
    }
  });
  $$('.jump-orb').forEach(orb => orb.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const jump = orb.closest('.jump-nav');
      jump.classList.toggle('open');
      orb.setAttribute('aria-expanded', String(jump.classList.contains('open')));
    }
  }));
  function width(value) {
    const size = Math.max(667, Math.min(1288, Number(value) || 977.5));
    document.documentElement.style.setProperty('--page-width', size + 'px');
    $$('[data-zoom]').forEach(el => { el.value = size; });
    STORAGE.set('dbtPair.ui.pageWidth', String(size));
  }
  const widthVersion = 'centered-theme-visual-pass-2';
  $('[data-zoom]').forEach(el => { el.min = '667'; el.max = '1288'; });
  const savedWidth = Number(STORAGE.get('dbtPair.ui.pageWidth', '850')) || 850;
  const storedWidthVersion = STORAGE.get('dbtPair.ui.pageWidth.scale', '');
  if (storedWidthVersion !== widthVersion) {
    width(savedWidth * 1.15);
    STORAGE.set('dbtPair.ui.pageWidth.scale', widthVersion);
  } else width(savedWidth);
  $$('[data-zoom]').forEach(el => el.addEventListener('input', () => width(el.value)));

  const forms = $$('form[data-dbt-worksheet]');
  const status = (root, message, error = false) => {
    const node = $('.save-status', root);
    if (node) { node.textContent = message; node.classList.toggle('save-error', error); }
  };
  const controls = root => $$('[data-dbt-key]', root).filter(el => el.matches('input,textarea,select'));
  forms.forEach(root => {
    root.addEventListener('submit', event => event.preventDefault());
    root.addEventListener('dbt:answers-saved', () => status(root, 'Saved on this device'));
    root.addEventListener('dbt:save-error', () => status(root, 'Device saving is unavailable. Download your answers to keep a copy.', true));
    root.addEventListener('input', event => {
      if (event.target.closest('[data-dbt-no-save]')) return;
      status(root, 'Saving…');
    });
    $('[data-save-answers]', root)?.addEventListener('click', () => {
      const ok = window.DBTWorksheetEntry.save(root);
      status(root, ok ? 'Saved on this device' : 'Device saving is unavailable. Download your answers to keep a copy.', !ok);
    });
    $('[data-export-answers]', root)?.addEventListener('click', () => {
      window.DBTWorksheetEntry.save(root);
      const fields = Object.fromEntries(controls(root).map(el => [el.dataset.dbtKey,
        ['checkbox','radio'].includes(el.type) ? el.checked : el.value]));
      const payload = {format:'dbt-native-answers',version:1,pairId:META.id,view:root.id,createdAt:new Date().toISOString(),fields};
      const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = META.id + '-' + root.id + '-answers.json';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url),1000);
      status(root,'Answer backup downloaded');
    });
    $('[data-import-answers]', root)?.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > 5 * 1024 * 1024) throw new Error('This answer file is too large.');
        const data = JSON.parse(await file.text());
        if (data.format !== 'dbt-native-answers' || data.version !== 1 || data.pairId !== META.id || data.view !== root.id || !data.fields || typeof data.fields !== 'object' || Array.isArray(data.fields))
          throw new Error('Choose an answer backup for this pairing and view.');
        const items = controls(root);
        // Validate the whole backup before changing any value.
        for (const el of items) {
          const value = data.fields[el.dataset.dbtKey];
          if (value === undefined) continue;
          if (['checkbox','radio'].includes(el.type) ? typeof value !== 'boolean' : typeof value !== 'string')
            throw new Error('The answer backup contains an invalid field.');
        }
        for (const el of items) {
          const value = data.fields[el.dataset.dbtKey];
          if (value === undefined) continue;
          if (['checkbox','radio'].includes(el.type)) el.checked = value;
          else el.value = value;
          el.dispatchEvent(new Event('input',{bubbles:true}));
          el.dispatchEvent(new Event('change',{bubbles:true}));
        }
        const ok = window.DBTWorksheetEntry.save(root);
        status(root, ok ? 'Answers imported and saved' : 'Answers imported. Device saving is unavailable.', !ok);
      } catch (error) { status(root,error.message || 'Unable to import this answer file.',true); }
      event.target.value = '';
    });
  });
  function growVisible() {
    window.DBTWorksheetEntry?.refresh();
    const active = $('#page-' + pageState.current);
    $$('textarea',active).forEach(el => {
      el.style.height = 'auto';
      el.style.height = Math.max(78, el.scrollHeight) + 'px';
    });
  }
  function updateDimes() {
    ['asking','saying no'].forEach(bank => {
      const total = $$('input[data-dime-bank]').filter(el => el.dataset.dimeBank === bank && el.checked).length * 10;
      const out = $$('[data-dime-total]').find(el => el.dataset.dimeTotal === bank);
      if (out) out.value = total === 100 ? '$1.00' : total + '¢';
    });
  }
  document.addEventListener('change', updateDimes);
  updateDimes();
  window.addEventListener('dbt:worksheets-visible', growVisible);
  window.addEventListener('hashchange', () => {
    if (['#handouts','#worksheets'].includes(location.hash)) showPage(location.hash.slice(1),false);
  });
  growVisible();
  notifyBook({type:'dbt:pair-ready',pairId:META.id,view:pageState.current});
})();
