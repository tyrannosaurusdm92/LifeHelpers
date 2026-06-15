#!/usr/bin/env python3
"""
Windows-safe helper for attaching the OurSpace Messenger plug-in to:
  - dino-nerdzone.html
  - squishy-cottage.html

How to use:
1. Put the folder named ourspace_messenger_plugin beside both HTML files.
2. Run: python ourspace_messenger_plugin\tools\apply_plugin_to_html.py
3. The script inserts one deferred attach script before </body> in each file.
"""
from __future__ import annotations

from pathlib import Path

TARGETS = ["dino-nerdzone.html", "squishy-cottage.html"]
SNIPPET = '<script src="ourspace_messenger_plugin/js/ourspace-dbt-chat-attach.js" defer></script>'
MARKER = "ourspace-dbt-chat-attach.js"


def find_site_root() -> Path:
    here = Path(__file__).resolve()
    # tools/apply_plugin_to_html.py -> ourspace_messenger_plugin -> site root
    return here.parents[2]


def patch_file(path: Path) -> str:
    if not path.exists():
        return f"missing: {path.name}"
    text = path.read_text(encoding="utf-8", errors="replace")
    if MARKER in text:
        return f"already attached: {path.name}"
    lower = text.lower()
    idx = lower.rfind("</body>")
    if idx == -1:
        text = text.rstrip() + "\n" + SNIPPET + "\n"
    else:
        text = text[:idx].rstrip() + "\n  " + SNIPPET + "\n" + text[idx:]
    path.write_text(text, encoding="utf-8", newline="\n")
    return f"attached: {path.name}"


def main() -> None:
    root = find_site_root()
    print(f"Site root: {root}")
    for name in TARGETS:
        print(patch_file(root / name))


if __name__ == "__main__":
    main()
