# Unused Code Documentation

No source code from the uploaded external repositories is included in the shipped integrated module.

The uploaded repositories were reviewed for feature patterns only. Their full application stacks were intentionally excluded because they contained one or more of the following:

- Native Android / React Native code not suitable for direct embedding in the web journaling module
- Heavy framework dependencies that would bloat the OurSpace site
- Backend assumptions that do not match the provided Google Apps Script backend
- Licenses that should not be mixed into a small generated module without explicit downstream review
- Features outside the requested scope

The generated package contains only the OurSpace module code needed for:

- journaling
- TXT/DOCX entry upload
- image upload to text
- camera scanning
- OCR insertion into journal entries
- entry/selection text-to-speech
- backend sync hooks

See the audit and manifest files in `docs/audits` and `docs/manifests` for the reviewed source list.
