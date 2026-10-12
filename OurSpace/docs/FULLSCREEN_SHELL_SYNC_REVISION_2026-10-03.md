# Fullscreen shell sync revision — 2026-10-03

- **Feed Him MEOW** fullscreen now uses the supplied retro game shell.
- **Happy Home** fullscreen now uses the supplied lightning/Virtual-Health shell.
- The obsolete CSS living-room scene (window, couch, bed, desk, bowl, rug) was removed.
- The existing full-body Professor Onyx renderer remains over Happy Home; no new forward-seat pose was added because the renderer already supports a forward-facing seated pose.
- Fullscreen Chat does not maintain a duplicate conversation. It opens the live Onyx module lane: `leisure` for Feed Him MEOW and `health` for Happy Home/Health/Professor. This preserves current and prior conversation history when moving between module and fullscreen forms.
- Internal lane keys remain `leisure` and `health` for backward compatibility; visible product branding is Feed Him MEOW and Happy Home.
- Fullscreen shell control events are bridged back to the parent runtime so host integrations continue to receive them.
