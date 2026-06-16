# Manual Onyx attach snippets

Use these only if you do not want to run `attach_onyx_to_profiles.bat`.

## dino-nerdzone.html
Add this inside `<head>`:

```html
<link rel="stylesheet" href="onyx/onyx-widget.css" data-onyx-attach="true">
<script defer src="onyx/onyx-widget.js" data-onyx-profile="papa" data-onyx-attach="true"></script>
```

Place this on the “Chat Bot with DBT Skills” page/section:

```html
<section id="onyx-dbt-chat" class="onyx-dbt-chat" data-onyx-chat="true" data-onyx-profile="papa" aria-label="Onyx Chat Bot with DBT Skills for Dino Dad"></section>
```

## squishy-cottage.html
Add this inside `<head>`:

```html
<link rel="stylesheet" href="onyx/onyx-widget.css" data-onyx-attach="true">
<script defer src="onyx/onyx-widget.js" data-onyx-profile="momma" data-onyx-attach="true"></script>
```

Place this on the “Chat Bot with DBT Skills” page/section:

```html
<section id="onyx-dbt-chat" class="onyx-dbt-chat" data-onyx-chat="true" data-onyx-profile="momma" aria-label="Onyx Chat Bot with DBT Skills for Momma"></section>
```
