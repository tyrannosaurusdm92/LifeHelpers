# OurSpace — Design Widget button in expanded Jump Nav

The supplied `design_widget_icon.css` is installed at `style/profile/design_widget_icon.css` without modifying its baked artwork. Both `assets/code/william.html` and `assets/code/jasper.html` load the stylesheet and include `profileJumpDesignToggle` **after** `profileJumpLinks`. The sleeping-Onyx button remains **before** the page links. The collapsed Jump Nav bubble is untouched.

## Operation

The new button opens the existing, full OurSpace Design Studio (`#designWidget` / `#designerPanel`, through `window.OurSpaceDesignWidget.open()`). The next press hides the whole Design Widget, not just the editor panel; another press shows and opens it again. It does not delete the widget, reset its layout or presets, create a second design widget, or interfere with Onyx's hook.

A stored preference `ourspace.design.jump.visible.v1.<profile>.<page>` keeps the requested visible/hidden state separately for William and Jasper and for each page. On a first visit with no saved preference, the existing floating Design Widget behaves as before; the Jump Nav button opens it. Closing the existing editor with its own close button leaves its movable collapsed bubble available.

Programmatic host API: `window.OurSpaceDesignJumpHook.open()`, `.show()`, `.hide()`, `.toggle()`, `.isVisible()`, `.refresh()`. A `document` CustomEvent named `ourspace:design-widget-visibility` is emitted when the button or API updates visibility, with `{visible,profileKey,page,source}` in `event.detail`. This is an optional integration event: the bundled existing widget works without subscribing to it.

The Jump Nav stays available on all signed-in pages; it does not show on public pages. Service-worker cache revision was incremented so previously installed PWAs can refresh the changed CSS and script after a successful update.

## Verification boundary

An isolated Chromium test verified button order, rendered 52px PNG-background icon, open/hide/reopen actions, and account/page scoped storage for a mock Design Widget. Source JavaScript syntax, JSON parsing, HTML resource references, and ZIP integrity were also checked. The full deployed app was **not** exercised end-to-end, so confirm behavior after publishing on GitHub and refreshing the installed PWA.
