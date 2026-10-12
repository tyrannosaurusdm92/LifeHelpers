# Pass 26: preservation audit

The supplied OurSpace Pass 15 archive contains 721 files and 115 application JavaScript files (plus service-worker.js).
The current GitHub OurSpace/main snapshot has only 22 JavaScript files (mostly the Pass25 movement integration). A full Pass15 application restore has not happened on GitHub.
The Pass 23 archive contains 25 source-true physics, renderer, locomotion, navigation and action modules. Pass25's small movement runtime is not equivalent to the complete Pass23 package.

Locally, Pass 15 was fully extracted and the 25 Pass 23 modules placed under js/onyx/games/virtual. A source SHA-256 check found zero unaccounted Pass15 losses in that local testing tree. The health/Happy Home iframe's legacy paths were rewritten to normalized paths.

THIS GITHUB COMMIT is deliberately narrower: it corrects the movement adapter's discovery of the ORIGINAL native Onyx renderer in a nested same-origin widget iframe, instead of incorrectly searching only window. It preserves the original root HTML, service worker, backend, DBT data, profiles and media.

Full restoration of the missing Pass15 JavaScript, profiles, native Happy Home room runtime and scaled feeding SVG assets is STILL PENDING on GitHub. Do not call the site fully integrated or visually tested.

No ZIP uploaded. No backend edits. No files deleted.