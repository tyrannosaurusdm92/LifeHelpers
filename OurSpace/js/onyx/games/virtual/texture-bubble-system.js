/* Data-driven material/texture bubbles for Interior Design Mode. */
(function (global) {
  'use strict';

  const STYLE_ID = 'interior-design-bubble-system-base-styles';

  function ensureBaseStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .design-bubble-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:10px;}
      .design-bubble-wrap{display:inline-flex;min-width:48px;max-width:72px;flex-direction:column;align-items:center;gap:4px;}
      .design-bubble{width:48px;height:48px;min-width:44px;min-height:44px;padding:0;border-radius:50%;border:3px solid rgba(255,255,255,.92);outline:1px solid rgba(0,0,0,.82);box-shadow:0 2px 8px rgba(0,0,0,.38);background-position:center;background-repeat:repeat;background-size:250px 250px;cursor:pointer;touch-action:manipulation;}
      .design-bubble:focus-visible{outline:3px solid currentColor;outline-offset:3px;}
      .design-bubble[aria-pressed="true"]{box-shadow:0 0 0 3px rgba(255,255,255,.85),0 0 0 5px rgba(0,0,0,.75);}
      .design-bubble-label{font:600 9px/1.15 system-ui,sans-serif;text-align:center;overflow-wrap:anywhere;}
      .design-bubble-large{width:64px;height:64px;}
      .design-bubble-action{background-image:none;background:#171717;color:#fff;font:700 22px/1 system-ui,sans-serif;}
      @media (max-width:520px){.design-bubble{width:44px;height:44px}.design-bubble-large{width:56px;height:56px}}
      @media (prefers-reduced-motion:reduce){.design-bubble{scroll-behavior:auto;}}
    `;
    document.head.appendChild(style);
  }

  function makeWrapper(labelText) {
    const wrapper = document.createElement('span');
    wrapper.className = 'design-bubble-wrap';
    const label = document.createElement('span');
    label.className = 'design-bubble-label';
    label.textContent = labelText || '';
    wrapper.appendChild(label);
    return { wrapper, label };
  }

  function makeBubble(options = {}) {
    ensureBaseStyles();
    const { wrapper, label } = makeWrapper(options.label || options.id || 'Value');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `design-bubble${options.large ? ' design-bubble-large' : ''}${options.action ? ' design-bubble-action' : ''}`;
    button.dataset.propertyKey = options.propertyKey || options.id || '';
    button.setAttribute('aria-label', options.ariaLabel || options.label || options.id || 'Design value');
    if (options.pressed != null) button.setAttribute('aria-pressed', String(Boolean(options.pressed)));
    if (options.disabled) button.disabled = true;
    if (options.action && options.symbol) button.textContent = options.symbol;
    if (options.texture && global.TextureCatalog) global.TextureCatalog.applyTexture(button, options.texture);
    if (options.color) button.style.background = options.color;
    button.addEventListener('click', event => options.onActivate && options.onActivate({ event, button, options }));
    wrapper.insertBefore(button, label);
    return { wrapper, button, label };
  }

  function makeTextureBubble(texture, options = {}) {
    return makeBubble({
      id: texture.id,
      propertyKey: options.propertyKey || texture.id,
      label: options.label || texture.id.replace(/_/g, ' '),
      ariaLabel: options.ariaLabel || `${texture.categoryLabel}: ${texture.id}`,
      texture,
      large: options.large !== false,
      pressed: options.pressed,
      onActivate: options.onActivate
    });
  }

  async function renderCategory(container, catalog, category, options = {}) {
    ensureBaseStyles();
    await catalog.loadCategoryCss(category, options);
    const textures = catalog.list(category);
    container.textContent = '';
    container.classList.add('design-bubble-row');
    const current = options.currentTextureId || null;
    for (const texture of textures) {
      const bubble = makeTextureBubble(texture, {
        propertyKey: options.propertyKey || 'material',
        pressed: texture.id === current,
        onActivate: payload => {
          container.querySelectorAll('.design-bubble[aria-pressed]').forEach(el => el.setAttribute('aria-pressed', 'false'));
          payload.button.setAttribute('aria-pressed', 'true');
          if (options.onSelect) options.onSelect(texture, payload);
        }
      });
      container.appendChild(bubble.wrapper);
    }
    return textures;
  }

  function createDynamicValueGroup(options = {}) {
    ensureBaseStyles();
    const container = document.createElement('div');
    container.className = 'design-bubble-row';
    const values = Array.isArray(options.values) ? options.values : [];
    const min = Number.isFinite(options.min) ? options.min : 1;
    const max = Number.isFinite(options.max) ? options.max : Math.max(min, 8);

    function rerender() {
      container.textContent = '';
      values.forEach((value, index) => {
        const bubble = makeBubble({
          propertyKey: `${options.key || 'value'}-${index}`,
          label: options.labelFor ? options.labelFor(index, value) : `Value ${index + 1}`,
          color: typeof value === 'string' ? value : undefined,
          onActivate: payload => options.onEdit && options.onEdit(index, value, payload)
        });
        container.appendChild(bubble.wrapper);
      });
      const add = makeBubble({ action:true, symbol:'+', label:'Add', ariaLabel:'Add value', disabled: values.length >= max, onActivate:()=>{
        if (values.length >= max) return;
        const seed = values.length ? values[values.length - 1] : (options.defaultValue || '#ffffff');
        values.push(typeof seed === 'object' ? structuredClone(seed) : seed);
        options.onChange && options.onChange(values);
        rerender();
      }});
      const remove = makeBubble({ action:true, symbol:'−', label:'Remove', ariaLabel:'Remove last value', disabled: values.length <= min, onActivate:()=>{
        if (values.length <= min) return;
        values.pop();
        options.onChange && options.onChange(values);
        rerender();
      }});
      container.append(add.wrapper, remove.wrapper);
    }
    rerender();
    return { element: container, values, rerender };
  }

  global.BubbleSystem = {
    ensureBaseStyles,
    makeBubble,
    makeTextureBubble,
    renderCategory,
    createDynamicValueGroup
  };
})(window);
