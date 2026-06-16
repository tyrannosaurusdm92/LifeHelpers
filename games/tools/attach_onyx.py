#!/usr/bin/env python3
"""Attach Onyx DBT Chat to dino-nerdzone.html and squishy-cottage.html.

Run from the folder that contains those HTML files:
  python tools/attach_onyx.py .

The script is idempotent, creates .onyx-bak.html backups, and only uses short
relative paths: onyx/onyx-widget.css and onyx/onyx-widget.js.
"""
from __future__ import annotations
from pathlib import Path
import re, sys, shutil

TARGETS = {
    "dino-nerdzone.html": {"profile": "papa", "label": "Dino Dad"},
    "squishy-cottage.html": {"profile": "momma", "label": "Momma"},
}
ASSET_START = "<!-- ONYX_ASSETS_START -->"
ASSET_END = "<!-- ONYX_ASSETS_END -->"
CHAT_START = "<!-- ONYX_CHATBOT_START -->"
CHAT_END = "<!-- ONYX_CHATBOT_END -->"


def remove_between(text: str, start: str, end: str) -> str:
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end) + r"\s*", re.I | re.S)
    return pattern.sub("", text)


def strip_old_onyx(text: str) -> str:
    text = remove_between(text, ASSET_START, ASSET_END)
    text = remove_between(text, CHAT_START, CHAT_END)
    # Remove duplicate prior direct asset references if present.
    text = re.sub(r"\n?\s*<link[^>]+onyx-widget\.css[^>]*>\s*", "\n", text, flags=re.I)
    text = re.sub(r"\n?\s*<script[^>]+onyx-widget\.js[^>]*>\s*</script>\s*", "\n", text, flags=re.I)
    # Remove an empty prior target container, but avoid deleting filled custom content.
    text = re.sub(r"\n?\s*<section\s+id=[\"']onyx-dbt-chat[\"'][^>]*>\s*</section>\s*", "\n", text, flags=re.I)
    return text


def asset_block(profile: str) -> str:
    return f"""{ASSET_START}
<link rel=\"stylesheet\" href=\"onyx/onyx-widget.css\" data-onyx-attach=\"true\">
<script defer src=\"onyx/onyx-widget.js\" data-onyx-profile=\"{profile}\" data-onyx-attach=\"true\"></script>
{ASSET_END}
"""


def chat_block(profile: str, label: str) -> str:
    return f"""{CHAT_START}
<section id=\"onyx-dbt-chat\" class=\"onyx-dbt-chat\" data-onyx-chat=\"true\" data-onyx-profile=\"{profile}\" aria-label=\"Onyx Chat Bot with DBT Skills for {label}\"></section>
{CHAT_END}
"""


def insert_assets(html: str, profile: str) -> str:
    block = asset_block(profile)
    if re.search(r"</head\s*>", html, flags=re.I):
        return re.sub(r"</head\s*>", block + "\n</head>", html, count=1, flags=re.I)
    if re.search(r"</body\s*>", html, flags=re.I):
        return re.sub(r"</body\s*>", block + "\n</body>", html, count=1, flags=re.I)
    return block + "\n" + html


def insert_chat(html: str, profile: str, label: str) -> str:
    block = chat_block(profile, label)

    # Best case for multi-page single-HTML sites: a real page/module container
    # has id/class/data-page text containing chat/dbt. Insert near the top of
    # that container instead of accidentally attaching to a nav button.
    container_re = re.compile(
        r"(<(?:section|article|div)[^>]*(?:id|class|data-page|data-section|data-view)=[\"'][^\"']*(?:dbt|chat-bot|chat_bot|chatbot|chat)[^\"']*[\"'][^>]*>)",
        re.I,
    )
    for m in container_re.finditer(html):
        lookahead = html[m.end():m.end() + 3500]
        if re.search(r"Chat\s*Bot\s*with\s*DBT\s*Skills|DBT\s*Skills|diary\s*card|wise\s*mind", lookahead, flags=re.I):
            return html[:m.end()] + "\n" + block + html[m.end():]

    # Prefer attaching right after a heading containing the exact requested page name.
    heading_re = re.compile(r"(<h[1-6][^>]*>[^<]*Chat\s*Bot\s*with\s*DBT\s*Skills[^<]*</h[1-6]>)", re.I)
    if heading_re.search(html):
        return heading_re.sub(r"\1\n" + block, html, count=1)

    # If the text exists without a clean heading, place near it, but avoid nav-only placement when possible.
    marker = re.search(r"Chat\s*Bot\s*with\s*DBT\s*Skills", html, flags=re.I)
    if marker:
        # If this appears in a button/link/nav, append to main/body instead of inside navigation.
        nearby = html[max(0, marker.start() - 220):marker.end() + 220].lower()
        if not any(tag in nearby for tag in ["<nav", "<button", "<a "]):
            after = re.search(r"</(div|section|article|main)>\s*", html[marker.end():], flags=re.I)
            if after:
                idx = marker.end() + after.end()
                return html[:idx] + "\n" + block + html[idx:]
            return html[:marker.end()] + "\n" + block + html[marker.end():]

    # If the page is missing the DBT section, create it in the main body.
    fallback = f"""<section class=\"module onyx-dbt-module\" data-page=\"chat-bot-with-dbt-skills\">
  <h2>Chat Bot with DBT Skills</h2>
  {block.strip()}
</section>
"""
    if re.search(r"</main\s*>", html, flags=re.I):
        return re.sub(r"</main\s*>", fallback + "\n</main>", html, count=1, flags=re.I)
    if re.search(r"</body\s*>", html, flags=re.I):
        return re.sub(r"</body\s*>", fallback + "\n</body>", html, count=1, flags=re.I)
    return html + "\n" + fallback


def patch_file(path: Path, profile: str, label: str) -> str:
    original = path.read_text(encoding="utf-8", errors="ignore")
    html = strip_old_onyx(original)
    html = insert_assets(html, profile)
    html = insert_chat(html, profile, label)
    if html != original:
        backup = path.with_suffix(path.suffix + ".onyx-bak.html")
        if not backup.exists():
            shutil.copy2(path, backup)
        path.write_text(html, encoding="utf-8", newline="\n")
        return "patched"
    return "unchanged"


def find_targets(root: Path):
    found = []
    for name, info in TARGETS.items():
        # Prefer root/name, then recursive search.
        direct = root / name
        if direct.exists():
            found.append((direct, info))
            continue
        matches = [p for p in root.rglob(name) if "__MACOSX" not in p.parts and ".git" not in p.parts]
        if matches:
            found.append((matches[0], info))
    return found


def main(argv=None) -> int:
    argv = argv or sys.argv[1:]
    root = Path(argv[0] if argv else ".").resolve()
    if not root.exists():
        print(f"Root not found: {root}")
        return 2
    found = find_targets(root)
    if not found:
        print("No target files found. Put this folder beside dino-nerdzone.html and squishy-cottage.html, then run again.")
        return 1
    for path, info in found:
        status = patch_file(path, info["profile"], info["label"])
        print(f"{status}: {path.relative_to(root) if path.is_relative_to(root) else path}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
