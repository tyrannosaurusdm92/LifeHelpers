# Layout Rescue Patch

Adds an always-visible Layout Rescue control strip to William and Jasper pages.

Recovery URLs after upload:

- `william.html#safe` opens the page without applying saved MySpace CSS.
- `william.html#clear-layout` removes saved MySpace/layout CSS locally and pushes the clean state to the locked backend.
- Same for `jasper.html#safe` and `jasper.html#clear-layout`.

The app top navigation and rescue controls are protected from legacy MySpace CSS so future layouts cannot trap the user away from the reset buttons.
