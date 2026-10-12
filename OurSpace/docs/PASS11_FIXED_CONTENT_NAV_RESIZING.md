# OurSpace Pass 11 — Baseline and resize scope

Source: Pass 8 UI and module architecture. Sizing reference: Pass 10.

- Compact visual default is 0.735 of Pass 8's original page/widget size (Pass 9 at 0.35 × 210%). It is now **100%**.
- Profile content and ordinary modules use fixed baseline CSS zoom, not individually resizable cards; responsive layout/grid rules continue to apply.
- Manual eight-edge resize is limited to the master nav, per-page jump-panel, named floating pop-out navigation, and Onyx's existing widget module. For nav pop-outs the user can resize from 75% to 200% of initial size.
- Older Pass 8/9/10 saved widths are NOT imported into the nav-resizer's Pass 11 namespace.
- `assets/code/william.html` and `assets/code/jasper.html` contain the original Onyx widget, with the full profile in unchanged `#ourspaceProfileFrame` iframes.
- `#skillsBookFrame` and the Games iframe retain their original viewport geometry; the standalone `assets/code/skills.html` is unchanged.
- Portal/sign-in and messenger CSS/JS are unchanged. The tested Apps Script backend is unchanged.
- A percentage indicator shows selection only for supported resizable navigation menus, and is *not* part of the messenger.
- Admin-only profile switch is inherited from Pass 10, so regular logins cannot switch profile from within a profile page.

Test in Chrome after deployment: sign-in, modal/Onyx popout resizing, profile navigation collapse/open, Skills full-page, Games external link, Messenger layout, small mobile screens.
