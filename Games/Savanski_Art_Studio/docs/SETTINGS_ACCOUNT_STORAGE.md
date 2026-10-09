# Savanski Settings (routed backend)

This document supersedes the earlier account/payment model. The connected `2026.10.09-v3-routed-sas-pwa` Apps Script does not implement accounts, passwords, payment claims, storage quotas, or Stripe. These controls were removed from the frontend Settings window rather than left as nonfunctional interfaces.

Settings is a movable/resizable Savanski menu, accessible from the editor and launcher gear icons. It offers backend version checks, shared storage identity backup/restore, personal connector configuration, opt-in project backup, cloud project listing and local copy restoration, library search/download, server-side AI-Brain help, and install icons.

See `docs/BACKEND.md` for the exact GET/POST contract, storage security model, and known browser transport limitations.
