# Source Repository Audit

This audit documents the uploaded accessibility, OCR, scanner, and text-to-speech repositories reviewed for the journaling accessibility add-on.

**Policy used:** keep the site module lightweight, browser-friendly, and license-safe. No source code from the uploaded repositories was copied into the generated add-on.

| Repository archive | Useful ideas reviewed | License signal | Shipped decision |
|---|---|---:|---|
| `OSS-DocumentScanner-main.zip` | Mobile document scanning flow, capture/crop/enhance/export concepts. | MIT detected. | Concepts only. NativeScript/mobile stack was too heavy for an embeddable journal page. |
| `text-element-master.zip` | Static text UI component. | Apache-2.0 detected. | Not relevant to OCR/TTS; no code used. |
| `PictureText-master.zip` | Python picture/text experiments. | No license/readme detected. | Excluded due to unclear license and Python-only approach. |
| `PictureToAnswer-main.zip` | Image upload to text/answer flow. | MIT detected. | Concepts only; Flask/server app not included. |
| `text-extract-api-main.zip` | OCR/document extraction API, optional backend OCR concept. | MIT detected. | Concepts only; FastAPI/Celery/Redis/Docker stack excluded. |
| `OpenNoteScanner-master.zip` | Note/page scanning, mobile crop workflow. | GPL-3.0 detected. | Concepts only; GPL/native Android code not bundled. |
| `RocketBookPages-master.zip` | Page template generation. | GPL-3.0 detected. | Not relevant to requested module; no code used. |
| `AndroidDocumentScanner-master.zip` | Android document scanner library, page edge/crop/enhance ideas. | MIT detected. | Concepts only; Android library cannot run inside the HTML site. |
| `react-native-document-scanner-master.zip` | Live document detection/capture UX. | MIT-style license detected. | Concepts only; React Native/OpenCV stack excluded. |
| `document-scanner-master.zip` | OpenCV crop/perspective scanner idea. | No license detected. | Excluded due to missing license and Python/OpenCV dependency. |
| `Pic2Text-master.zip` | Android picture-to-text user flow. | No license detected. | Excluded due to Android/APK bundle and unclear license. |
| `nvda-audio-volume-control-application-main.zip` | NVDA accessibility practice and keyboard-accessible controls. | GPL-2.0 detected. | Reference only; not relevant to journal OCR, no code used. |
| `Screen-Reader-Simulator-master.zip` | Simple speak-text-aloud concept. | No license detected. | Concept only; no code used. |
| `EchoLens-main.zip` | Image accessibility and description workflow. | No license detected. | Concept only; no code used. |
| `NonvisualAudio-main.zip` | Accessible reporting for blind/low-vision users. | MIT detected. | Accessibility documentation approach noted; no code used. |
| `TextScannerApp-Android-master.zip` | Picture-to-text scanner app flow. | Apache-2.0 detected. | Concepts only; Android app excluded. |
| `agk-tts-master.zip` | WebTTS/ARIA announcements concept. | MIT detected. | Concept only. Generated add-on uses native Web Speech API directly. |
| `BookTalk-master.zip` | Ebook/text reading workflow. | No license detected. | Excluded due to Rails app shell and unclear license. |
| `FastPlay-master.zip` | Accessible audio playback controls. | No license detected. | Control UX noted; Windows/C++ audio app excluded. |
| `text-to-picture-master.zip` | Text-to-picture generation. | MIT detected. | Reverse direction from request; no code used. |

## Features selected for the generated add-on

- Browser image upload to OCR.
- Mobile/tablet camera capture with rear-camera preference.
- Canvas-based scan preview, contrast enhancement, and simple auto-crop heuristic.
- OCR text cleanup and editable review area.
- Insert OCR text into existing journal entries.
- Create a new journal entry from OCR text.
- Speak current/selected journal entry out loud.
- Speak highlighted/drag-selected text.
- Pause/resume/stop speech controls.
- ARIA live-region status messages.

## Features intentionally not shipped

- Native Android scanner libraries.
- React Native apps.
- Python/OpenCV scanner code.
- Flask/FastAPI/Celery/Docker OCR services.
- NVDA/Windows-specific add-ons.
- APKs and binary app bundles.
- Rails ebook platform code.
- GPL source code.
