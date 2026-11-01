/* DBT responsive worksheet frames, eight-direction expansion/retraction.
 * Combined with the supplied DBT_Worksheet_Javascript_Updated(2) responsive API:
 * [data-dbt-responsive], [data-dbt-resizable], dbt:resize notifications,
 * automatic narrow/medium reflow, touch/keyboard sides and corners.
 * Retains Pass 2 saved sizes, size buttons, readable text, embedded iframes,
 * table repair, and print-safe overflow. No Savanski editor/tools imported. */
(() => {
  'use strict';
  if (window.DBTResponsive) return;

  const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  const TARGETS = '.pdf-sheet, .book-cover-host, .pair-reader-shell, .pair-card, .instruction-card, .reader-toolbar, [data-dbt-resizable], .dbt-resizable';
  const REACTIVE = '.pdf-sheet, .document-card, .book-contents, .pair-card, .page-frame, .book-cover-host, .pair-reader-shell, .reader-toolbar, .form-toolbar, [data-dbt-responsive], [data-dbt-worksheet], .dbt-worksheet, [data-worksheet], .worksheet-page';
  const watched = new WeakSet();
  const wired = new WeakSet();
  const state = new WeakMap();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const px = n => `${Math.round(n * 100) / 100}px`;
  const HANDLE_LABEL = {n:'top', s:'bottom', e:'right', w:'left', ne:'top right', nw:'top left', se:'bottom right', sw:'bottom left'};
  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } },
    put(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} },
    del(key) { try { localStorage.removeItem(key); } catch (_) {} }
  };

  const css = `
    .dbt-responsive,.dbt-responsive *{box-sizing:border-box}
    .dbt-responsive{min-width:0;overflow-wrap:break-word}
    .dbt-responsive :is(.grid-2,.grid-3,.grid-4,.two-col,.three-col,.field-grid,.form-grid,.worksheet-grid)>*{min-width:0;max-width:100%}
    .dbt-responsive :is(textarea,[contenteditable="true"]){white-space:pre-wrap;overflow-wrap:break-word}
    .dbt-responsive iframe{max-width:100%}
    .dbt-responsive :is(input,textarea,select){min-width:0;max-width:100%}
    .dbt-responsive :is(img,video,svg,canvas){max-width:100%;height:auto}
    .dbt-responsive :is(.table-wrap,.table-responsive){max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain}
    .dbt-responsive.dbt-narrow :is(.grid-2,.grid-3,.grid-4,.two-col,.three-col,.field-grid,.form-grid,.worksheet-grid,.identity-fields,.decision-branches){grid-template-columns:minmax(0,1fr)!important}
    .dbt-responsive.dbt-medium :is(.grid-3,.grid-4,.three-col){grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .dbt-resizable{position:relative;box-sizing:border-box;min-width:0;isolation:isolate}
    .dbt-resizable.dbt-user-sized{max-width:none}
    .dbt-resizable.dbt-height-sized{min-height:0!important;overflow:hidden;overscroll-behavior:contain}
    .dbt-resizable.dbt-height-sized>.dbt-resize-scroll{height:100%;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
    .dbt-resizable.pair-card .dbt-resize-scroll{display:flex;flex-direction:column;gap:inherit}
    .dbt-resizable.reader-toolbar .dbt-resize-scroll{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
    .dbt-resizable.instruction-card .dbt-resize-scroll{display:block}
    .dbt-resizable:not(.dbt-height-sized)>.dbt-resize-scroll{height:auto;overflow:visible}
    .dbt-resizable.dbt-resizing{user-select:none;-webkit-user-select:none}
    .dbt-resize-handle{position:absolute;z-index:50;display:block;border:0;background:transparent;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto}
    .dbt-resize-handle[data-edge="n"]{top:0;left:18px;right:18px;height:11px;cursor:ns-resize}
    .dbt-resize-handle[data-edge="s"]{bottom:0;left:18px;right:18px;height:12px;cursor:ns-resize}
    .dbt-resize-handle[data-edge="e"]{top:18px;right:0;bottom:18px;width:11px;cursor:ew-resize}
    .dbt-resize-handle[data-edge="w"]{top:18px;left:0;bottom:18px;width:11px;cursor:ew-resize}
    .dbt-resize-handle[data-edge="ne"]{top:0;right:0;width:22px;height:22px;cursor:nesw-resize}
    .dbt-resize-handle[data-edge="nw"]{top:0;left:0;width:22px;height:22px;cursor:nwse-resize}
    .dbt-resize-handle[data-edge="se"]{right:0;bottom:0;width:23px;height:23px;cursor:nwse-resize}
    .dbt-resize-handle[data-edge="sw"]{left:0;bottom:0;width:23px;height:23px;cursor:nesw-resize}
    .dbt-resize-handle:is(:hover,:focus-visible){background:color-mix(in srgb,var(--yellow,#d5e8fb) 24%,transparent)}
    .dbt-resize-handle[data-edge="s"]::after{content:"";position:absolute;bottom:3px;left:50%;transform:translateX(-50%);height:4px;width:42px;max-width:45%;border-radius:5px;background:var(--teal,#6699cc)}
    .dbt-resize-handle[data-edge="se"]::after,.dbt-resize-handle[data-edge="sw"]::after{content:"";position:absolute;bottom:3px;width:11px;height:11px;border-bottom:3px solid var(--orange,#ff6600)}
    .dbt-resize-handle[data-edge="se"]::after{right:3px;border-right:3px solid var(--orange,#ff6600)}
    .dbt-resize-handle[data-edge="sw"]::after{left:3px;border-left:3px solid var(--orange,#ff6600)}
    .dbt-resize-handle:focus-visible{outline:3px solid var(--yellow,#d5e8fb);outline-offset:-2px}
    .dbt-resize-controls{position:absolute;z-index:51;top:-15px;right:24px;display:flex;align-items:center;gap:3px;padding:2px 3px;border:1px solid var(--teal,#6699cc);border-radius:7px;background:var(--paper,#ffffff);box-shadow:0 2px 4px #243950}
    .dbt-resize-controls button{all:revert;appearance:none;display:inline-grid;place-items:center;width:26px;height:24px;min-width:26px;min-height:24px;margin:0;padding:0;border:1px solid var(--teal,#6699cc);border-radius:4px;background:var(--mist,#f3f7fc);color:var(--blue,#243950);font:800 16px/1 system-ui;cursor:pointer}
    .dbt-resize-controls button:hover{background:var(--yellow,#d5e8fb)}
    .dbt-resize-controls button:focus-visible{outline:3px solid var(--orange,#ff6600);outline-offset:2px}
    .dbt-resizable.pdf-sheet{overflow-wrap:break-word}
    .dbt-resizable.pdf-sheet:not(.dbt-height-sized){height:auto!important}
    .dbt-resizable.pdf-sheet.dbt-height-sized{display:flex;flex-direction:column;overflow:hidden}
    .dbt-resizable.pdf-sheet.dbt-height-sized>.paper-header,.dbt-resizable.pdf-sheet.dbt-height-sized>.paper-footer{flex:0 0 auto}
    .dbt-resizable.pdf-sheet.dbt-height-sized>.paper-body{min-height:0;flex:1 1 auto;overflow:auto;scrollbar-gutter:stable;overscroll-behavior:contain;padding-right:3px}
    .dbt-resizable.pdf-sheet :is(.paper-field,.paper-text,.paper-body,.paper-header){min-width:0}
    .dbt-resizable.pdf-sheet .table-wrap{max-width:100%;overflow-x:auto}
    .dbt-resizable.pdf-sheet.dbt-narrow{padding-inline:clamp(12px,4%,25px)}
    .dbt-resizable.pdf-sheet.dbt-medium{padding-inline:clamp(20px,4%,42px)}
    .dbt-resizable.pdf-sheet.dbt-narrow .paper-header h2{font-size:clamp(18px,6cqw,25px)}
    .dbt-resizable.pdf-sheet.dbt-narrow .paper-subhead{font-size:clamp(15px,4cqw,17px);overflow-wrap:normal;word-break:normal}
    .dbt-resizable:is(.pair-card,.instruction-card,.reader-toolbar){container-type:inline-size}
    .dbt-resizable.pair-card{padding:var(--dbt-panel-pad,20px);gap:var(--dbt-panel-gap,8px)}
    .dbt-resizable.pair-card h2{font-size:var(--dbt-card-title,21px);overflow-wrap:break-word}
    .dbt-resizable.dbt-narrow :is(.pair-card-actions,.reader-heading,.reader-controls){min-width:0}
    .dbt-resizable.dbt-narrow .pair-card-actions .button{overflow-wrap:break-word;white-space:normal}
    .dbt-resizable.dbt-height-sized.pair-card{display:block}
    .dbt-resizable.dbt-height-sized.pair-card .pair-card-actions{margin-top:12px}
    .skills-hub .pair-reader-shell.dbt-height-sized{min-height:0!important;overflow:hidden}
    .skills-hub .pair-reader-shell .pair-reader{display:block;max-width:100%}
    .skills-hub .pair-reader-shell.dbt-user-sized .pair-reader{width:98%;height:98%;min-height:0!important;margin:0 auto}
    .skills-hub .book-cover-host.dbt-user-sized .book-cover-frame{width:98%;height:98%;max-height:100%}
    .dbt-resizable.dbt-height-sized:not(.pdf-sheet,.book-cover-host,.pair-reader-shell)>.dbt-resize-scroll{height:100%}
    .skills-hub .book-cover-host.dbt-height-sized{overflow:hidden}
    .skills-hub .reader-toolbar.dbt-height-sized{position:relative;top:auto;overflow:hidden}
    .skills-hub .pair-card.dbt-height-sized{overflow:hidden}
    @media(max-width:440px){.dbt-resize-controls{right:22px}.dbt-resize-controls button{min-width:28px;min-height:28px}}
    @media print{
      .dbt-resize-handle,.dbt-resize-controls{display:none!important}
      .dbt-resizable,.dbt-resizable.dbt-user-sized,.dbt-resizable.dbt-height-sized{position:static!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;min-height:0!important;overflow:visible!important;margin-inline:auto!important;break-inside:auto!important;container-type:normal!important}
      .dbt-resizable.pdf-sheet{padding-inline:0!important;display:block!important}
      .dbt-resizable.pdf-sheet>.paper-body,.dbt-resizable.dbt-height-sized .dbt-resize-scroll{height:auto!important;overflow:visible!important;max-height:none!important;flex:initial!important}
    }
  `;

  function injectCSS() {
    if (document.getElementById('dbt-responsive-style')) return;
    const tag = document.createElement('style');
    tag.id = 'dbt-responsive-style';
    tag.textContent = css;
    document.head.append(tag);
  }

  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(entries => {
    for (const entry of entries) measure(entry.target);
  }) : {observe() {}};

  function observe(el) {
    if (watched.has(el)) return;
    watched.add(el);
    el.classList.add('dbt-responsive');
    observer.observe(el);
    measure(el);
  }

  function measure(el) {
    if (!el.isConnected || el.closest('.dbt-print-stage')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const width = rect.width, height = rect.height;
    el.classList.toggle('dbt-narrow', width < 520);
    el.classList.toggle('dbt-medium', width >= 520 && width < 820);
    const st = state.get(el);
    if (!st) return;
    if (!st.baseW || !st.baseH) {
      st.baseW = width;
      st.baseH = height;
      restore(el);
    }
    if (el.matches('.pair-card, .reader-toolbar, .instruction-card, [data-dbt-scale-ui]')) {
      // Follow Savanski's proportional spacing idea but retain comfortably
      // readable type, input sizes, and accessible hit targets.
      const scale = clamp(Math.sqrt(width / Math.max(1, st.baseW)), .84, 1.22);
      if (Math.abs((st.lastScale || 0) - scale) > .015) {
        st.lastScale = scale;
        el.style.setProperty('--dbt-ui-scale', String(Math.round(scale * 1000) / 1000));
        el.style.setProperty('--dbt-panel-pad', px(clamp(20 * scale, 12, 25)));
        el.style.setProperty('--dbt-panel-gap', px(clamp(8 * scale, 6, 11)));
        el.style.setProperty('--dbt-card-title', px(clamp(21 * scale, 18, 26)));
      }
    }
    if (Math.abs(st.lastW - width) < .5 && Math.abs(st.lastH - height) < .5) return;
    st.lastW = width;
    st.lastH = height;
    el.dispatchEvent(new CustomEvent('dbt:resize', {bubbles:true, detail:{
      width, height, defaultWidth:st.baseW, defaultHeight:st.baseH, scale:st.lastScale || 1
    }}));
  }

  function parentSpace(el) {
    const host = el.parentElement;
    const computed = host && getComputedStyle(host);
    const padding = computed ? (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.paddingRight) || 0) : 0;
    const available = Math.min(window.innerWidth - 12, (host?.clientWidth || window.innerWidth) - padding - 2);
    return Math.max(160, available);
  }

  function bounds(el) {
    const maxWidth = parentSpace(el);
    const minWidth = Math.min(maxWidth, el.matches('.pdf-sheet') ? 260 : 190);
    const fixedParts = el.matches('.pdf-sheet') ? ((el.querySelector(':scope > .paper-header')?.offsetHeight || 0) + (el.querySelector(':scope > .paper-footer')?.offsetHeight || 0)) : 0;
    const minHeight = el.matches('.pdf-sheet') ? Math.max(235, fixedParts + 125) : el.matches('.book-cover-host, .pair-reader-shell') ? 160 : 110;
    return {minWidth, maxWidth, minHeight, maxHeight:Math.max(2400, window.innerHeight * 5)};
  }

  function setSize(el, width, height = null, left = null) {
    const st = state.get(el);
    if (!st) return;
    const limit = bounds(el);
    const nextW = clamp(width, limit.minWidth, limit.maxWidth);
    el.classList.add('dbt-user-sized');
    el.style.width = px(nextW);
    el.style.maxWidth = 'none';
    if (height !== null) {
      el.classList.add('dbt-height-sized');
      if (el.matches('.pdf-sheet')) {
        const body = el.querySelector(':scope > .paper-body');
        if (body) {body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label','Scrollable worksheet page content');}
      }
      el.style.height = px(clamp(height, limit.minHeight, limit.maxHeight));
      el.style.maxHeight = 'none';
    } else if (!el.classList.contains('dbt-height-sized')) {
      el.style.height = st.baseline.height;
    }
    if (left !== null) {
      const maxLeft = Math.max(0, limit.maxWidth - nextW);
      el.style.marginLeft = px(clamp(left, 0, maxLeft));
      el.style.marginRight = '0';
      el.style.justifySelf = 'start';
    }
    st.ratio = nextW / limit.maxWidth;
    measure(el);
  }

  function save(el) {
    const st = state.get(el);
    if (!st || !el.classList.contains('dbt-user-sized')) return;
    const r = el.getBoundingClientRect();
    store.put(st.key, {v:2, widthRatio:clamp(r.width / parentSpace(el), .1, 1),
      height:el.classList.contains('dbt-height-sized') ? r.height : null,
      left:Math.max(0, parseFloat(el.style.marginLeft) || 0)});
  }

  function restore(el) {
    const st = state.get(el);
    if (!st || st.restored || !st.baseW) return;
    st.restored = true;
    const data = store.get(st.key);
    if (!data || data.v !== 2 || !Number.isFinite(data.widthRatio)) return;
    const width = clamp(data.widthRatio, .1, 1) * parentSpace(el);
    const height = Number.isFinite(data.height) ? data.height : null;
    setSize(el, width, height, Number.isFinite(data.left) ? data.left : null);
  }

  function reset(el) {
    const st = state.get(el);
    if (!st) return;
    for (const [key, value] of Object.entries(st.baseline)) el.style[key] = value;
    el.classList.remove('dbt-user-sized', 'dbt-height-sized', 'dbt-resizing');
    ['--dbt-ui-scale','--dbt-panel-pad','--dbt-panel-gap','--dbt-card-title'].forEach(v => el.style.removeProperty(v));
    if (el.matches('.pdf-sheet')) {
      const body=el.querySelector(':scope > .paper-body');
      if (body) {body.removeAttribute('tabindex');body.removeAttribute('role');body.removeAttribute('aria-label');}
    }
    st.ratio = null;
    store.del(st.key);
    measure(el);
  }

  function resizeBy(el, factor) {
    const r = el.getBoundingClientRect();
    const manuallyTall = el.classList.contains('dbt-height-sized');
    const frame = el.matches('.book-cover-host,.pair-reader-shell');
    setSize(el, r.width * factor, (manuallyTall || frame) ? r.height * factor : null);
    save(el);
  }

  function apply(el, edge, dx, dy, start) {
    const limit = bounds(el);
    let w = start.width, h = start.height;
    if (edge.includes('e')) w += dx;
    if (edge.includes('w')) w -= dx;
    if (edge.includes('s')) h += dy;
    if (edge.includes('n')) h -= dy;
    w = clamp(w, limit.minWidth, limit.maxWidth);
    h = clamp(h, limit.minHeight, limit.maxHeight);
    // Width-only resize remains intrinsically tall, growing as its editable
    // text flows. Height drag deliberately enables an internal scrollport.
    const vertical = edge.includes('s') || edge.includes('n');
    const left = edge.includes('w') ? clamp(start.left + start.width - w, 0, limit.maxWidth - w) : null;
    setSize(el, w, (vertical || start.fixedHeight) ? h : null, left);
  }

  function begin(event, el, edge) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();event.stopPropagation();
    const handle = event.currentTarget;
    const r = el.getBoundingClientRect();
    const host = el.parentElement?.getBoundingClientRect();
    const start = {width:r.width, height:r.height,
      left:Math.max(0, r.left - (host?.left || 0)), fixedHeight:el.classList.contains('dbt-height-sized')};
    const sx = event.clientX, sy = event.clientY;
    el.classList.add('dbt-resizing');
    try {handle.setPointerCapture(event.pointerId);} catch (_) {}
    const move = e => apply(el, edge, e.clientX-sx, e.clientY-sy, start);
    const finish = () => {
      el.classList.remove('dbt-resizing');
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      save(el);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  }

  function adjustFromKey(el, edge, key, amount) {
    const horizontal = key === 'ArrowRight' || key === 'ArrowLeft';
    const vertical = !horizontal;
    if (horizontal && !(edge.includes('e') || edge.includes('w'))) return false;
    if (vertical && !(edge.includes('n') || edge.includes('s'))) return false;
    const sign = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
    const dx = horizontal ? sign * amount : 0;
    const dy = vertical ? sign * amount : 0;
    const r = el.getBoundingClientRect(), host = el.parentElement?.getBoundingClientRect();
    apply(el, edge, dx, dy, {width:r.width, height:r.height,
      left:Math.max(0, r.left - (host?.left || 0)), fixedHeight:el.classList.contains('dbt-height-sized')});
    save(el);
    return true;
  }

  function makeControls(el) {
    if (!el.matches('.pdf-sheet, .book-cover-host, .pair-reader-shell')) return;
    const controls = document.createElement('div');
    controls.className = 'dbt-resize-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Page size');
    for (const [label, glyph, fn] of [
      ['Retract page', '−', () => resizeBy(el, .85)],
      ['Expand page', '+', () => resizeBy(el, 1.15)],
      ['Fit default size', '↺', () => reset(el)]
    ]) {
      const button = document.createElement('button');
      button.type = 'button';button.textContent = glyph;
      button.title = label;button.setAttribute('aria-label', label);
      button.setAttribute('data-dbt-no-print', '');button.setAttribute('data-dbt-no-save', '');
      button.addEventListener('click', e => {e.preventDefault();e.stopPropagation();fn();});
      controls.append(button);
    }
    el.append(controls);
  }

  function wrapPanelContent(el) {
    if (el.matches('.pdf-sheet,.book-cover-host,.pair-reader-shell')) return;
    if (el.querySelector(':scope > .dbt-resize-scroll')) return;
    const scroll = document.createElement('div');
    scroll.className = 'dbt-resize-scroll';
    while (el.firstChild) scroll.append(el.firstChild);
    el.append(scroll);
  }

  function enable(el) {
    if (wired.has(el) || el.closest('.dbt-print-stage')) return;
    const r = el.getBoundingClientRect();
    const props = ['width','height','maxWidth','maxHeight','marginLeft','marginRight','justifySelf','top','left','overflow','overflowX','overflowY'];
    const baseline = Object.fromEntries(props.map(key=>[key, el.style[key]]));
    const ident = el.id || (el.classList.contains('book-cover-host') ? 'book-cover' :
      el.classList.contains('pair-reader-shell') ? 'pair-reader' :
      el.classList.contains('reader-toolbar') ? 'reader-toolbar' :
      el.classList.contains('instruction-card') ? 'instruction-card' :
      `card-${[...el.parentElement.children].indexOf(el)}`);
    const key = 'dbt.layout.v2:' + location.pathname + ':' + ident + ':' + [...el.classList].filter(c=>['pdf-sheet','pair-card','book-cover-host','pair-reader-shell','reader-toolbar','instruction-card'].includes(c)).join('-');
    state.set(el, {baseW:r.width > 1 ? r.width : null, baseH:r.height > 1 ? r.height : null,
      lastW:-1,lastH:-1,baseline,key,restored:false});
    wired.add(el);
    wrapPanelContent(el);
    el.classList.add('dbt-resizable');
    observe(el);
    for (const edge of EDGES) {
      const h = document.createElement('span');
      h.className = 'dbt-resize-handle';h.dataset.edge = edge;
      h.setAttribute('role','separator');h.tabIndex = 0;
      h.setAttribute('aria-label', 'Resize ' + HANDLE_LABEL[edge] + ' of ' + (el.classList.contains('pdf-sheet') ? 'worksheet page' : 'panel'));
      h.title = 'Drag to expand/retract; arrow keys (Shift = faster); Home/double-click to fit';
      h.addEventListener('pointerdown', e => begin(e,el,edge));
      h.addEventListener('dblclick', e => {e.preventDefault();reset(el);});
      h.addEventListener('keydown', e => {
        if (e.key === 'Home') {e.preventDefault();reset(el);return;}
        if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
        if (adjustFromKey(el, edge, e.key, e.shiftKey ? 32 : 8)) e.preventDefault();
      });
      el.append(h);
    }
    makeControls(el);
    if (r.width > 1 && r.height > 1) restore(el);
  }

  // Repair unreasonably small table columns while retaining their editable
  // fields and letting the containing worksheet horizontally scroll the table.
  function repairTables(root) {
    const tables=[];
    if (root.nodeType===1 && root.matches?.('.paper-table')) tables.push(root);
    root.querySelectorAll?.('.paper-table').forEach(t=>tables.push(t));
    for (const table of tables) {
      if (table.dataset.dbtColumnsFixed) continue;
      table.dataset.dbtColumnsFixed='true';
      const trs=[...table.rows];
      const n=Math.max(table.querySelectorAll(':scope > colgroup > col').length,
        ...trs.slice(0,15).map(row=>[...row.cells].reduce((total,c)=>total+(c.colSpan||1),0)),0);
      if (!n) continue;
      const mins=Array.from({length:n},()=>145);
      for (const row of trs.slice(0,6)) {
        let col=0;
        for (const cell of row.cells) {
          const span=cell.colSpan||1;
          const label=(cell.querySelector(':scope > .paper-subhead, :scope > strong, :scope > b')?.textContent||cell.textContent||'').trim().replace(/\s+/g,' ');
          if (span===1 && label && label.length<=14 && !cell.querySelector('textarea,input,select'))
            mins[col]=Math.max(92,Math.min(mins[col],Math.max(92,label.length*9)));
          else if (span===1 && (cell.querySelector('textarea')||label.length>30))
            mins[col]=Math.max(mins[col],n>=5?170:220);
          col+=span;
        }
      }
      const width=mins.reduce((a,b)=>a+b,0)+n*8;
      table.style.setProperty('--dbt-min-table-width',`${Math.max(500,width)}px`);
      table.style.tableLayout='auto';
      [...table.querySelectorAll('colgroup col')].forEach((col,i)=>{col.style.width='auto';col.style.minWidth=`${mins[i]||145}px`;});
      for (const row of trs) {let col=0;for(const cell of row.cells){
        const span=cell.colSpan||1;
        cell.style.minWidth=`${mins.slice(col,col+span).reduce((a,b)=>a+b,0)}px`;
        col+=span;
      }}
      const wrap=table.closest('.table-wrap');
      if (wrap) {wrap.tabIndex=0;wrap.setAttribute('role','region');
        wrap.setAttribute('aria-label','Scrollable worksheet table');wrap.classList.add('dbt-table-scroll');}
    }
  }

  function discover(root=document) {
    if (root.nodeType!==1 && root.nodeType!==9) return;
    if (root.matches?.(REACTIVE)) observe(root);
    root.querySelectorAll?.(REACTIVE).forEach(observe);
    if (root.matches?.(TARGETS)) enable(root);
    root.querySelectorAll?.(TARGETS).forEach(enable);
    repairTables(root);
  }

  function viewportResize() {
    document.querySelectorAll('.dbt-resizable.dbt-user-sized').forEach(el=>{
      const st=state.get(el);if(!st || !el.getClientRects().length) return;
      const limit=bounds(el);
      const saved=store.get(st.key);
      const ratio=Number.isFinite(saved?.widthRatio) ? saved.widthRatio : st.ratio;
      const next=clamp((ratio||1)*limit.maxWidth,limit.minWidth,limit.maxWidth);
      const h=el.classList.contains('dbt-height-sized') ? el.getBoundingClientRect().height : null;
      setSize(el,next,h);
    });
  }

  function init() {
    injectCSS();discover();
    new MutationObserver(mutations=>{
      for (const m of mutations) for (const n of m.addedNodes) {
        if (n.nodeType===1 && !n.matches?.('.dbt-resize-handle,.dbt-resize-controls') && !n.closest?.('.dbt-resize-controls')) discover(n);
      }
    }).observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize', viewportResize, {passive:true});
  }
  window.DBTResponsive={init,enable,reset,repairTables,resizeBy};
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
