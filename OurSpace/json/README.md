# OurSpace Shallow Path Package

This revision keeps the William / Jasper / Shared split while drastically shortening paths.

## Top-level folders

- `w/` = William files
- `j/` = Jasper files
- `s/` = Shared files, shared DBT/ADHD skills, and docs

## Folder-depth rule used

- The zip has no wrapper folder.
- Root contains exactly three folders: `w`, `j`, and `s`.
- Each of those folders has no more than three direct subfolders.
- Those direct subfolders contain files only; they do not contain more folders.
- DBT/ADHD skill files are in `s/skills/` with short cadence-prefixed names.
- The old-to-new path map is in `s/docs/short_path_manifest.json`.
