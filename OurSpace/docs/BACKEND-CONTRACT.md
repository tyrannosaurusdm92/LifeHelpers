# Existing backend contract used by Work

Endpoint:

`https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec`

Requests use `POST` with `Content-Type: text/plain;charset=utf-8` so the browser can send JSON to the existing Apps Script web app without creating a new backend surface.

## Chat request

```json
{
  "action": "onyx.chat",
  "sessionToken": "<existing OurSpace session>",
  "data": {
    "message": "...",
    "threadId": "onyx-work-coding-debugging",
    "history": [{"role":"user","content":"..."}],
    "references": [],
    "context": {
      "surface": "onyx-work-tab",
      "workTab": "coding",
      "workSubtab": "debugging"
    },
    "webSearch": true,
    "useDrive": true,
    "reasoningEffort": "medium"
  }
}
```

Expected useful response fields include `ok`, `response` / `onyxReply`, `responseId`, and AI Brain metadata.

## Image generation

Image Creation can switch from chat to the existing `onyx.ai.image.generate` action. The client accepts URL, data URL, `base64`, or `b64_json`-style image artifacts when present.

## Attachments

Files are parsed through `onyx.ai.file.parse`. The returned analysis is converted into a text reference for the following `onyx.chat` request. File objects themselves are never written into localStorage; local transcripts store only attachment metadata.

## Authentication

The existing backend enforces `sessionToken`. Work does not introduce an alternate login, client credential, or Onyx-specific authentication path.
