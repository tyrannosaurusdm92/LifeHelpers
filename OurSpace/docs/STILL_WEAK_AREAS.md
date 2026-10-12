# Remaining weak / incomplete areas

- Server-side auth/profile isolation still requires backend-side verification; this frontend does not certify the backend security boundary.
- Chat thread names/pins/reactions and some organization metadata remain browser-owned rather than fully account-synced.
- File uploads still use the existing backend upload transport; large-file streaming/chunking and per-file upload progress/cancel remain future work.
- No dedicated protected safety-plan surface has been added.
- The animation dataset is still large after on-demand decompression; a binary sprite/atlas representation would reduce runtime memory further.
- Automated browser regression coverage should be expanded across auth, all four chat lanes, file tools, pause/self-care, reduced motion, and Design.
- Full end-to-end verification of web/file/image/Drive tools requires the authenticated live backend and cannot be proven by static syntax tests alone.
