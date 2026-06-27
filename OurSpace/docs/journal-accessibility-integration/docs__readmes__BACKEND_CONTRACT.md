# Backend Contract

Configured backend:

`https://script.google.com/macros/s/AKfycbwL1e8Gv-o0wC8kAhseMwoNhs97OBvCfCB5FV4zwNnCRa9jYWbYwm2B-wYwUOjlnjg_vA/exec`

Requests are sent as `POST` with `Content-Type: text/plain;charset=utf-8` to avoid CORS preflight problems common with Google Apps Script web apps.

Each request also includes matching query parameters for easier Apps Script routing:

- `module`
- `action`
- `profile`
- `key`

## Journal actions

### `journal_save`

Saves the full journal state.

Payload shape:

```json
{
  "module": "ourspace_journal",
  "action": "journal_save",
  "profile": "shared",
  "key": "journal:shared",
  "data": {
    "version": 1,
    "profile": "shared",
    "folders": [],
    "categories": [],
    "entries": []
  },
  "updatedAt": "ISO timestamp",
  "source": "OurSpace Journaling Module"
}
```

### `journal_load`

Loads the full journal state. The frontend accepts any of these response shapes:

```json
{ "state": { "version": 1, "entries": [] } }
```

```json
{ "journal": { "version": 1, "entries": [] } }
```

```json
{ "data": { "state": { "version": 1, "entries": [] } } }
```

Or a direct state object with `version` and `entries`.

## Accessibility actions

### `journal_a11y_save_scan`

Stores a lightweight record of OCR output. This is optional; the scanner still works locally if the backend ignores it.

### `journal_a11y_ocr_image`

Optional backend OCR hook. If implemented, return text using one of these response shapes:

```json
{ "text": "recognized text" }
```

```json
{ "data": { "text": "recognized text" } }
```

```json
{ "result": { "text": "recognized text" } }
```
