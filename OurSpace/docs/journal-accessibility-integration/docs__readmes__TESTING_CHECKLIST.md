# Testing Checklist

## Desktop

- Open `journal-module-with-accessibility.html`.
- Create a journal entry.
- Upload a clear JPG/PNG screenshot or photo with text.
- Press Enhance scan.
- Press Auto-crop page edges.
- Press Extract text.
- Edit the extracted text.
- Send text to journal as a new entry.
- Append text to the current entry.
- Replace current entry text.
- Speak selected entry.
- Highlight part of the journal reader and speak selection.
- Highlight part of the OCR textarea and speak selection.
- Download extracted text.

## Mobile/tablet

- Confirm camera panel appears.
- Start camera.
- Capture a document page.
- Stop camera.
- Enhance/crop/OCR.
- Send to journal.
- Speak OCR text and selected entry.

## Offline/degraded mode

- Block CDN access or test offline.
- Confirm the module gives a useful OCR warning but still supports upload/camera preview, manual extracted text editing, saving into journal, and speech.

## Backend

- Confirm regular journal save/load still works.
- Implement `journal_a11y_save_scan` if you want scan audit records.
- Implement `journal_a11y_ocr_image` only if backend OCR is desired.
