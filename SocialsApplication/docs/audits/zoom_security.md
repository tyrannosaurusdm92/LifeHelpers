# Security Notes

This project is safe-by-default for local development, not a hardened public SaaS.

## Safe defaults

- Local bind address: `127.0.0.1`.
- No default external API calls.
- No required secrets.
- No server-side audio/video recording.
- No dependency install required to run the default app.

## Before public deployment

- Put the Node server behind HTTPS.
- Add authentication and authorization.
- Replace in-memory room state with a real store if you need multi-instance or crash recovery.
- Add rate limits and abuse protection at the reverse proxy.
- Use TURN for users behind restrictive NATs.
- Publish source and license notices if you incorporate AGPL code later.
