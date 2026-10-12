# Happy Home integration validation

Static validation for this pass covers the packaged entry point, runtime JavaScript, JSON/GeoJSON, asset references, iframe transparency, store/inventory content, and Onyx hierarchy.

- All `js/*.js` files pass `node --check`.
- All package JSON/GeoJSON files parse successfully.
- `home.html` and its embedded room document resolve every local script/stylesheet reference.
- The store catalog contains 91 entries and every referenced product/sleeping image exists.
- The finished 1916×821 room PNG has alpha-zero openings at both windows, every visible French-door glass pane, and all four picture-frame interiors.
- The supplied 70-feature living-room GeoJSON remains included with its original parent/child hierarchy.
- `onyx_interactions.geojson` includes explicit parent, child, grandchild, and descendant IDs for floor, basking, couch, aquarium, and dynamic-furniture interaction trees.
- No external ceiling-fan audio file is packaged; only the four preserved A/C audio files are present under the virtual audio folder.

A Chromium navigation smoke test could not be run inside this execution environment because local/loopback page navigation is administratively blocked. Static syntax, reference, hierarchy, and asset checks were used instead.
