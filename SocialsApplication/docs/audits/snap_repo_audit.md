# Repository Audit

Generated: 2026-06-21T04:53:26.770695+00:00

Runnable app inclusion was limited to safe, reusable, license-compatible pieces. Account-cracking tools, leaked proprietary code, and unofficial account-automation API code were not copied into the final app.

| Upload | Files | Size | License files found | Manifests found | Decision | Reason |
| --- | ---: | ---: | --- | --- | --- | --- |
| `snapcrack-main.zip` | 9 | 125,651 bytes | None found | requirements.txt | Excluded from runnable app | Credential-cracking / brute-force automation; no license found. Documented only. |
| `SnapBrute-main.zip` | 5 | 45,369 bytes | LICENSE | requirements.txt | Excluded from runnable app | Credential brute-force tooling. GPL license copied for audit only; no runnable code copied. |
| `SnapchatLikeCamera-master.zip` | 104 | 532,734 bytes | None found | build.gradle, app/build.gradle | Reference only | Useful Android camera/sticker behavior, but no clear project license found. Recreated browser-native equivalents rather than copying source. |
| `snapchat-clone-master.zip` | 233 | 63,689,148 bytes | LICENSE | package.json | Reference only | MIT UI clone patterns and fixture ideas reviewed; no React code copied into final static app to avoid dependency bloat. |
| `simple-snapchat-master.zip` | 347 | 112,256,058 bytes | simple-snapchat/Parse.framework/third_party_licenses.txt | Podfile | Reference only | iOS/Firebase learning app reviewed for flow concepts; no project license at root and heavy platform dependencies, so no source copied. |
| `snapchat-filters-opencv-master.zip` | 64 | 110,316,277 bytes | LICENSE | requirements.txt | Partially included | MIT-licensed overlay sprite assets copied and deduplicated. Python/OpenCV desktop code not included because final app is browser-native. |
| `Snapchat-Source-Code-Leak-master.zip` | 311 | 1,141,213 bytes | None found | None found | Excluded from runnable app | Repository describes itself as a source-code leak and has no license. No source copied. |
| `snap-camera-server-main.zip` | 102 | 2,229,040 bytes | LICENSE | package.json, migrations/package.json, migrations/sqls/package.json | Reference only | MIT server tooling reviewed. Not copied into runnable app because final package is static/local and avoids service/bypass/crawler behavior. |
| `SwiftyCam-master.zip` | 47 | 307,288 bytes | LICENSE | None found | Reference only | BSD iOS camera framework reviewed for capture behavior. No Swift code copied because final target is static browser app. |
| `Source-SnapChat-master(1).zip` | 311 | 1,140,808 bytes | None found | None found | Excluded from runnable app | Duplicate of the leaked-source repository except README. No source copied. |
| `SC-API-master.zip` | 47 | 1,600,487 bytes | LICENSE | composer.json | Excluded from runnable app | Unofficial account/API automation library. Documented only; no runnable code copied. |

## Duplicate / redundancy notes

- `Snapchat-Source-Code-Leak-master.zip` and `Source-SnapChat-master(1).zip` contained 311 matching relative files; 310 matched byte-for-byte and the only differing file was `README.md`.
- The OpenCV fly overlay frames had duplicate `Copy` images; only unique frames were copied and renamed to short Windows-friendly paths.
- Platform-specific camera code appeared in Android, iOS, React, Python/OpenCV, and browser/server forms. The final app consolidates the common user-facing behavior into one dependency-free browser implementation.

## Excluded high-risk categories

- Credential cracking, brute force, password-list/proxy rotation, or CAPTCHA-bypass related code.
- Leaked/proprietary source code or code with no redistribution rights.
- Unofficial Snapchat account/API automation code.
- Server-side crawler/bypass/import code that is not needed for a local camera/messenger tool.