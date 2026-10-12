# Transparent bubble and fallback fit

This pass removes the legacy blue procedural bubble habitat from the CSS source rather than merely hiding it.

The supplied frame was measured at 190×190. Its clear circular opening is approximately 134px through the horizontal center. The shared future-avatar/fallback target is therefore 135.5px in regular mode: 134px plus a deliberate 0.75px underlap beneath the inner frame edge on both sides.

The ten PNG fallbacks originally contained large transparent/semi-transparent canvas margins around their visible circular artwork. Those margins made the artwork appear much smaller even when the HTML image element had the correct dimensions. The assets in this package are cropped to their near-opaque artwork bounds while retaining their visible fallback art. CSS then scales that visible art to the authoritative target.

Fullscreen uses the same 134/190 frame-opening ratio. The underlap remains 0.75 CSS pixels per side, so the frame always covers the fallback/sprite edge without a transparent seam.

The `onyx-canvas` uses exactly the same target size as the PNG fallback. A replacement coded sprite/avatar should draw within that circle.
