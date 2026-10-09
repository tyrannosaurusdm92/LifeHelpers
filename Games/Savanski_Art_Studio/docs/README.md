# Savanski Studio

Savanski is a single-page browser application containing **Art Studio** and **3D Editor**. Open `studio.html` from a static web host such as GitHub Pages, or use a local web server for development.

## Entry point and layout

- One HTML entry point: `studio.html`.
- Home / Projects is the authority for creating, importing, continuing, renaming, duplicating, deleting, restoring, and permanently deleting projects.
- Desktop target shell: 1915 px wide.
- Header/title strip: 58 px high.
- Active Art or 3D toolbar: 80 px high.
- Active editing viewport: 647 px high.
- Art Studio and 3D Editor share the same viewport footprint.
- The 3D Editor has no visible static left/right button panels; those engine controls are represented in the existing 3D toolbar windows.

## Toolbar/menu ownership

`css/toolbar_menus.css` and `js/toolbar_menu.js` are the authoritative Art Studio / 3D Editor toolbar-menu implementation. Additional professional capabilities are appended **inside those existing panels** by the professional modules. No second toolbar/menu system is created.

## Art Studio

Art Studio includes layered raster editing, editable shapes/text/images/brush objects, drawing and retouch brushes, selection and perceptual color-range tools, precision masks, background/color erasing, transforms, crop/perspective, collage/layout, color wheel and harmony/gamut tools, curves/selective color, lighting/glow/shadow/reflection/motes effects, filters, arbitrary canvas resize, layer resize, text styling, presets, and export.

## 3D Editor

3D Editor includes mesh creation/import/export, transform/view tools, sculpting, masks and symmetry, topology inspection/repair helpers, texture and vertex painting, physical materials, lighting/shadows, armature generation, automatic and manual skin weighting, bone posing, CCD inverse kinematics, keyframe animation, motion paths, and animated GLB export.

A representative organic workflow is:

**Home → 3D Paint / Sculpt-Ready Ball → Mirror Paint → Build Volume → sculpt/refine → UV prep → surface paint/material/light → Bubble Rig → refine weights → pose/IK → keyframes → animated export.**

Curved Bubble Rig connectors can also be converted into actual intermediate joints/bones before binding, so tails, spines, necks, wings, and tentacles can follow their visible rig path.

## Projects

Projects must be created or opened from Home. Home supports:

- New Art project.
- New 3D project: Empty Scene, Sculpt-Ready Ball, or Cat Blockout.
- Art and 3D import from Home.
- Continue saved project.
- Rename.
- Duplicate.
- Soft delete with confirmation.
- Recently Deleted restore.
- Permanent delete with confirmation.
- Empty Trash with confirmation.

Art canvas dimensions can be changed after project creation; the starting canvas size is not a permanent image-size lock.

## Account, storage, and Settings

Savanski uses the tested external backend at:

`https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`

The backend source is **not bundled or replaced**. Settings is available from Home and from the shared editor header immediately left of the light/dark toggle. It provides supported account/session controls, backend storage status, Stripe-backed storage purchase/claim controls, and browser-install state.

The current backend exposes signed-in password change but does not advertise forgotten-password code/reset actions. Those recovery controls remain visibly disabled rather than pretending a code was sent.

## Browser / install metadata

`assets/app/manifest.webmanifest`, the existing bundled icons, root `service-worker.js`, and `js/pwa-runtime.js` provide the browser/PWA install layer. On HTTPS hosts such as GitHub Pages, supported browsers can install Savanski to mobile/tablet home screens or desktop app launchers. The installed app still launches Home / Projects. Savanski does not bundle Electron, Windows batch files, `.app` packages, or another native wrapper.

## WebAssembly

All shipped WebAssembly binaries live in `script/`. JavaScript wrappers live in `js/`. No C/C++/Python source is included in the release package.

## Required package structure

```text
studio.html
service-worker.js   # root-scoped PWA worker
js/
css/
script/        # .wasm only
assets/
  images/
  app/
  audio/
json/
docs/
```

There are no nested folders under `js`, `css`, `script`, `json`, or `docs`.


## Professional Pass 8
Savanski now includes surface-snapped manual retopology / Poly Build, sculpt-mask / Face-Set-aware pose-region deformation, editable vector Pen/Bézier paths with selection/mask conversion, and content-aware seam-carving layer scale. These are injected into the existing Geometry, Sculpt, Shapes, and Transform windows; no new toolbar or menu family is introduced.
