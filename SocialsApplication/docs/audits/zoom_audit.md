# Source Audit

## Build audit

- Final app has no bundled `node_modules`, virtual environments, build outputs, `.next`, or platform-specific binary dependency folders.
- Runtime paths are shallow and Windows-friendly.
- Server state is in memory; no database files are created by default.
- No uploaded `.env` files or secrets were copied into runtime.
- Source archives were inspected for stack, features, license files, and dependency profiles.

## Security audit

- Default server binds to `127.0.0.1` and requires opt-in `HOST=0.0.0.0` for LAN use.
- Room passcodes are hashed in memory with SHA-256 before storage.
- Static serving normalizes paths and rejects directory traversal.
- SSE signalling is room-scoped and participant-scoped.
- No meeting audio/video is stored by the server. Browser recording exports directly to the user's machine.

## Known limitations

- In-memory signalling means rooms vanish when the Node process restarts.
- P2P WebRTC works best for small rooms. Larger rooms should eventually use an SFU such as LiveKit.
- Browser captions depend on SpeechRecognition support and browser behavior; imported transcripts are more reliable for final reports.
- Plain HTTP camera/mic access is generally limited to localhost. Use HTTPS for remote deployment.
- There is no account system in the compact runtime. Add auth before public internet deployment.

## Recommended next upgrades

1. Add persistent storage for meeting records and reports.
2. Add optional HTTPS certificate support or reverse-proxy deployment docs.
3. Add LiveKit adapter for larger rooms.
4. Add optional Whisper/local model adapter for offline transcription.
5. Add OAuth/task adapters behind explicit admin configuration.
