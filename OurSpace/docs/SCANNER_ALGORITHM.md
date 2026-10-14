# Scanner Algorithm — Living Room Hybrid v4

## 1. Scan-safe source
The room PNG is also embedded as a data URL used only for scanning. This avoids local-file canvas taint/read failures while leaving the normal asset file intact.

## 2. Denoise
A separable 3×3 Gaussian kernel `[1,2,1]` smooths RGB channels before color comparison and gradient calculation.

## 3. Edge geometry
Sobel X/Y gradients are calculated on blurred luminance. Non-maximum suppression thins the response. A Canny-style high/low hysteresis pass retains strong edges and connected weak edges. The UI edge value is converted to a stricter internal Canny high threshold.

## 4. Perspective line reinforcement
For sufficiently strong candidates, the tangent vector is compared with three room direction families: horizontal, vertical, and the ray toward the current vanishing point. Only near-collinear candidates are promoted. This is deliberately strict so wallpaper and wood grain do not become hundreds of barriers.

## 5. Room palette lookup
The trainable palette is compiled into a 32×32×32 RGB lookup table. This keeps full-resolution scans responsive. Each pixel can receive a confident material label; spatial priors favor ceiling labels high in the image, floor labels low in the image, and moulding/board labels near expected bands.

## 6. Connected region growth
Pixels join only when there is no edge barrier. In Hybrid mode, two confident but different room-material labels cannot merge. Same-material neighbors are allowed a wider local-color tolerance to absorb lighting gradients. Palette mode requires a shared confident material class. Structure mode uses local color + geometry without palette gating.

## 7. Mask refinement
After the initial components are built, small adjacent components may merge into a larger neighbor only when both resolve to the same room material and their mean colors are compatible. Disconnected spots are never merged merely because their colors match.

## 8. Structural retention
The normal minimum region threshold removes texture fragments. Long thin Trim and Floorboards/Crown components may survive at a lower pixel count when their bounding-box aspect ratio indicates a structural strip.

## 9. Contours and holes
Each retained component is boundary-traced. The largest loop becomes the outer ring; enclosed loops become GeoJSON polygon holes.

## 10. Adaptive simplification
RDP-style contour simplification is attempted at the requested tolerance. If the resulting polygons overlap, the tolerance is repeatedly halved until topology is safe, falling back to exact traced contours when necessary.

## 11. Group model
Every output polygon receives its own `groupId` and `groupName` at creation. Material classification is stored separately in `scanMeta.materialClass` and `scanMeta.suggestedGroupName`, so automatic detection never forces unrelated pieces into the same user group.

## 12. Export
GeoJSON export contains editable surface overlays only. Fixed room assets remain part of the project scene but are excluded from editable GeoJSON geometry.
