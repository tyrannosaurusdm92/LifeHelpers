# OurSpace Jump Nav — Sleeping Onyx Widget hook

The old Onyx Widget, CAT-astrophic Cuteness, Picnic Panic and Skills worksheets remain **removed**.
This change adds **only** a 52×52 baked-CSS sleeping-Onyx icon button at the top of the **expanded** Jump Nav on both account pages. It does not modify the collapsed Jump Nav bubble.

## Replacement widget integration

On each route the control stores a distinct choice under
`ourspace.onyx.jump.visible.v1.<profileKey>.<page>`.
It emits a **desired state** event (not an ambiguous toggle event):

```js
document.addEventListener('ourspace:onyx-widget-visibility', event => {
  const { visible, profileKey, page, source } = event.detail;
  // Make the replacement widget visible or hidden for this signed-in page.
});
```

Attach a replacement widget root using either of these **optional** hooks:

```js
window.OurSpaceOnyxJumpHook.register(document.querySelector('#new-onyx-widget'));
// or assign data-ourspace-onyx-widget to the replacement widget's root.
```

An adapter may also register its own show/hide implementation:

```js
window.OurSpaceOnyxJumpHook.registerAdapter({
  show({page,profileKey}) { /* show new widget */ },
  hide({page,profileKey}) { /* hide new widget */ },
  isVisible() { return false; }
});
```

Call `window.OurSpaceOnyxJumpHook.refresh()` or dispatch the `ourspace:onyx-widget-ready` event after the future widget mounts.
When no widget is installed, the Jump Nav button remains interactive and remembers the requested state but correctly displays **Widget not connected** or **Show when widget is connected**. It does not fabricate a widget.

The Jump Nav, page links, Master Nav, and new widget remain separate. The button is intentionally not on the public profile view or the login portal. No backend, game, or Skills programming is included.
