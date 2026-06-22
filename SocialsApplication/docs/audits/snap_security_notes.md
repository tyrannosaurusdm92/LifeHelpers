# Safety and Security Notes

The final runnable project deliberately avoids:

- Credential cracking or brute-force login workflows.
- Password-list handling.
- Proxy rotation for account access.
- CAPTCHA bypass logic.
- Unofficial account automation APIs.
- Leaked/proprietary source-code reuse.
- Remote crawler/import tools that would contact third-party services.

This package keeps the reusable camera, overlay, filter, UI, and local messaging concepts while keeping risky source out of the application.

For a production deployment, add your own authentication, storage, moderation, retention, and privacy controls in a backend you control.
