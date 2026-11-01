(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const book = JSON.parse($("#book-data").textContent);
  const pairs = book.pairings;
  const pairMap = new Map(pairs.map(pair => [pair.id, pair]));
  const chapterMap = new Map(book.chapters.map(chapter => [chapter.id, chapter]));
  const routeLabels = new Map([["contents", "00 · Book & contents"], ...book.chapters.map((chapter, i) => [chapter.id, `${String(i + 1).padStart(2, "0")} · ${chapter.title}`]), ["index", "06 · Pairing index"]]);
  const storage = {
    get(key, fallback = null) { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (_) {} }
  };
  const master = $("#masterNav");
  const toggle = $("#masterToggle");
  const jump = $("#bookJump");
  const orb = $(".jump-orb", jump);
  const frame = $("#pairReader");
  let currentRoute = "contents";
  let activePairId = null;
  let activeView = "handouts";
  let frameReady = false;

  function applyMode(mode, notifyFrame = true) {
    mode = mode === "dark" ? "dark" : "light";
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.colorMode = mode;
    $("#modeSelect").value = mode;
    storage.set("dbtPair.ui.mode", mode);
    storage.set("ourspace.colorMode.v1", mode);
    if (notifyFrame && frameReady) frame.contentWindow.postMessage({type: "dbt:mode", mode}, location.protocol === "file:" ? "*" : location.origin);
  }
  let parentMode = null;
  try { parentMode = window.parent !== window ? window.parent.document.documentElement.dataset.colorMode : null; } catch (_) {}
  applyMode(storage.get("ourspace.colorMode.v1", parentMode || storage.get("dbtPair.ui.mode", "light")));
  $("#modeSelect").addEventListener("change", event => applyMode(event.target.value));
  window.addEventListener("storage", event => {
    if ((event.key === "dbtPair.ui.mode" || event.key === "ourspace.colorMode.v1") && ["light", "dark"].includes(event.newValue) && event.newValue !== document.documentElement.dataset.mode) applyMode(event.newValue);
    if (event.key === "dbtBook.lastRead") refreshBookmark();
  });

  function clampPosition(element) {
    if (!element.getClientRects().length) return;
    const rect = element.getBoundingClientRect();
    const x = Math.max(4, Math.min(innerWidth - rect.width - 4, rect.left));
    const y = Math.max(4, Math.min(innerHeight - rect.height - 4, rect.top));
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.right = "auto";
  }
  function setMasterCollapsed(collapsed, remember = true) {
    master.classList.toggle("collapsed", collapsed);
    toggle.textContent = collapsed ? "☰" : "−";
    toggle.title = collapsed ? "Drag to move · click to expand" : "Drag to move · click to collapse";
    toggle.setAttribute("aria-label", collapsed ? "Expand master navigation" : "Collapse master navigation");
    toggle.setAttribute("aria-expanded", String(!collapsed));
    if (remember) storage.set("dbtBook.ui.masterCollapsed", collapsed ? "1" : "0");
    clampPosition(master);
  }
  setMasterCollapsed(storage.get("dbtBook.ui.masterCollapsed", "1") === "1", false);

  function setJumpOpen(open) {
    if (!jump.getClientRects().length) {
      jump.classList.toggle("open", open);
      orb.setAttribute("aria-expanded", String(open));
      return;
    }
    const rect = orb.getBoundingClientRect();
    jump.classList.toggle("open", open);
    orb.setAttribute("aria-expanded", String(open));
    orb.setAttribute("aria-label", open ? "Close book jump navigation" : "Open book jump navigation");
    jump.style.left = `${open ? rect.right - jump.offsetWidth : rect.left}px`;
    jump.style.top = `${rect.top}px`;
    jump.style.right = "auto";
    clampPosition(jump);
  }
  function wireDrag(element, handle, key, onClick = null) {
    let drag = null;
    let suppressClick = false;
    try {
      const saved = JSON.parse(storage.get(key, "null"));
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        element.style.left = `${saved.x}px`;
        element.style.top = `${saved.y}px`;
        element.style.right = "auto";
      }
    } catch (_) {}
    clampPosition(element);
    handle.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      const rect = element.getBoundingClientRect();
      drag = {x: event.clientX, y: event.clientY, baseX: rect.left, baseY: rect.top, moved: false};
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", event => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
      if (!drag.moved) return;
      element.style.left = `${Math.max(4, Math.min(innerWidth - element.offsetWidth - 4, drag.baseX + dx))}px`;
      element.style.top = `${Math.max(4, Math.min(innerHeight - element.offsetHeight - 4, drag.baseY + dy))}px`;
      element.style.right = "auto";
    });
    const end = event => {
      if (!drag) return;
      suppressClick = drag.moved;
      if (drag.moved) {
        const rect = element.getBoundingClientRect();
        storage.set(key, JSON.stringify({x: rect.left, y: rect.top}));
      }
      drag = null;
      try { handle.releasePointerCapture(event.pointerId); } catch (_) {}
      setTimeout(() => { suppressClick = false; }, 0);
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    handle.addEventListener("click", event => {
      if (suppressClick) { event.preventDefault(); return; }
      if (onClick) onClick();
    });
    return () => {
      storage.remove(key);
      element.style.left = "";
      element.style.top = "";
      element.style.right = "";
      clampPosition(element);
    };
  }
  const resetMasterHandle = wireDrag(master, $("#masterHandle"), "dbtBook.ui.masterPosition");
  const resetMasterToggle = wireDrag(master, toggle, "dbtBook.ui.masterPosition", () => setMasterCollapsed(!master.classList.contains("collapsed")));
  const resetJump = wireDrag(jump, orb, "dbtBook.ui.jumpPosition", () => setJumpOpen(!jump.classList.contains("open")));
  $("#resetMasterNav").addEventListener("click", () => { resetMasterHandle(); resetMasterToggle(); setMasterCollapsed(true); });
  $("#resetJumpNav").addEventListener("click", () => { setJumpOpen(false); resetJump(); });
  window.addEventListener("resize", () => { clampPosition(master); clampPosition(jump); });
  $("#routeSearch").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    $$(".master-panel .page-route").forEach(link => { link.hidden = !!query && !link.textContent.toLowerCase().includes(query); });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { setJumpOpen(false); setMasterCollapsed(true); }
  });
  document.addEventListener("click", event => {
    const disabled = event.target.closest('[aria-disabled="true"]');
    if (disabled) event.preventDefault();
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute("href") !== "#bookMain") {
      setJumpOpen(false);
      setMasterCollapsed(true);
    }
  });

  function filterIndex() {
    const words = $("#catalogSearch").value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const module = $("#moduleFilter").value;
    let count = 0;
    $$("#page-index .pair-card").forEach(card => {
      const match = (!module || card.dataset.module === module) && words.every(word => card.dataset.search.includes(word));
      card.hidden = !match;
      if (match) count++;
    });
    $$("[data-index-module]").forEach(section => { section.hidden = ![...section.querySelectorAll(".pair-card")].some(card => !card.hidden); });
    $("#indexCount").textContent = `${count} ${count === 1 ? "pairing" : "pairings"}${count !== pairs.length ? ` of ${pairs.length}` : ""}`;
    $("#emptyResults").hidden = count !== 0;
  }
  $("#indexSearchForm").addEventListener("submit", event => event.preventDefault());
  $("#catalogSearch").addEventListener("input", filterIndex);
  $("#moduleFilter").addEventListener("change", filterIndex);
  $("#clearSearch").addEventListener("click", () => { $("#catalogSearch").value = ""; $("#moduleFilter").value = ""; filterIndex(); $("#catalogSearch").focus(); });

  function pairHash(id, view = "handouts") {
    return `read=${encodeURIComponent(id)}${view === "worksheets" ? "&view=worksheets" : ""}`;
  }
  function refreshBookmark() {
    let last;
    try { last = JSON.parse(storage.get("dbtBook.lastRead", "null")); } catch (_) {}
    const pair = last && pairMap.get(last.id);
    $("#continueCard").hidden = !pair;
    if (!pair) return;
    $("#continueTitle").textContent = pair.worksheet.title;
    $("#continueModule").textContent = `${pair.worksheet.module} · Worksheet ${pair.worksheet.number}`;
    $("#continueLink").href = `#${pairHash(pair.id, last.view)}`;
  }
  function rememberPair(pair, view) {
    storage.set("dbtBook.lastRead", JSON.stringify({id: pair.id, view, updatedAt: new Date().toISOString()}));
    refreshBookmark();
  }
  function renderJump(route) {
    const destinations = $("#jumpDestinations");
    destinations.replaceChildren();
    $("#jumpTitle").textContent = route === "index" ? "Jump in the index" : chapterMap.has(route) ? chapterMap.get(route).title : "Book chapters";
    if (chapterMap.has(route)) {
      pairs.filter(pair => pair.chapter === route).forEach(pair => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "jump-link";
        button.textContent = `Worksheet ${pair.worksheet.number} · ${pair.worksheet.title}`;
        button.addEventListener("click", () => { document.getElementById(`chapter-${pair.id}`).scrollIntoView({behavior: "smooth", block: "start"}); setJumpOpen(false); });
        destinations.appendChild(button);
      });
    } else {
      book.chapters.forEach((chapter, i) => {
        if (route === "index") {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "jump-link";
          button.textContent = chapter.title;
          button.addEventListener("click", () => {
            const section = document.getElementById(`index-${chapter.id}`);
            if (section.hidden) { $("#moduleFilter").value = ""; $("#catalogSearch").value = ""; filterIndex(); }
            section.scrollIntoView({behavior: "smooth", block: "start"});
            setJumpOpen(false);
          });
          destinations.appendChild(button);
        } else {
          const link = document.createElement("a");
          link.className = "jump-link";
          link.href = `#${chapter.id}`;
          link.textContent = `${String(i + 1).padStart(2, "0")} · ${chapter.title}`;
          destinations.appendChild(link);
        }
      });
    }
  }
  function setAdjacent(link, pair, label) {
    link.textContent = label;
    if (pair) { link.href = `#${pairHash(pair.id, activeView)}`; link.removeAttribute("aria-disabled"); link.removeAttribute("tabindex"); }
    else { link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); link.setAttribute("tabindex", "-1"); }
  }
  function renderReader(pair, view) {
    const index = pairs.indexOf(pair);
    $("#readerTitle").textContent = pair.worksheet.title;
    $("#readerKicker").textContent = `${pair.worksheet.module} · Worksheet ${pair.worksheet.number}`;
    $("#readerChapterLink").href = `#${pair.chapter}`;
    $("#readerPosition").textContent = `${index + 1} / ${pairs.length}`;
    $("#readerDirect").href = `${pair.path}#${view}`;
    activeView = view;
    setAdjacent($("#readerPrevious"), pairs[index - 1], "← Previous pair");
    setAdjacent($("#readerNext"), pairs[index + 1], "Next pair →");
    frame.title = `${pair.worksheet.module} Worksheet ${pair.worksheet.number}: ${pair.worksheet.title}`;
    if (activePairId !== pair.id) {
      activePairId = pair.id;
      frameReady = false;
      $("#readerStatus").hidden = false;
      $("#readerStatus").textContent = "Opening pairing…";
      frame.src = `${pair.path}#${view}`;
    } else if (frameReady) {
      frame.contentWindow.postMessage({type: "dbt:view", view}, location.protocol === "file:" ? "*" : location.origin);
    }
    rememberPair(pair, view);
    document.title = `${pair.worksheet.title} · DBT Skills Book`;
  }
  frame.addEventListener("load", () => {
    if (!activePairId) return;
    frameReady = true;
    $("#readerStatus").hidden = true;
    applyMode(document.documentElement.dataset.mode);
  });
  window.addEventListener("message", event => {
    if (event.source !== frame.contentWindow || (location.protocol !== "file:" && event.origin !== location.origin)) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "dbt:pair-ready" && data.pairId === activePairId) {
      frameReady = true;
      $("#readerStatus").hidden = true;
      applyMode(document.documentElement.dataset.mode);
    } else if (data.type === "dbt:open-pair" && pairMap.has(data.pairId)) {
      location.hash = pairHash(data.pairId, data.view === "worksheets" ? "worksheets" : "handouts");
    } else if (data.type === "dbt:mode" && ["light", "dark"].includes(data.mode)) {
      applyMode(data.mode, false);
    } else if (data.type === "dbt:pair-view" && data.pairId === activePairId && ["handouts", "worksheets"].includes(data.view)) {
      activeView = data.view;
      const pair = pairMap.get(activePairId);
      if (currentRoute === "reader") history.replaceState(null, "", `#${pairHash(pair.id, activeView)}`);
      $("#readerDirect").href = `${pair.path}#${activeView}`;
      const index = pairs.indexOf(pair);
      setAdjacent($("#readerPrevious"), pairs[index - 1], "← Previous pair");
      setAdjacent($("#readerNext"), pairs[index + 1], "Next pair →");
      rememberPair(pair, activeView);
    }
  });

  function renderRoute(focus = true) {
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const pair = hash.startsWith("read=") ? pairMap.get(params.get("read")) : null;
    const route = pair ? "reader" : routeLabels.has(hash) ? hash : "contents";
    currentRoute = route;
    $$(".site-page").forEach(page => page.classList.toggle("is-active", page.id === `page-${route}`));
    document.body.classList.toggle("reading-pair", route === "reader");
    $$(".master-panel [data-book-route]").forEach(link => {
      link.classList.toggle("is-current", link.dataset.bookRoute === route);
      if (link.dataset.bookRoute === route) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    $("#masterCurrent").textContent = routeLabels.get(route) || "Reading a pairing";
    setJumpOpen(false);
    if (pair) renderReader(pair, params.get("view") === "worksheets" ? "worksheets" : "handouts");
    else {
      renderJump(route);
      refreshBookmark();
      document.title = `${routeLabels.get(route).replace(/^\d+ · /, "")} · DBT Skills Book`;
      clampPosition(master);
      clampPosition(jump);
    }
    if (focus) $(`#page-${route}`).focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: "instant"});
  }
  window.addEventListener("hashchange", () => renderRoute());
  if (!location.hash) history.replaceState(null, "", "#contents");
  renderRoute(false);
})();
