# CSS Organization and Toolbar JavaScript Map

This merged build uses **Savanski_Authoritative** as the sole runtime authority for toolbar/menu behavior and presentation.

## Toolbar/menu ownership — authoritative only

### `toolbar_menus.css`
Owns all visible Art Studio and 3D Editor toolbar/menu presentation, including:

- Art Studio top toolbar and pop-out tool panels
- 3D Editor top toolbar and pop-out tool panels
- resizable/pinnable toolbar windows and font menus
- Art Studio and 3D toolbar-window presentation without visible viewport tool rails
- hidden engine-compatibility hooks required by mature Art/3D runtime code (not viewport controls)
- editor title strip and Studio / 3D Editor workspace tabs
- toolbar identity palette and editor-only responsive rules

Home/project-launcher presentation is intentionally not owned here.

### `toolbar_menu.js`
Owns the only allowed toolbar/menu runtime implementation, including:

- Art Studio and 3D Editor category open/close behavior
- pop-out panel positioning, pinning, dragging, and resizing
- toolkit loader behavior
- toolbar action/control routing into the existing Studio and Uniform 3D engines
- font picker menus
- toolbar state synchronization
- Studio / 3D toolbar visibility coordination
- compatibility routing to retained hidden command banks where required by the mature engines

No alternate `savanski-toolbar-integration.js` or `savanski-mode-tabs.js` implementation is present in this build.

## Non-toolbar CSS ownership

### `css/studio.css`
Owns the non-toolbar Savanski shell and Art Studio workspace styling, including Home/project launcher, canvas workspace, layers, status surfaces, notifications, and host integration. Toolbar/menu presentation has been removed from this file and is owned by `toolbar_menus.css`.

### `css/uniform3d-embedded.css`
Provides the embedded 3D Editor workspace styling used by the authoritative single-document build.

### `css/uniform3d-studio.css`, `css/uniform3d-palette.css`, `css/uniform3d-responsive.css`
Provide the Uniform 3D editor's supporting workspace, palette, and responsive rules. They are not alternate toolbar implementations.

### `css/advanced-objects.css` and `css/preset-catalog.css`
Own their feature-specific Art Studio presentation and do not control the toolbar shell.

## Shell/workspace ownership

### `js/single-shell.js`
Owns shared shell/workspace coordination outside the toolbar implementation, including Home/editor shell transitions. It does not replace `toolbar_menu.js`.

### `js/studio-ui.js`
Owns the mature Art Studio engine UI plumbing. Toolbar/menu events reach it through the authoritative toolbar bridge.

### Uniform 3D JavaScript
`js/uniform3d-*.js` owns the 3D editing engine, scene, sculpt, paint, avatar, capture, import/export, and related runtime behavior. Toolbar/menu presentation and routing remain owned by the top-level authoritative toolbar files.

## Superseded branch files intentionally excluded

The CSS-reorganized source branch contained older/superseded shell paths. They are intentionally **not** included in this merged runtime:

- `js/savanski-toolbar-integration.js`
- `js/savanski-mode-tabs.js`
- `js/savanski-shell-bridge.js`
- `js/savanski-project-manager.js`
- `js/savanski-extra-image-tools.js`
- `js/three-workspace.js`
- `css/three-editor-retro.css`

Their relevant functionality is either already absorbed by the authoritative build or replaced by its current Studio/Uniform 3D architecture. Keeping them would create duplicate ownership or obsolete code paths.
