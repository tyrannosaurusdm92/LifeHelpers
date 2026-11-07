/* Bulletin's canonical 75-shade palette: no other scrap background colors accepted. */
(()=>{'use strict';
  const groups=[{"family":"Green","colors":[{"name":"Mint Green","hex":"#98FF98"},{"name":"Pastel Green","hex":"#B7E4C7"},{"name":"Seafoam Green","hex":"#9FE2BF"},{"name":"Sage Green","hex":"#9CAF88"},{"name":"Pistachio","hex":"#93C572"},{"name":"Celadon","hex":"#ACE1AF"},{"name":"Tea Green","hex":"#D0F0C0"},{"name":"Lime Green","hex":"#32CD32"},{"name":"Kelly Green","hex":"#4CBB17"},{"name":"Fern Green","hex":"#4F7942"},{"name":"Moss Green","hex":"#8A9A5B"},{"name":"Olive Green","hex":"#808000"},{"name":"Jade Green","hex":"#00A86B"},{"name":"Emerald Green","hex":"#50C878"},{"name":"Malachite","hex":"#0BDA51"},{"name":"Shamrock Green","hex":"#009E60"},{"name":"Hunter Green","hex":"#355E3B"},{"name":"Forest Green","hex":"#228B22"},{"name":"Pine Green","hex":"#01796F"},{"name":"Bottle Green","hex":"#006A4E"},{"name":"Viridian","hex":"#40826D"},{"name":"Laurel Green","hex":"#A9BA9D"},{"name":"Avocado Green","hex":"#568203"},{"name":"Dark Green","hex":"#006400"},{"name":"British Racing Green","hex":"#004225"},{"name":"Deep Evergreen","hex":"#013220"}]},{"family":"Purple","colors":[{"name":"Lavender","hex":"#E6E6FA"},{"name":"Lilac","hex":"#C8A2C8"},{"name":"Amethyst Purple","hex":"#9966CC"},{"name":"Royal Purple","hex":"#7851A9"}]},{"family":"Gold","colors":[{"name":"Pale Gold","hex":"#E6BE8A"},{"name":"Champagne Gold","hex":"#F7E7CE"},{"name":"Light Gold","hex":"#F5D76E"},{"name":"Classic Gold","hex":"#FFD700"},{"name":"Golden Yellow","hex":"#FFDF00"},{"name":"Honey Gold","hex":"#E6B800"},{"name":"Harvest Gold","hex":"#DA9100"},{"name":"Antique Gold","hex":"#C9A227"},{"name":"Old Gold","hex":"#CFB53B"},{"name":"Metallic Gold","hex":"#D4AF37"},{"name":"Satin Gold","hex":"#CBA135"},{"name":"Rich Gold","hex":"#B8860B"},{"name":"Dark Gold","hex":"#AA6C39"},{"name":"Bronze Gold","hex":"#996515"},{"name":"Deep Gold","hex":"#806000"}]},{"family":"Silver","colors":[{"name":"White Silver","hex":"#F5F5F5"},{"name":"Pearl Silver","hex":"#EAEAEA"},{"name":"Platinum","hex":"#E5E4E2"},{"name":"Light Silver","hex":"#D9D9D9"},{"name":"Classic Silver","hex":"#C0C0C0"},{"name":"Sterling Silver","hex":"#BFC1C2"},{"name":"Cool Silver","hex":"#BCC6CC"},{"name":"Moonlight Silver","hex":"#C4C9D0"},{"name":"Metallic Silver","hex":"#A8A9AD"},{"name":"Pewter","hex":"#899499"},{"name":"Slate Silver","hex":"#708090"},{"name":"Antique Silver","hex":"#848482"},{"name":"Gunmetal","hex":"#2A3439"},{"name":"Dark Silver","hex":"#71797E"},{"name":"Charcoal Silver","hex":"#53565A"}]},{"family":"Copper","colors":[{"name":"Pale Copper","hex":"#EDC9AF"},{"name":"Rose Copper","hex":"#B76E79"},{"name":"Peach Copper","hex":"#DA9F82"},{"name":"Light Copper","hex":"#DA8A67"},{"name":"Classic Copper","hex":"#B87333"},{"name":"Metallic Copper","hex":"#C47A44"},{"name":"Penny Copper","hex":"#AD6F3B"},{"name":"Burnished Copper","hex":"#A46645"},{"name":"Antique Copper","hex":"#9B6A4F"},{"name":"Red Copper","hex":"#CB6D51"},{"name":"Rust Copper","hex":"#B7410E"},{"name":"Dark Copper","hex":"#8C4A2F"},{"name":"Deep Copper","hex":"#7C482B"},{"name":"Chocolate Copper","hex":"#704214"},{"name":"Aged Copper","hex":"#6F7B68"}]}];
  const colors=groups.flatMap(g=>g.colors.map(c=>({...c,family:g.family})));
  const byHex=new Map(colors.map(c=>[c.hex,c]));
  const DEFAULT='#F7E7CE';
  const previews={"Welcome to Bulletin": "#F7E7CE", "One object, many contexts": "#9966CC", "Research reference": "#BFC1C2", "Example event scrap": "#9CAF88"};
  const normalized=value=>String(value||'').trim().toUpperCase();
  const valid=value=>byHex.has(normalized(value))?normalized(value):DEFAULT;
  const has=value=>byHex.has(normalized(value));
  function fallbackFor(seed){
    const s=String(seed||'');let n=0;
    for(let i=0;i<s.length;i++)n=(Math.imul(n,31)+s.charCodeAt(i))>>>0;
    return colors[n%colors.length].hex;
  }
  function previewFor(title){return previews[String(title||'')]||null;}
  function contrast(hex){
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    const luminance=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
    return luminance>.179?'#172219':'#FFFFFF';
  }
  function colorStyle(placement){
    const bg=valid(placement?.noteColor);
    return `--bulletin-scrap-color:${bg};--bulletin-note-color:${bg};--bulletin-scrap-ink:${contrast(bg)};`;
  }
  function swatchesHtml(value){
    const active=valid(value);
    return groups.map(g=>`<div class="bulletin-palette-label">${g.family}</div><div class="bulletin-note-color-grid" role="group" aria-label="${g.family} Bulletin post colors">${g.colors.map(c=>`<button class="bulletin-color-swatch" type="button" data-postit-color="${c.hex}" style="background:${c.hex}!important" title="${c.name} (${c.hex})" aria-label="${g.family}: ${c.name}, ${c.hex}" aria-pressed="${active===c.hex}"></button>`).join('')}</div>`).join('');
  }
  function optionsHtml(){return groups.map(g=>`<optgroup label="${g.family}">${g.colors.map(c=>`<option value="${c.hex}" ${c.hex===DEFAULT?'selected':''}>${c.name} (${c.hex})</option>`).join('')}</optgroup>`).join('');}
  window.BulletinPostitColors=Object.freeze({valid,has,fallbackFor,previewFor,contrast,colorStyle,swatchesHtml,optionsHtml,colors:()=>colors.map(c=>({...c}))});
})();
