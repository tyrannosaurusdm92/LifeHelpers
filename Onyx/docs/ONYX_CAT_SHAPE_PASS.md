# Onyx Cat Shape Pass

## What this pass fixes

This pass is intentionally code-first. It keeps the same FBX, rig, corrected black coat, walking animation, physics, and inspection camera, but changes the runtime anatomy and face treatment to match the supplied real-life Onyx references more closely.

### 1. The tum tum is now actually the abdomen

The prior pouch mask rewarded every low vertex below the abdomen. On this FBX that included leg geometry, while the later waist reduction simultaneously made the torso look leaner. The new pouch is a narrow vertical **band** over the real abdominal underside (roughly local Z 0.0–1.3) and a longitudinal window behind the ribcage. It drops the central underside, widens it, and shifts it slightly rearward. The waist-pinching pass was removed.

A small runtime secondary-motion system now moves only the cached pouch vertices while Onyx walks, creating restrained lateral lag and a tiny fore/aft delay.

### 2. Broad shoulders without turning him into a fluffy Maine Coon

The forequarter and chest reshaping remains geometry-only. It adds muscular width under a close coat rather than fur volume. Mid-body substance is slightly increased so the broader front does not taper into an unnaturally skinny middle.

### 3. Eyes are no longer buried

`Sphere` and `Sphere001` are still the real rendered eye meshes. Each is moved slightly forward and enlarged only modestly. The green-yellow eye texture is retained and emissive intensity is reduced from the earlier bright setting so the eyes read as eyes rather than lamps.

### 4. Nose and mouth now have separate feline structure

The FBX provides real `Nose` and `Mouth` bones, so the pass now uses their skin weights instead of a coarse rectangular face region. Nose-influenced vertices receive a small protrusion with a narrower tip. Mouth-influenced vertices get fuller whisker pads plus a lower muzzle/chin shelf.

A small rounded-triangle satin-black nose plane is bone-parented to `Nose`, and the `Mouth` bone receives a subtle central philtrum plus two curved lip creases to make the mouth read as a feline W instead of disappearing into the black coat.

### 5. Whiskers are much less straight

There are now fourteen five-point Catmull-Rom whisker curves. They have different lengths, vertical sweep, curl and left/right asymmetry. Twelve are white/pale and two are charcoal.

### 6. The coat should finally read BLACK

The corrected albedo was already numerically near-black, but this older Three.js renderer had `gammaOutput` enabled while the color texture was left at the default linear encoding. That can lift dark source pixels substantially on output. The fur, eye albedo and eye emissive textures are now explicitly marked `sRGBEncoding` before rendering.

## Sims pet-sculpting inspiration

The useful lesson from The Sims 3/4 pet creators is not their art style. It is their parameter separation: body mass, muscularity and local face/body shapes can be adjusted independently. This pass follows that logic: Onyx gets a stronger front assembly **and** a real low pouch without compensating by pinching his waist.

References consulted during this pass:

- The Sims 4 Cats & Dogs Create-a-Pet body sculpting / weight and muscle controls
- The Sims 3 Pets Advanced Mode body, head, eye and snout shaping
- The supplied real Onyx reference-photo archive, especially frontal face closeups and side/body views
