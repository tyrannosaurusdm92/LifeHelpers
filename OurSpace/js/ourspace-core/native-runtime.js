(()=>{'use strict';
const Native={modules:OS_MODULE_DOCUMENTS,active:new Map(),seq:0,keys:new Set(),errors:[],currentProfile:document.documentElement.dataset.profile||'william'};
window.OurSpaceNative=Native;
const NEUTRAL=['#D1FFFF','#00FFFF','#FFF600','#EC5800','#008484','#421900','#FFFDC7','#009B9B','#FFFFFF'];
const stormCss=`
/* OurSpace native-module Lightning Storm contract */
html{--bg:#D1FFFF;--bg2:#9EFFFF;--surface:#FFFFFF;--surface2:#FFFFFF;--ink:#000000;--text:#000000;--muted:#421900;--accent:#00FFFF;--accent2:#FFF600;--accent3:#E0FFFF;--dark-accent:#008484;--line:#009B9B;--divider:#009B9B;--warm:#FFFFFF;--header-bg:#421900;--header-text:#FFFDC7;--primary-bg:#00FFFF;--primary-fg:#000;--primary-border:#009B9B;--secondary-bg:#EC5800;--secondary-fg:#000;--secondary-border:#009B9B;--selected:#FFF600;--focus:#005E5E;--local-nav:#fff;--local-nav-text:#000;--master-bg:#421900;--master-text:#FFFDC7;--footer-bg:#421900;--footer-line:#009B9B;--storm-cyan:#00FFFF;--storm-orange:#EC5800;--accent-strong:#008484;--accent-soft:#EC5800;--surface-3:#E0FFFF;--page:#D1FFFF;--ink-soft:#421900;--inverse:#FFFDC7;--os-color-line:#009B9B;--body-font:Oxanium,sans-serif;--display-font:Oxanium,sans-serif;--radius:18px;--button-radius:14px;--component-radius:18px;--card-radius:18px;--control-radius:14px;--entry-radius:3px;--shadow:7px 7px 0 rgba(113,42,0,.35);color-scheme:light;display:block;width:100%;height:auto;}
body{width:100%;min-width:0;min-height:0;max-width:100%;margin:0;overflow-x:clip;box-sizing:border-box;background-color:#D1FFFF;color:#000;font-family:Oxanium,sans-serif!important;}
html,body,body *:not(svg):not(path):not(text){font-family:Oxanium,sans-serif!important;box-sizing:border-box;}
body :is(input,textarea,select){background:#FFFFFF;color:#000;border:2px solid #009B9B;border-radius:3px;min-width:0;max-width:100%;}
body :is(button,.button,.file-button,.mini-upload,[role=button]){border-radius:14px;border:2px solid #009B9B;background:#00FFFF;color:#000;box-shadow:none;min-height:38px;max-width:100%;}
body :is(button,.button):is(.secondary,[data-variant=secondary]){background:#EC5800;color:#000;border-color:#AA3F00;}
body :is(button,.button):is(.dark,[data-variant=dark]){background:#421900;color:#FFFDC7;border-color:#009B9B;}
body :is(.module-hd,.card-title,.window-header,.oscom-header,.section-head,.section-title,.panel-hd,.toolbar-header){background:#421900;color:#FFFDC7;border-bottom:2px solid #009B9B;border-radius:18px 18px 0 0;}
body :is(.module-hd,.card-title,.window-header,.oscom-header,.section-head,.section-title,.panel-hd,.toolbar-header) :is(h1,h2,h3,span,b,strong){color:#FFFDC7;text-shadow:none}
body :is(.module,.card,.panel,.window,.identity-summary,.utility-card,.music-card,.profile-image-shell,.pin-card,.news-card,.social-post,.oscom-panel,.oscom-section){border:2px solid #009B9B;border-radius:18px;background:#FFFFFF;color:#000;box-shadow:5px 5px 0 rgba(113,42,0,.24);min-width:0;max-width:100%;}
body :is(.module-body,.card-body,.window-body,.panel-body){background:#FFFFFF;color:#000}
body :is(.main-header,.footer,.retro-footer,.site-footer){background:#421900;color:#FFFDC7;border-color:#009B9B}
body :is(.main-header,.footer,.retro-footer,.site-footer) :is(span,h1,h2,h3,p,small,b,strong){color:#FFFDC7}
body :is(.jump-nav,.floating-nav) :is(.jump-link,.jump-tab,.floating-nav-toggle){border-radius:14px}
body :is(.badge,.tag,.interest-pill,.chip){background:#E0FFFF;color:#000;border:1px solid #009B9B}
body :is(.table-wrap,.table-scroll,table){max-width:100%;overflow-x:auto}
body :is(th,.table-header){background:#421900;color:#FFFDC7}
body a{color:#008484}
body :is(button,a,input,textarea,select,[tabindex]):focus-visible{outline:3px solid #005E5E!important;outline-offset:3px}
body img,body video,body canvas,body audio{max-width:100%;object-fit:contain;filter:none!important}
body :is(.gallery-viewer,.modal,.dialog,.popover,.popup,.menu,.menu-surface,.editor-modal){max-width:100vw;max-height:100dvh}
.os-nested-native{width:100%;min-width:0;min-height:270px;display:block;position:relative;}
.os-native-news-screen{width:100%;min-height:200px;background:#FFFFFF;color:#000;border:2px solid #009B9B;border-radius:18px;padding:14px;overflow:auto}
.os-native-news-screen a{overflow-wrap:anywhere}
body .record-body{min-width:0}body #recordPlayerFrame{width:100%;height:auto!important;min-height:430px}body #ourspaceBulletinFrame{width:100%;height:auto!important;min-height:540px}
body .page-content-container{grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:14px;max-width:100%;}
body .master-container{width:100%;max-width:100%;min-width:0;}
body .site-main,body .site-sidebar{min-width:0;max-width:100%}
body .pin-grid{columns:3 155px}
body .link-list,body .project-grid,body .picture-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))}
@media(max-width:820px){body .page-content-container{grid-template-columns:minmax(0,245px) minmax(0,1fr)}body .pin-grid{columns:2 120px}}
@media(max-width:610px){body .page-content-container{display:grid;grid-template-columns:minmax(0,1fr)!important;gap:10px}body .site-sidebar,body .site-main{grid-column:1/-1}body .search-bar{grid-template-columns:1fr;gap:7px}body .pin-grid{columns:2 115px}body .editor-grid,body .form-grid{grid-template-columns:1fr}body .music-controls{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
const stormResponsiveCss=`
/* Full Lightning Storm native-module responsive / page Design overlay. Source art and media remain untouched. */
:host{display:block;min-width:0;max-width:100%;container-type:inline-size;--os-surface:#FFFFFF;--os-panel-header:#421900;--os-panel-ink:#000000;--os-stroke:#009B9B;--os-action:#00FFFF;--os-action-secondary:#EC5800;--os-link:#008484;--os-footer:#421900;--os-focus:#005E5E;}
.os-native-document{--surface:var(--os-surface);--surface2:var(--os-surface);--panel-bg:var(--os-surface);--panel-soft:var(--os-surface);--header-bg:var(--os-panel-header);--ink:var(--os-panel-ink);--line:var(--os-stroke);--accent:var(--os-action);--primary-bg:var(--os-action);--secondary-bg:var(--os-action-secondary)}
.os-native-body{overflow-wrap:anywhere;min-width:0;max-width:100%;background:transparent!important;color:var(--os-panel-ink,#000)!important;}
.os-native-body :is(.module,.card,.panel,.window,.identity-summary,.utility-card,.music-card,.profile-image-shell,.pin-card,.news-card,.social-post,.oscom-panel,.oscom-section,.post,.site-card,.gallery-item){background:var(--os-surface,#FFFFFF)!important;border-color:var(--os-stroke,#009B9B)!important;color:var(--os-panel-ink,#000)!important;border-radius:18px!important;min-width:0;max-width:100%;}
.os-native-body :is(.module-body,.card-body,.window-body,.panel-body,.editor-box){background:var(--os-surface,#FFFFFF)!important;color:var(--os-panel-ink,#000)!important;}
.os-native-body :is(.module-hd,.card-title,.window-header,.oscom-header,.section-head,.section-title,.panel-hd,.toolbar-header){background:var(--os-panel-header,#421900)!important;color:#FFFDC7!important;border-color:var(--os-stroke,#009B9B)!important;}
.os-native-body :is(.main-header,.footer,.retro-footer,.site-footer){background:var(--os-footer,#421900)!important;color:#FFFDC7!important;border-color:var(--os-stroke,#009B9B)!important;}
.os-native-body :is(button,.button,.file-button,.mini-upload,[role=button]):not(.ghost):not(.secondary):not(.dark){background:var(--os-action,#00FFFF)!important;color:#000!important;border-color:var(--os-stroke,#009B9B)!important;border-radius:14px!important;}
.os-native-body :is(button,.button).secondary{background:var(--os-action-secondary,#EC5800)!important;color:#000!important;}
.os-native-body :is(input,textarea,select){border-color:var(--os-stroke,#009B9B)!important;min-width:0;max-width:100%;font-family:Oxanium,sans-serif!important;}
.os-native-body a{color:var(--os-link,#008484)!important;overflow-wrap:anywhere;}
.os-native-body :is(button,a,input,select,textarea,[tabindex]):focus-visible{outline-color:var(--os-focus,#005E5E)!important;}
.os-native-body img,.os-native-body video,.os-native-body canvas{max-width:100%;height:auto;object-fit:contain;filter:none!important;}
.os-native-body :is(.page-content-container,.viewer-shell,.oscom-layout,.grid,.gallery,.project-grid,.card-grid,.collection-form){max-width:100%;min-width:0;}
.os-native-body :is(.field,.card,.window,.module,.editor-box,.column,.pane){min-width:0;overflow-wrap:anywhere;}
.os-native-body :is(input,textarea,select,button){font-size:clamp(13px,1.1em,17px);}
.os-native-body :is(.modal,.popover,.popup,.menu,.dialog){max-width:min(96vw,900px);max-height:90dvh;overflow:auto;}
@container(max-width:820px){.os-native-body :is(.page-content-container,.oscom-layout,.layout-grid,.household-grid){grid-template-columns:minmax(0,1fr)!important;gap:12px;}.os-native-body :is(.grid-4,.grid-3,.card-grid,.editor-grid){grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))!important;}}
@container(max-width:520px){.os-native-body :is(.page-content-container,.layout-grid,.grid-4,.grid-3,.grid-2,.card-grid,.editor-grid,.form-grid,.two-col,.collection-form,.oscom-layout){grid-template-columns:minmax(0,1fr)!important;}.os-native-body :is(button,.button){min-height:42px;white-space:normal;text-align:center;}.os-native-body .pin-grid{columns:1 auto!important;}}
@media(prefers-reduced-motion:reduce){.os-native-body *, .os-native-body *::before,.os-native-body *::after{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;
const osNativeFluidResizingCss="\\n/* Fluid card resizing for native page modules; preserves record player and media geometry. */\n.os-native-body{min-width:0;max-width:100%;overflow-wrap:anywhere}\n.os-native-body :is(.grid-2,.grid-3,.grid-4,.two-col,.three-col,.form-grid,.field-grid,.picture-grid,.project-grid,.card-grid){max-width:100%;min-width:0}\n.os-native-body :is(.module,.card,.panel,.window,.identity-summary,.utility-card,.music-card,.profile-image-shell,.pin-card,.news-card,.social-post,.post,.project-card,.notice-card){min-width:0;max-width:100%;overflow-wrap:anywhere}\n.os-native-body :is(.table-wrap,.table-scroll){overflow-x:auto;max-width:100%}\n.os-native-body :is(.music-card,.music-layout,.record-player,.record-body,.widget-stage){min-width:0;max-width:100%}\n.os-native-body img,.os-native-body video,.os-native-body canvas{max-width:100%;object-fit:contain}\n.os-sizing-surface{position:relative!important;max-width:100%;overflow:visible!important;overflow-wrap:anywhere}\n.os-sizing-surface>.os-card-resize-grip{position:absolute!important;bottom:4px!important;right:4px!important;top:auto!important;left:auto!important;width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;padding:0!important;background:#FFF600!important;color:#421900!important;border:1px solid #009B9B!important;border-radius:6px!important;cursor:nwse-resize!important;touch-action:none!important;z-index:9;opacity:.38;display:grid!important;place-items:center!important;font:900 15px/1 Oxanium,sans-serif!important;box-shadow:none!important}\n.os-sizing-surface:hover>.os-card-resize-grip,.os-sizing-surface:focus-within>.os-card-resize-grip{opacity:1}\n@container(max-width:610px){.os-sizing-surface{width:100%!important;min-height:unset!important}.os-sizing-surface>.os-card-resize-grip{opacity:.95}}\n";
const fallbackMemory=new Map();
function storageFor(profile){return {getItem:k=>{try{return window.localStorage.getItem(k)}catch(_){return fallbackMemory.get(k)??null}},setItem:(k,v)=>{try{return window.localStorage.setItem(k,v)}catch(_){fallbackMemory.set(k,String(v))}},removeItem:k=>{try{return window.localStorage.removeItem(k)}catch(_){fallbackMemory.delete(k)}},key:i=>{try{return window.localStorage.key(i)}catch(_){return Array.from(fallbackMemory.keys())[i]||null}},get length(){try{return window.localStorage.length}catch(_){return fallbackMemory.size}}};}
const safeSession={getItem:k=>{try{return sessionStorage.getItem(k)}catch(_){return null}},setItem:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(_){}},removeItem:k=>{try{sessionStorage.removeItem(k)}catch(_){}}};

const recordContainerFixCss="\n/* This profile record player adapts to the WIDTH OF ITS OWN SLOT, not the browser. */\n.widget-stage{container:os-turntable / inline-size;display:block;width:100%;min-width:0;max-width:100%;padding:4px!important;}\n.retro-player{width:100%;max-width:100%;min-width:0;}\n@container os-turntable (max-width:860px){\n .deck-panel{grid-template-columns:minmax(0,1fr);gap:12px;}\n .turntable-panel{min-height:310px;}\n .display-panel{min-height:285px;}\n .platter-wrap{left:12%;width:min(70%,310px);}\n .tonearm{right:6%;width:38%;}\n}\n@container os-turntable (max-width:540px){\n .retro-player{padding:9px;border-radius:17px;}\n .retro-player::before,.retro-player::after{width:11px;height:11px;top:6px;}\n .retro-player::before{left:6px}.retro-player::after{right:6px}\n .deck-panel{grid-template-columns:minmax(0,1fr);gap:9px;padding:8px;border-width:2px;border-radius:14px;}\n .turntable-panel{height:clamp(215px,78cqw,275px);min-height:215px;overflow:hidden;}\n .platter-wrap{top:13px;left:15%;width:min(71%,205px);}\n .tonearm{top:10px;right:1%;width:38%;height:65%;transform:scale(.64);transform-origin:top right;}\n .load-cluster{left:3px;top:9px;gap:4px;}.power-led{width:10px;height:10px;}\n .load-knob{width:33px;height:33px;}\n .speaker-slots{display:none}.decor-knob{width:36px;height:36px;bottom:5px;right:1%;}\n .display-panel{display:grid;grid-template-rows:auto auto minmax(115px,1fr);min-height:235px;gap:7px;padding:8px;border-radius:12px;}\n .metadata-row{grid-template-columns:51px minmax(0,1fr);gap:5px;}\n .metadata-label{font-size:11px;letter-spacing:0;overflow-wrap:break-word;}\n .metadata-value{font-size:11px;min-height:32px;border-radius:6px;padding:5px 7px;min-width:0;overflow-wrap:anywhere;}\n .waveform-frame{min-height:120px;border-radius:10px;}\n #waveformCanvas{inset:8px 7px 27px;width:calc(100% - 14px);height:calc(100% - 35px);}\n .time-readout{font-size:10px;bottom:6px}.time-current{left:8px}.time-duration{right:8px}\n .transport{margin-top:10px;min-height:58px;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:6px 3px;border-radius:13px;}\n .transport-button{width:min(100%,38px);height:38px;padding:0;border-width:1px;min-width:0;}\n .play-button{width:min(100%,46px);height:46px;}\n .transport-button>span:first-child,.transport-button:not(.skip-button)>span{font-size:17px;}\n .skip-arrow{font-size:21px}.skip-number{font-size:10px;margin-top:4px;}\n}\n@container os-turntable (max-width:260px){\n .retro-player{padding:6px}.deck-panel{padding:6px}\n .turntable-panel{min-height:193px;height:193px}.platter-wrap{width:min(68%,157px);}\n .tonearm{transform:scale(.51)}\n .transport-button{width:31px;height:33px}.play-button{width:37px;height:37px}\n}\n\nhtml body #waveformSeek.waveform-hitarea{background:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important;min-height:0!important;max-width:none!important;opacity:1!important}\n";
const retroLongScrollCss=`
/* Original Retro Fusion two-rail long scrolling profile. No contained viewport. */
:host{display:block!important;contain:none!important;container-type:normal!important;
  height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;}
html.os-native-document,body.os-native-body{
  display:block!important;position:static!important;height:auto!important;min-height:0!important;
  max-height:none!important;overflow:visible!important;overflow-x:clip!important;
  width:100%!important;min-width:0!important;}
body.os-native-body .master-container{
  display:block!important;position:relative!important;overflow:visible!important;
  width:min(960px,calc(100% - 20px))!important;max-width:calc(100% - 20px)!important;
  height:auto!important;min-height:0!important;max-height:none!important;
  margin:0 auto 32px!important;
  background:var(--os-surface,#FFFFFF)!important;
  border:2px solid var(--os-stroke,#009B9B)!important;
  border-radius:18px!important;
}
body.os-native-body .page-content-container{
  display:grid!important;align-items:start!important;
  grid-template-columns:minmax(250px,320px) minmax(0,1fr)!important;
  gap:18px!important;padding:16px!important;
  width:100%!important;max-width:100%!important;
  height:auto!important;max-height:none!important;overflow:visible!important;
}
body.os-native-body .site-sidebar,body.os-native-body .site-main{
  display:block!important;width:auto!important;min-width:0!important;
  height:auto!important;max-height:none!important;overflow:visible!important;
  align-self:start!important;
}
body.os-native-body .site-main>.module{display:block;max-height:none;overflow:visible;break-inside:auto;margin-bottom:16px;}
body.os-native-body .site-main>.module .module-body{max-height:none;overflow:visible;}
body.os-native-body .site-sidebar>.identity-summary,body.os-native-body .site-sidebar>.utility-card,
body.os-native-body .site-sidebar>.music-card{max-height:none!important;}
body.os-native-body .main-header{border-bottom:3px solid var(--os-stroke,#009B9B)!important;}
body.os-native-body .footer{position:static!important;clear:both;width:100%;}
body.os-native-body .gallery-viewer{position:fixed!important;overflow:hidden!important;}
/* When genuinely narrow, stack in document order instead of crushing columns. */
@media(max-width:700px){
  body.os-native-body .page-content-container{grid-template-columns:minmax(0,1fr)!important;gap:14px!important;padding:12px!important;}
  body.os-native-body .site-sidebar,body.os-native-body .site-main{grid-column:1/-1!important;}
  body.os-native-body .site-sidebar{display:block!important;}
}
@media(max-width:450px){
  body.os-native-body .master-container{width:100%!important;max-width:100%!important;margin-bottom:18px!important;}
  body.os-native-body .page-content-container{padding:9px!important;}
}
`;

const osHouseholdLayoutFixCss=`
/* Household operates inside the page, without its own identity chooser. */
.os-native-body .skip-link{position:absolute!important;top:-9999px!important;left:-9999px!important;}
.os-native-body .topbar{width:100%!important;max-width:100%!important;min-height:70px!important;height:auto!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:10px!important;padding:10px 12px!important;overflow:visible!important;}
.os-native-body .topbar .brand{min-width:0!important;flex:0 1 auto!important;max-width:100%!important;}
.os-native-body .topbar .brand strong,.os-native-body .topbar .brand small{overflow-wrap:normal!important;word-break:normal!important;}
.os-native-body .topbar .top-search{flex:1 1 230px!important;min-width:min(210px,100%)!important;max-width:100%!important;}
.os-native-body .topbar .top-search{display:block!important;visibility:visible!important;}
.os-native-body .topbar .top-search input{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;}
.os-native-body .topbar .top-actions{display:flex!important;flex:0 1 auto!important;flex-wrap:wrap!important;justify-content:flex-end!important;align-items:center!important;gap:8px!important;min-width:0!important;max-width:100%!important;margin-left:auto!important;}
.os-native-body .topbar :is(.date-pill,.wallet-pill){min-width:0!important;max-width:100%!important;white-space:normal!important;}
.os-native-body .sidebar{min-width:0!important;max-width:100%!important;}
.os-native-body .nav{min-width:0;grid-template-columns:minmax(0,1fr);}
.os-native-body .nav button{min-width:0!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:7px!important;text-align:left!important;white-space:normal!important;line-height:1.3!important;}
.os-native-body .main-content,.os-native-body .content,.os-native-body .page-head{min-width:0!important;max-width:100%!important;}
.os-native-body :is(.page-actions,.action-row,.button-row,.toolbar,.top-actions){flex-wrap:wrap!important;max-width:100%!important;}
.os-native-body :is(.page-actions,.action-row,.button-row,.toolbar,.top-actions)>*{min-width:0;white-space:normal;overflow-wrap:normal;}
.os-native-body .profile-box{display:none!important;}
.os-native-body .os-retro-customizer-launcher{position:static!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;min-width:0!important;margin:12px 0 10px!important;display:flex!important;justify-content:center!important;}
.os-native-body .os-retro-customizer-launcher:focus-visible{outline:3px solid #FFF600!important;}

.os-native-body :is(.btn,.button,button){height:auto;min-height:38px;max-width:100%;}
.os-native-body :is(.modal,.modal-content,.dialog,.popover){max-width:min(96%,950px)!important;overflow:auto;}
@container(max-width:780px){
 .os-native-body .topbar{gap:8px!important;}
 .os-native-body .topbar .top-search{order:3!important;flex-basis:100%!important;}
 .os-native-body .topbar .top-actions{flex:1 1 auto!important;justify-content:flex-end!important;}
}
@container(max-width:470px){
 .os-native-body .topbar .brand{flex:1 1 100%!important;}
 .os-native-body .topbar .top-actions{order:2!important;margin-left:0!important;justify-content:flex-start!important;}
 .os-native-body .topbar .top-search{order:3!important;}
 .os-native-body .sidebar .nav{grid-template-columns:repeat(auto-fit,minmax(min(100%,145px),1fr))!important;}
}
`;
const osNativeExpandedProfileCss="\n/* Full available width with consistent long-scroll flow. */\nbody.os-native-body .master-container,body.os-native-body .retro13-donor-shell,\nbody.os-native-body .page-content-container,body.os-native-body .retro13-page-content{\n width:100%!important;max-width:100%!important;min-width:0!important;\n margin-left:0!important;margin-right:0!important;\n}\nbody.os-native-body .page-content-container,body.os-native-body .retro13-page-content{\n display:grid!important;grid-template-columns:minmax(294px, min(350px,30%)) minmax(0,1fr)!important;\n gap:clamp(16px,2vw,30px)!important;padding:clamp(10px,1.3vw,22px)!important;\n align-items:start!important;overflow:visible!important;\n}\nbody.os-native-body .site-sidebar,body.os-native-body .site-main{min-width:0!important;width:100%!important;max-width:100%!important;}\nbody.os-native-body .site-main .module{height:auto!important;min-width:0!important;max-width:100%!important;overflow:visible!important;}\nbody.os-native-body .site-main :is(.module-body,.submodule,.card-grid,.gallery-grid){min-width:0!important;max-width:100%!important;}\nbody.os-native-body .site-main .module-body{padding:clamp(12px,1.5vw,22px)!important;}\nbody.os-native-body :is(.page-content-container,.retro13-page-content) textarea{width:100%;max-width:100%;min-height:96px;resize:vertical;}\nbody.os-native-body .site-sidebar>h1{display:none!important;}\nbody.os-native-body .retro13-footer strong{display:none!important;}\n@media(max-width:850px){body.os-native-body .page-content-container,body.os-native-body .retro13-page-content{grid-template-columns:minmax(0,1fr)!important;}}\n";
const osAccessibleJournalStormCss="\n/* Lightning Storm scope for native accessible journal; user designs stay page-specific. */\nhtml.os-native-document,html.os-native-document[data-theme],html.os-native-document[data-theme=dark],html.os-native-document[data-theme=light]{\n --background:#D1FFFF!important;--surface:#FFFFFF!important;--surface-2:#F1FFFF!important;\n --surface-3:#D1FFFF!important;--text:#000000!important;--muted:#421900!important;\n --line:#008484!important;--line-strong:#009B9B!important;\n --profile-primary:#00FFFF!important;--profile-secondary:#EC5800!important;\n --profile-dark:#421900!important;--profile-soft:rgba(0,255,255,.12)!important;\n --shadow:4px 5px 0 rgba(66,25,0,.26)!important;\n color-scheme:light!important;\n --body-font:Oxanium,system-ui,sans-serif;\n}\nbody.os-native-body{color:#000!important;background:#D1FFFF!important;font-family:Oxanium,system-ui,sans-serif!important;overflow-x:hidden!important;}\nbody.os-native-body .app-shell{height:clamp(730px,83vh,1240px);min-height:730px;min-width:0;max-width:100%;grid-template-columns:minmax(192px,225px) minmax(0,1fr);border:2px solid #009B9B;border-radius:16px;overflow:hidden;background:#D1FFFF;}\nbody.os-native-body :is(.topbar,.sidebar,.workspace,.inspector,.panel,.note-card,.settings-view,.editor-shell,.dialog,.modal,.toast,.primary-nav,.library-tree){background-color:#FFFFFF;color:#000;}\nbody.os-native-body .topbar{background:#421900!important;color:#FFFDC7!important;border-bottom:3px solid #EC5800!important;}\nbody.os-native-body :is(.brand-product,.topbar .brand-lockup,.topbar .brand-lockup *){color:#FFFDC7!important;}\nbody.os-native-body .topbar :is(input,button){background:#FFFFFF;color:#000;}\nbody.os-native-body .sidebar{background:#E1FFFF!important;border-right:3px solid #008484!important;}\nbody.os-native-body .workspace{background:#FFFFFF!important;min-width:0!important;}\nbody.os-native-body .view-root{min-width:0!important;max-width:100%;}\nbody.os-native-body :is(.panel,.note-card,.note-card__open,.folder-row,.library-tree,.reader-panel,.setting-toggle,.editor-shell,.modal){border-color:#008484!important;background:#FFFFFF!important;color:#000!important;}\nbody.os-native-body :is(.nav-item.is-active,.primary-nav .is-active,.button--primary){background:#00FFFF!important;color:#000!important;border-color:#421900!important;}\nbody.os-native-body :is(.button--secondary,.button--ghost,.topbar__actions button){background:#FFF600!important;color:#000!important;border-color:#008484!important;}\nbody.os-native-body :is(.sidebar button,.workspace button){max-width:100%;min-width:0;overflow-wrap:normal;white-space:normal;}\nbody.os-native-body :is(input,textarea,select,.rich-editor){background:#FFFFFF!important;color:#000!important;border-color:#009B9B!important;}\nbody.os-native-body :is(a,.eyebrow,.section-heading h2){color:#712A00!important;}\nbody.os-native-body .view-header{background:#D1FFFF!important;border-bottom:2px solid #008484!important;color:#000!important;}\nbody.os-native-body .profile-switch,body.os-native-body #themeBtn,\nbody.os-native-body .settings-view .design-key,body.os-native-body #scanOwner,\nbody.os-native-body label:has(#qcOwner),body.os-native-body label:has(#folderOwner),\nbody.os-native-body label:has(#libFolderOwner),body.os-native-body label:has(#scanOwner){display:none!important;}\nbody.os-native-body .inspector{position:absolute;top:var(--topbar);right:0;bottom:0;}\nbody.os-native-body .modal-backdrop{position:fixed;z-index:2147482900;}\nbody.os-native-body .app-shell :is(img,video,canvas){max-width:100%;height:auto;}\n@media(max-width:800px){\n body.os-native-body .app-shell{height:auto;min-height:780px;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);grid-template-areas:'top' 'side' 'main';overflow:visible;}\n body.os-native-body .sidebar{max-height:none;display:block;}\n body.os-native-body .primary-nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(125px,100%),1fr));gap:5px;}\n body.os-native-body .workspace{min-height:620px;overflow:visible;}\n body.os-native-body :is(.notes-layout,.library-layout,.editor-shell,.scan-grid,.reader-grid){grid-template-columns:minmax(0,1fr);}\n body.os-native-body .topbar{min-height:65px;height:auto;flex-wrap:wrap;}\n}\n";
function setupModule(host,key,{parent=null}={}){
 const id=(++Native.seq);const profile=Native.currentProfile;
 let text=Native.modules[key];if(!text)return;
 if(key==='journal'){
  text=text.replaceAll('OurSpaceAccessibleJournalDB','OurSpaceAccessibleJournalDB_'+profile)
   .replaceAll('__OS_AUTHENTICATED_JOURNAL_PROFILE__',JSON.stringify(profile))
   .replaceAll('json/templates.json','');
 }

 if(key==='retro-profile'){
   const siteTitle=profile==='william'?'Dino Nerdzone':"Squishy's Cottage";
   text=text.replaceAll('OurSpace','OurSpace').replaceAll('@ourspace',profile==='william'?'@dino':'@squishy');
   text=text.replaceAll("displayName:'OurSpace'",'displayName:'+JSON.stringify(siteTitle));
   text=text.replaceAll("||'OurSpace'",'||'+JSON.stringify(siteTitle));
  }
  if(key==='store-jasper')text=text.replaceAll('Squishy Store',"Squishy's Store");
  if(key==='retro-profile'){text=text.replaceAll('retroOurSpaceProfile.','retroOurSpaceProfile.'+profile+'.').replaceAll('ourspace.retroFusion.extras.','ourspace.retroFusion.extras.'+profile+'.').replaceAll('bulletin_local_archive','bulletin_local_archive_'+profile).replaceAll('bulletin-state-v1','bulletin-state-v1-'+profile);}
 if(key==='retro-profile')text=text.replace("frame.srcdoc=document.getElementById('ourspaceBulletinPacked').innerHTML;","frame.dispatchEvent(new Event('load'));");
if(key==='retro-profile'){
  text=text.replaceAll('Your tags will appear here when you add them.','No tags yet.')
   .replaceAll('No bulletins posted yet. Write your first update.','No bulletins yet.')
   .replaceAll('Add Remaining Tag','Add Tag')
   .replaceAll('Move directly to a profile section.','')
   .replaceAll('Your labels, your identity','')
   .replaceAll('Junk journal studio','');
 }
const parsed=new DOMParser().parseFromString(text,'text/html');
 if(key==='retro-profile'){
  const labels={'Separate tags with commas.':'','Your tags will appear here when you add them.':'','Tags can be copied.':'','Junk journal studio':'','Your labels, your identity':'','Old-school wall':'','Earlier profile pins':'','Messages & updates':''};
  const walker=document.createTreeWalker(parsed.body,NodeFilter.SHOW_TEXT);const changes=[];
  while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement?.closest('script,style,template'))continue;const tx=node.textContent.trim();if(Object.prototype.hasOwnProperty.call(labels,tx))changes.push([node,labels[tx]]);}
  changes.forEach(([node,value])=>node.textContent=value);
 }

 if(key==='retro-profile'){for(const x of parsed.querySelectorAll('.logo [data-live="identity.displayName"]')){x.removeAttribute('data-live');x.textContent='OurSpace';}}
 const shadow=host.shadowRoot||host.attachShadow({mode:'open'});
 const docHtml=document.createElement('html');docHtml.className='os-native-document';
 for(const attr of Array.from(parsed.documentElement.attributes))docHtml.setAttribute(attr.name,attr.value);
 docHtml.dataset.profile=profile;docHtml.dataset.theme='lightning';
 const body=document.createElement('body');body.className='os-native-body';body.dataset.profileOwner=profile;
 for(const attr of Array.from(parsed.body.attributes))if(attr.name!=='class')body.setAttribute(attr.name,attr.value);
 body.className+=' '+(parsed.body.getAttribute('class')||'');
 // Move all markup, data blobs, forms and source media into a native Shadow DOM tree.
 // JavaScript text is executed below with a document facade scoped to this module.
 const queue=[];
 parsed.querySelectorAll('script').forEach(tag=>{
  if(tag.type&& !['','text/javascript','application/javascript','module'].includes(tag.type))return;
  if(tag.src){Native.errors.push(key+': external script omitted '+tag.src);tag.remove();return}
  queue.push(tag.textContent);tag.remove();
 });
 const css=[...parsed.querySelectorAll('style')].map(x=>x.textContent).join('\n').replace(/:root\b/g,'html');
 const osNativeGlassCss='\n/* OurSpace background-glass rules INSIDE a native module shadow root. */\n:host{background:transparent!important;background-color:transparent!important;background-image:none!important}\nhtml.os-native-document,body.os-native-body{\n background:transparent!important;background-color:transparent!important;background-image:none!important;\n}\nbody.os-native-body :is(.master-container,.page-content-container,.retro13-donor-shell,.retro13-page-content,\n .shell,.wrapper,.app-shell,.page-shell,.dashboard,.dashboard-content,.content-shell,\n .main-content,.main-panel,.page-container,.page-wrapper,.page-layout,.app-layout,\n .journal-app,.journal-shell,.journal-layout,.journal-main,.workspace,\n .sidebar,.site-sidebar,.site-main,.library-sidebar,.inspector,\n .module,.module-body,.module-subtitle,.module-content,.panel,.panel-body,.panel-content,.panel-inner,\n .window,.window-body,.card,.card-body,.note-card,.note-preview,.notes-panel,\n .note-list,.editor-shell,.library-tree,.folder-row,.reader-panel,.settings-view,\n .setting-toggle,.utility-card,.music-card,.identity-summary,.contact-box,.interests-box,\n .pin-card,.pinboard,.pinboard-panel,.board,.board-panel,.bulletin-board,.bulletin-card,\n .post,.social-post,.post-card,.news-card,.gallery-card,.gallery-panel,.gallery-grid,\n .retro-panel,.submodule,.section,.section-body,.section-panel,\n .feed-container,.feed-panel,.feed-card,.feed-section,.timeline,\n .household-panel,.household-card,.household-content,.tab-content,.tab-panel,.tab-pane,\n .visual-sidebar,.visual-library,.visual-panel,.visual-card,.visual-info,\n .oscom-wrap,.oscom-panel,.oscom-section,.oscom-sidebar,.oscom-main,.oscom-thread,\n .oscom-channel-list,.oscom-messages,.media-shell,.modal,.dialog,.popup,.drawer,\n .header-panel,.footer-panel,.record-bottom,.record-library){\n background:rgba(209,255,255,.25)!important;background-image:none!important;\n}\n/* Override imported static white backgrounds on the actual two-column profile. */\nbody.os-native-body :is(.master-container,.page-content-container,.retro13-page-content,\n .site-sidebar,.site-main,.module,.module-body,.panel,.card,.identity-summary,\n .bulletin-board,.pinboard,.editor-shell,.workspace,.journal-shell){\n background-color:rgba(255,255,255,.25)!important;\n}\nbody.os-native-body :is(.main-header,.topbar,.toolbar-header,.module-hd,.card-title,\n .panel-hd,.section-head,.section-title,.panel-header,.window-header,\n .header-bar,.site-footer,.footer,.retro-footer,.oscom-header,.oscom-topbar){\n background:rgba(66,25,0,.28)!important;background-image:none!important;\n}\nbody.os-native-body :is(.main-header,.topbar,.module-hd,.section-head,.section-title,.panel-header,\n .site-footer,.footer,.retro-footer){text-shadow:0 1px 1px rgba(0,0,0,.9)}\n/* Every form element, editor and actual data asset remains OPAQUE. */\nbody.os-native-body :is(input,textarea,select,[contenteditable="true"],.ProseMirror,\n .tiptap,.editor-content,.rich-editor,.edit-area,.note-editor,.note-editor__content,\n .journal-editor,.journal-textarea){background:#fff!important;background-image:none!important;opacity:1!important}\nbody.os-native-body :is(button,.button,.mini-upload,[role="button"],img,svg,canvas,video,audio,picture){opacity:1!important}\n/* The physical turntable artwork, vinyl and the readable waveform aren\'t overlays. */\nbody.os-native-body :is(.turntable,.turntable-body,.platter-wrap,.platter,.vinyl,.record-player,\n .record-deck,.record-stage,.waveform-frame,.waveform-canvas,.display-panel,\n .player-controls,.transport-controls,.metadata-value,.record-iframe,\n .record-disc,.tonearm,.record-window,.media-stage,.visual-stage,\n .video-stage,.image-viewer,.canvas-stage){\n opacity:1!important;\n}\n@media(prefers-reduced-transparency:reduce){\n body.os-native-body :is(.master-container,.module,.module-body,.panel,.card,.workspace,.sidebar,.note-card){\n background-color:rgba(255,255,255,.84)!important}\n}\n';
const style=document.createElement('style');style.textContent=css+'\n'+stormCss+'\n'+stormResponsiveCss+'\n'+osNativeFluidResizingCss+(key==='retro-profile'?'\n'+retroLongScrollCss:'')+(key==='record-native'?'\n'+recordContainerFixCss:'')+(key==='household'?'\n'+osHouseholdLayoutFixCss:'')+(key==='retro-profile'?'\n'+osNativeExpandedProfileCss:'')+(key==='journal'?'\n'+osAccessibleJournalStormCss:'')+(key==='record-native'?'':osNativeGlassCss);shadow.append(style);
 for(const el of Array.from(parsed.body.childNodes))body.append(document.importNode(el,true));
 docHtml.append(body);shadow.append(docHtml);
 // Keep a private document object. Modules use the real browser window / APIs but all selectors
 // and event listeners stay inside their native content rather than matching unrelated pages.
 let moduleWindow,facade;
 const intercept=(kind,callback,opts)=>{
  if(kind==='DOMContentLoaded'){queueMicrotask(()=>{try{callback.call(facade,new Event(kind))}catch(e){console.warn(key,kind,e)}});return}
  if(['click','input','change','keydown','keyup','pointerdown','pointerup','submit','focusin'].includes(kind)){shadow.addEventListener(kind,callback,opts);return}
  document.addEventListener(kind,callback,opts)
 };
 facade=new Proxy(document,{get(t,p){
  if(p==='documentElement')return docHtml;if(p==='body')return body;if(p==='head')return shadow;
  if(p==='readyState')return 'complete';if(p==='defaultView')return moduleWindow;
  if(p==='querySelector')return (q)=>shadow.querySelector(q);
  if(p==='querySelectorAll')return (q)=>shadow.querySelectorAll(q);
  if(p==='getElementById')return (id)=>shadow.getElementById(id);
  if(p==='getElementsByClassName')return (cl)=>shadow.querySelectorAll('.'+cl.split(' ').join('.'));
  if(p==='getElementsByTagName')return (tag)=>shadow.querySelectorAll(tag);
  if(p==='addEventListener')return intercept;
  if(p==='removeEventListener')return (kind,cb,opts)=>{shadow.removeEventListener(kind,cb,opts);document.removeEventListener(kind,cb,opts)};
  if(p==='activeElement')return shadow.activeElement||document.activeElement;
  const v=Reflect.get(t,p,t);return typeof v==='function'?v.bind(t):v;
 }});
 const bus={postMessage(data){
  if(parent){try{window.dispatchEvent(new MessageEvent('message',{data,source:parent.bus}))}catch(_){}} // nested record / bulletin response
  else if(data?.type==='ourspace-profile-footer-messenger-v1')footerMessenger(data.action);
 }};
 const privateVars={document:facade,parent:bus,top:bus,location:location};
 moduleWindow=new Proxy(window,{get(t,p){if(p in privateVars)return privateVars[p];if(p==='localStorage')return storageFor(profile);if(p==='sessionStorage')return safeSession;const v=Reflect.get(t,p,t);return typeof v==='function'&& !['Event','CustomEvent','MessageEvent','Array','Object','Promise','Date'].includes(p)?v.bind(t):v},set(t,p,v){if(p in privateVars){privateVars[p]=v;return true} t[p]=v;return true}});
 const record={key,host,shadow,body,doc:facade,win:moduleWindow,bus};Native.active.set(host,record);
 if(parent){Object.defineProperty(host,'contentWindow',{configurable:true,value:parent.bus});parent.parentRecord=record;}
 // Nested views are DOM components, not additional browsing contexts.
 if(key==='retro-profile'){
  for(const nested of Array.from(shadow.querySelectorAll('[data-native-panel]'))){
   const tag=nested.dataset.nativePanel;
   const nbus={postMessage(data){
    const target=Native.active.get(nested);
    if(target){try{window.dispatchEvent(new MessageEvent('message',{data,source:target.bus}))}catch(_){}}
   }};
   Object.defineProperty(nested,'contentWindow',{configurable:true,value:nbus});
   setupModule(nested,tag,{parent:{bus:nbus,origin:record}});
  }
 }
 for(const code of queue){if(!code.trim())continue;
  const token='osrt'+id+'_'+(++Native.seq);window.__osRuntimeTokens=window.__osRuntimeTokens||{};window.__osRuntimeTokens[token]=record;
  const scr=document.createElement('script');
  scr.textContent=`try{(function(document,window,localStorage,sessionStorage){\n${code}\n}).call(window.__osRuntimeTokens[${JSON.stringify(token)}].win,window.__osRuntimeTokens[${JSON.stringify(token)}].doc,window.__osRuntimeTokens[${JSON.stringify(token)}].win,window.__osRuntimeTokens[${JSON.stringify(token)}].win.localStorage,window.__osRuntimeTokens[${JSON.stringify(token)}].win.sessionStorage)}catch(e){window.OurSpaceNative.errors.push(${JSON.stringify(key)}+': '+(e.stack||e));console.error('OurSpace native module',${JSON.stringify(key)},e)}`;
  document.body.append(scr);scr.remove();
 }
 if(key==='retro-profile'){
   // Native record player receives its theme and selection events from profile, with no iframe.
   for(const nested of shadow.querySelectorAll('[data-native-panel]'))nested.dispatchEvent(new Event('load'));
 }
 window.dispatchEvent(new CustomEvent('ourspace:native-mounted',{detail:{host,key}}));
 return record;
}
function pageToKey(page){return page==='retrobuilder'?'retro-profile':page==='diary'||page==='store'?page+'-'+Native.currentProfile:page}
function mountPage(page){if(page==='portal'||page==='games'||page==='skills')return;const container=document.querySelector(`.site-page[data-page-id="${CSS.escape(page)}"] [data-embedded-module]`);if(!container)return;if(Native.active.has(container))return;setupModule(container,pageToKey(page));}
function footerMessenger(action){
 if(action==='page'){window.ourspaceNavigatePage?.('communication');return}
 const chat=window.ourspaceMessenger||window.MessengerPlugin?.instance;
 if(chat){try{if(action==='rooms')chat.togglePanel('rooms');else chat.openDirectMessage(Native.currentProfile==='william'?'jasper':'william');return}catch(e){console.warn(e)}}
 window.ourspaceNavigatePage?.('communication')
}
window.addEventListener('ourspace:page-active',e=>mountPage(e.detail.page));
window.addEventListener('ourspace:profile-switch',e=>{const profile=e.detail.profile;if(!['william','jasper'].includes(profile)||profile===Native.currentProfile)return;try{localStorage.setItem('ourspace.lightning.profileTemplate.active',profile)}catch(_){};window.parent.location.assign(new URL('assets/code/'+profile+'.html',document.baseURI).href+(window.parent.location.hash&&window.parent.location.hash!=='#portal'?window.parent.location.hash:'#retrobuilder'))});
window.addEventListener('ourspace:download',()=>{
 const clone=document.documentElement.cloneNode(true);
 clone.querySelectorAll('.os-jump-design-controls,[data-os-design-toggle]').forEach(n=>n.remove());
 clone.querySelectorAll('.os-resize-handle,.os-resize-controls').forEach(n=>n.remove());
 clone.querySelectorAll('[data-os-resize-ready]').forEach(n=>n.removeAttribute('data-os-resize-ready'));
 clone.querySelector('#messenger-plugin-root')?.replaceChildren();
 const blob=new Blob(['<!doctype html>\n'+clone.outerHTML],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='OurSpace_Full_Width_Profiles_Accessible_Journal_Lightning.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)
});
// Existing single-browser messenger uses a shared store and BroadcastChannel; no false remote connectivity.
const msgChan=('BroadcastChannel'in window)?new BroadcastChannel('ourspace-native-messenger'):null;
window.addEventListener('ourspace:messenger-outgoing',e=>{const data=e.detail;if(msgChan)msgChan.postMessage(data);try{const message={type:'ourspace-messenger-deliver-v1',envelope:data.envelope};window.dispatchEvent(new MessageEvent('message',{data:message,source:window}))}catch(_){}});
if(msgChan)msgChan.onmessage=e=>{if(e.data?.profile!==Native.currentProfile)window.dispatchEvent(new MessageEvent('message',{data:{type:'ourspace-messenger-deliver-v1',envelope:e.data.envelope},source:window}))};
// Replace the main profile's old postMessage footer relay with native Shadow-DOM events.
window.addEventListener('message',e=>{if(e.data?.type==='ourspace-profile-footer-messenger-v1')footerMessenger(e.data.action)});
function neutralPortal(){
 const portal=document.querySelector('#page-portal.is-active');const dock=document.querySelector('#messenger-plugin-root');if(dock)dock.style.display=portal?'none':'';
 const page=document.querySelector('.site-page.is-active');const pageId=page?.dataset.pageId||'portal';
 const siteName=Native.currentProfile==='william'?'Dino Nerdzone':"Squishy's Cottage";
 const storeName=Native.currentProfile==='william'?'Dino Store':"Squishy's Store";
 const displayName=pageId==='store'?storeName:siteName;
 const brand=document.querySelector('#personaBrand');if(brand)brand.textContent=portal?'':displayName;
 document.querySelectorAll('.os-suite-name').forEach(n=>{n.textContent=n.closest('#page-store')?storeName:siteName});
 const activeSection=page?.querySelector('.os-suite-section')?.textContent||'';
 const subtitle=document.querySelector('.site-tagline');if(subtitle)subtitle.textContent=portal?'Private spaces for William and Jasper.':(activeSection || 'OurSpace');
 const foot=document.querySelector('#osSuiteFooterName');if(foot)foot.textContent='OurSpace';
 const footDescription=document.querySelector('#osSuiteFooterDescription');if(footDescription)footDescription.textContent=portal?'Two private spaces.':'Part of OurSpace • '+activeSection;
 const storeHeading=document.querySelector('#page-store .page-title h1');if(storeHeading)storeHeading.textContent=storeName;
 document.title=portal?'OurSpace — Portal':('OurSpace — '+displayName+' · '+(activeSection||'Profile'));
}
window.addEventListener('ourspace:page-active',neutralPortal);
const initial=document.querySelector('.site-page.is-active')?.dataset.pageId;
if(initial)mountPage(initial);neutralPortal();
// Module scripts must not reintroduce browsing contexts. Only the Skills and external Games iframes are authorized.
const police=new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes){if(node.nodeType!==1)continue;
 const candidates=[...(node.matches?.('iframe')?[node]:[]),...node.querySelectorAll?.('iframe')||[]];
 for(const f of candidates)if(f.id!=='blankProofFrame' && !(f.id==='skillsBookFrame')){const div=document.createElement('div');div.className='os-native-news-screen';div.textContent='Embedded previews open directly from their source links.';f.replaceWith(div);Native.errors.push('Unexpected non-game iframe replaced');}
}});police.observe(document.documentElement,{subtree:true,childList:true});

// Per-user, per-page Design controls. The site owns layout and Jump positions; these edit cosmetics only.
const factoryImages={"william": {"retrobuilder": "https://wallpapers.com/images/high/t-rex-pictures-eb251ig4doau1p2y.webp", "household": "https://wallpapers.com/images/hd/dnd-dragon-in-the-mountain-p3cxbaskwh0xpawq.webp", "journal": "https://wallpapers.com/images/hd/steampunk-airships-above-clouds-jqu0w67hv7z2prs7.webp", "diary": "https://wallpapers.com/images/hd/steampunk-airships-above-clouds-jqu0w67hv7z2prs7.webp", "feed": "https://images.alphacoders.com/673/thumb-1920-673737.jpg", "skills": "https://wallpapers.com/images/high/various-dnd-rpg-dice-vutxn9bnfcj5hsm7.webp", "communication": "https://wallpapers.com/images/high/dragon-hunter-against-sea-dragon-jjwbshn84ltnewkd.webp", "audio": "https://wallpapers.com/images/high/cosmic-storm-nebula-with-swirling-clouds-and-distant-stars-w2d6me0v1jykusyu.webp", "visual": "https://wallpapers.com/images/high/t-rex-pictures-4946qyqpog7hsgby.webp", "games": "https://wallpapers.com/images/hd/steampunk-digital-fractal-96m9wxkpnsjy6ohf.webp", "store": "https://wallpapers.com/images/high/cosmic-storm-nebula-with-swirling-clouds-and-distant-stars-w2d6me0v1jykusyu.webp"}, "jasper": {"retrobuilder": "https://wallpapers.com/images/high/cottagecore-house-digital-art-h08728tn15rgscbp.webp", "household": "https://wallpapers.com/images/high/cottagecore-house-artwork-sztao33ct9x0n10r.webp", "journal": "https://wallpapers.com/images/high/mystical-tarot-hermit-and-crystals-aesthetic-jpg-f4fqa0odp32jjshv.webp", "diary": "https://wallpapers.com/images/high/witchy-tarot-cards-for-iphone-screens-onup9yxe4vkuey82.webp", "feed": "https://images7.alphacoders.com/418/thumb-1920-418195.jpg", "skills": "https://wallpapers.com/images/high/mystical-tarot-hermit-and-crystals-aesthetic-jpg-f4fqa0odp32jjshv.webp", "communication": "https://wallpapers.com/images/high/malibu-beach-sunrise-desktop-nmueexjebjnft1wn.webp", "audio": "https://wallpapers.com/images/high/arctic-orange-sunrise-qmkyi9q7rqsjaccs.webp", "visual": "https://wallpapers.com/images/high/summer-background-yfcdzb4xyiba2cuy.webp", "games": "https://wallpapers.com/images/high/arctic-orange-sunrise-qmkyi9q7rqsjaccs.webp", "store": "https://wallpapers.com/images/high/summer-background-yfcdzb4xyiba2cuy.webp"}};
const designDefaults={background:'#D1FFFF',surface:'#FFFFFF',header:'#421900',accent:'#00FFFF',secondary:'#EC5800',ink:'#000000',border:'#009B9B',link:'#008484',footer:'#421900',focus:'#005E5E',jumpBg:'#421900',jumpInk:'#FFFDC7',overlay:'#421900',image:'',fit:'cover',position:'center',repeat:'no-repeat'};
const designMemory=new Map();
const safeGet=(key)=>{try{return localStorage.getItem(key)}catch(_){return designMemory.get(key)||null}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch(_){designMemory.set(key,value)}};
const safeRemove=(key)=>{try{localStorage.removeItem(key)}catch(_){designMemory.delete(key)}};
const hexValid=s=>/^#[0-9a-f]{6}$/i.test(String(s||''));
const pageDesignKey=id=>`ourspace/user/${Native.currentProfile}/pages/${id}/design`;
function loadPageDesign(id){const factory={...designDefaults,image:factoryImages[Native.currentProfile]?.[id]||''};try{return {...factory,...JSON.parse(safeGet(pageDesignKey(id))||'{}')}}catch(_){return factory}}
function applyPageDesign(id){
 const page=document.querySelector(`.site-page[data-page-id="${CSS.escape(id)}"]`);if(!page||id==='portal')return;
 const d=loadPageDesign(id);
 const rgb=hexValid(d.overlay)?[1,3,5].map(i=>parseInt(d.overlay.slice(i,i+2),16)):[66,25,0];
 const tint=`rgba(${rgb.join(',')},0.25)`;
 const storm='linear-gradient(135deg,#D1FFFF 3%,#9EFFFF 25%,#FFF600 43%,#EC5800 54%,#00FFFF 74%,#008484 94%)';
 // Same background as the old outer-page Lightning gradient, not an inset section.
 // A transparent 25% overlay preserves the image without washing out content cards.
 const bgImage=d.image?`linear-gradient(${tint},${tint}),url(${JSON.stringify(d.image)}),${storm}`:storm;
 const vars={'--os-page-bg':d.background,'--os-page-image':'none','--os-surface':d.surface,'--os-panel-header':d.header,'--os-panel-ink':d.ink,'--os-stroke':d.border,'--os-action':d.accent,'--os-action-secondary':d.secondary,'--os-link':d.link,'--os-footer':d.footer,'--os-focus':d.focus,'--os-jump-bg':d.jumpBg,'--os-jump-ink':d.jumpInk};
 for(const [k,v] of Object.entries(vars))page.style.setProperty(k,v);
 // Wallpaper fit/position/repeat belong to the body field; not the panel.
 page.style.backgroundSize='auto';page.style.backgroundPosition='initial';page.style.backgroundRepeat='no-repeat';
 page.style.setProperty('--accent',d.accent);page.style.setProperty('--line',d.border);page.style.setProperty('--ink',d.ink);page.style.setProperty('--surface',d.surface);
 if(page.classList.contains('is-active')){
   const wall=document.body.style;
   wall.setProperty('--os-active-wallpaper-color',d.background);
   wall.setProperty('--os-active-wallpaper-image',bgImage);
   wall.setProperty('--os-active-wallpaper-size',d.image?`cover,${d.fit||'cover'},cover`:'cover');
   wall.setProperty('--os-active-wallpaper-position',d.image?`center,${d.position||'center'},center`:'center');
   wall.setProperty('--os-active-wallpaper-repeat',d.image?`no-repeat,${d.repeat||'no-repeat'},no-repeat`:'no-repeat');
 }

 const assign=(host)=>{if(!host?.shadowRoot)return;for(const [k,v] of Object.entries(vars))host.style.setProperty(k,v);
   const doc=host.shadowRoot.querySelector('html.os-native-document');if(doc){
    const remap={'--bg':d.background,'--surface':d.surface,'--surface2':d.surface,'--panel-bg':d.surface,'--accent':d.accent,'--storm-cyan':d.accent,'--header-bg':d.header,'--ink':d.ink,'--line':d.border,'--primary-bg':d.accent,'--primary-border':d.border,'--secondary-bg':d.secondary};
    for(const [k,v] of Object.entries({...vars,...remap}))doc.style.setProperty(k,v);
   }
   for(const child of host.shadowRoot.querySelectorAll('[data-native-panel],.os-native-module'))assign(child);
 };
 for(const host of page.querySelectorAll('.os-native-module'))assign(host);
 const panel=page.querySelector('.os-jump-design-controls');if(panel){
  panel.querySelectorAll('[data-color-key]').forEach(field=>{const val=d[field.dataset.colorKey];if(hexValid(val)&&document.activeElement!==field)field.value=val});
  const url=panel.querySelector('[data-background-url]');if(url&&document.activeElement!==url)url.value=d.image||'';
  for(const key of ['fit','position','repeat']){const c=panel.querySelector(`[data-background-${key}]`);if(c&&document.activeElement!==c)c.value=d[key]||''}
 }
}
function saveDesign(id,piece){const d=loadPageDesign(id);Object.assign(d,piece);safeSet(pageDesignKey(id),JSON.stringify(d));applyPageDesign(id)}
for(const nav of document.querySelectorAll('.jump-nav')){
 const id=nav.dataset.jumpNav;if(!id||id==='portal')continue;
 const panel=nav.querySelector('.jump-panel');if(!panel)continue;
 const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.dataset.osDesignToggle='';btn.textContent='Design';btn.setAttribute('aria-expanded','false');btn.dataset.designFor=id;btn.setAttribute('aria-label',`Customize ${id} page appearance`);
 const form=document.createElement('div');form.className='os-jump-design-controls';form.hidden=true;
 for(const [label,key] of [['Background','background'],['Surface','surface'],['Header','header'],['Primary button','accent'],['Secondary button','secondary'],['Text','ink'],['Border','border'],['Links','link'],['Footer','footer'],['Focus ring','focus'],['Jump bubble','jumpBg'],['Jump bubble text','jumpInk'],['Image overlay tint (25%)','overlay']]){
  const l=document.createElement('label');l.textContent=label;
  const pair=document.createElement('div');pair.className='os-color-pair';
  const wheel=document.createElement('input');wheel.type='color';wheel.dataset.colorKey=key;wheel.setAttribute('aria-label',label+' color wheel');
  const hex=document.createElement('input');hex.type='text';hex.dataset.colorKey=key;hex.maxLength=7;hex.setAttribute('aria-label',label+' HEX');hex.placeholder='#RRGGBB';
  function changed(value){if(!hexValid(value))return;saveDesign(id,{[key]:value.toUpperCase()});wheel.value=value;hex.value=value.toUpperCase()}
  wheel.addEventListener('input',()=>changed(wheel.value));hex.addEventListener('change',()=>changed(hex.value));
  pair.append(wheel,hex);l.append(pair);form.append(l);
 }
 for(const [title,key,choices] of [['Image fit','fit',['cover','contain','auto']],['Image position','position',['center','top','bottom','left','right']],['Image repeat','repeat',['no-repeat','repeat','repeat-x','repeat-y']]]){
 const f=document.createElement('label');f.textContent=title;const select=document.createElement('select');select.dataset['background'+key[0].toUpperCase()+key.slice(1)]='';
 for(const opt of choices){const el=document.createElement('option');el.value=opt;el.textContent=opt[0].toUpperCase()+opt.slice(1);select.append(el)}
 select.value=loadPageDesign(id)[key];select.addEventListener('change',()=>saveDesign(id,{[key]:select.value}));f.append(select);form.append(f)
 }
 const l=document.createElement('label');l.textContent='Background image URL';const url=document.createElement('input');url.type='url';url.dataset.backgroundUrl='';url.placeholder='Paste a direct image link';url.addEventListener('change',()=>{const u=url.value.trim();if(u&&!/^(https?:|data:image\/|blob:)/i.test(u)){url.setCustomValidity('Choose an HTTPS image link or an uploaded image');url.reportValidity();return}url.setCustomValidity('');saveDesign(id,{image:u})});l.append(url);form.append(l);
 const uploadLabel=document.createElement('label');uploadLabel.textContent='Upload background image';const upload=document.createElement('input');upload.type='file';upload.accept='image/*';upload.addEventListener('change',()=>{const f=upload.files?.[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>5_000_000){alert('Choose an image smaller than 5 MB.');upload.value='';return}const r=new FileReader();r.onload=()=>saveDesign(id,{image:r.result});r.readAsDataURL(f)});uploadLabel.append(upload);form.append(uploadLabel);
 const actions=document.createElement('div');actions.className='os-design-actions';
 const preset=document.createElement('button');preset.textContent='Save preset';preset.type='button';preset.addEventListener('click',()=>{const k=pageDesignKey(id)+'/presets';let a=[];try{a=JSON.parse(safeGet(k)||'[]')}catch(_){}a.push(loadPageDesign(id));a=a.slice(-10);safeSet(k,JSON.stringify(a));preset.textContent='Preset saved';setTimeout(()=>preset.textContent='Save preset',1000)});
 const restore=document.createElement('button');restore.textContent='Last preset';restore.type='button';restore.addEventListener('click',()=>{let a=[];try{a=JSON.parse(safeGet(pageDesignKey(id)+'/presets')||'[]')}catch(_){}if(a.length){safeSet(pageDesignKey(id),JSON.stringify(a[a.length-1]));applyPageDesign(id)}});
 const reset=document.createElement('button');reset.textContent='Reset colors';reset.type='button';reset.addEventListener('click',()=>{safeRemove(pageDesignKey(id));applyPageDesign(id)});
 const factoryImage=document.createElement('button');factoryImage.type='button';factoryImage.textContent='Original background';factoryImage.addEventListener('click',()=>saveDesign(id,{image:factoryImages[Native.currentProfile]?.[id]||'',fit:'cover',position:'center',repeat:'no-repeat'}));
 const favorite=document.createElement('button');favorite.type='button';favorite.textContent='Favorite';favorite.addEventListener('click',()=>{const key=pageDesignKey(id)+'/favorite';safeSet(key,JSON.stringify(loadPageDesign(id)));favorite.textContent='Favorite saved'});
 const loadFavorite=document.createElement('button');loadFavorite.type='button';loadFavorite.textContent='Use favorite';loadFavorite.addEventListener('click',()=>{try{const d=JSON.parse(safeGet(pageDesignKey(id)+'/favorite')||'null');if(d){safeSet(pageDesignKey(id),JSON.stringify(d));applyPageDesign(id)}}catch(_){}});
 actions.append(preset,restore,favorite,loadFavorite,factoryImage,reset);form.append(actions);panel.append(btn,form);
 btn.addEventListener('click',()=>{form.hidden=!form.hidden;btn.setAttribute('aria-expanded',String(!form.hidden));applyPageDesign(id)});
 applyPageDesign(id);
}
window.addEventListener('ourspace:page-active',e=>{applyPageDesign(e.detail.page)});
})();

