# Accessibility Notes

## Included accessibility features

- Large touch targets and high-contrast controls.
- Live status region for screen reader announcements.
- Separate assertive live region for key events.
- Keyboard-focus outlines.
- Text-to-speech controls for current entry, OCR text, and selected text.
- Drag/highlight selection support for text inside the journal reader, journal editor, and OCR textarea.
- Mobile/tablet camera scanning with desktop upload fallback.
- Plain text preview area with keyboard focus.

## Browser support notes

- Speech uses the Web Speech API (`speechSynthesis`). Browser voices differ by OS and installed language packs.
- Camera scanning uses `navigator.mediaDevices.getUserMedia`, which requires HTTPS or localhost.
- OCR uses Tesseract.js from CDN unless your backend implements `journal_a11y_ocr_image`.

## Recommended manual test with assistive tech

1. Tab through every control and verify focus is visible.
2. Use a screen reader and confirm status messages are announced.
3. Upload a picture and verify OCR progress is communicated.
4. Select text in the journal reader and press “Speak highlighted/drag-selected text.”
5. Select part of the OCR textarea and press “Speak highlighted/drag-selected text.”
6. Test pause, resume, and stop.
7. On mobile/tablet, verify camera start, capture, and stop.
