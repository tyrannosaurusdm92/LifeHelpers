# Patch — Drag Organizers, Shared Media, Profile Image Fit

Date: 2026-06-27

## Scope

This patch updates the journaling, audio, visual, and profile image tools without replacing the surrounding OurSpace shell.

## Journaling

- Added folder and subfolder creation.
- Added category and subcategory creation.
- Added drag-and-drop organizing for journal entries.
- Added drag-and-drop file imports into folders and categories.
- Added rename and delete controls for user-created folders and categories.
- Added external website links for wiki pages, game references, notes, and other resources.
- Added link targeting for the current entry, selected folder, selected category, or general unfiled journal area.
- Preserved local saving, JSON import/export, backend sync save/load, text download, copy, and accessibility text insertion hooks.

## Audio module

- Added subfolders for music organization.
- Added drag-and-drop tracks/files into folders and playlists.
- Added rename/delete controls for user-created folders and playlists.
- Added protected shared playlist: **William + Jasper Shared Audio**.
- Added external website links for music, game wiki pages, references, lyrics pages, or other safe external resources.
- Preserved play, pause, stop, rewind 5 seconds, fast forward 5 seconds, next/previous, shuffle, repeat, mini-player, downloads, and backend sync.

## Visual module

- Added subfolders for photo/video organization.
- Added drag-and-drop visual files/assets into folders and playlists.
- Added rename/delete controls for user-created folders and playlists.
- Added protected shared playlist: **William + Jasper Shared Visuals**.
- Added external website links for galleries, game wiki pages, references, memes, or other safe external resources.
- Preserved slideshow, image/video playback, fit controls, downloads, mini-view behavior, and backend sync.

## Profile pictures

- Added fit/crop controls to profile pictures matching the background-style behavior:
  - Cover/crop
  - Contain/show whole image
  - Stretch/fill
  - Scale down
  - Actual size
- Added profile picture scale control.
- Added horizontal and vertical position controls.
- Added reset-to-default profile picture fit controls.

## Notes

Default/system collections such as All Music, All Visuals, Uploads, Favorites, and the William + Jasper shared playlists are intentionally protected from deletion so the app always has safe anchors. User-created folders, subfolders, playlists, categories, and subcategories can be renamed or deleted.
