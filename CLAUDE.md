# CLAUDE.md — Job Tracker extension

Operating context for Claude Code working in this repo.

## What this is

The Firefox extension for [Job Tracker](https://github.com/lukebrewerton/job-tracker). It is a
**link-opener, not an API client**: one click opens `<instance>/jobs/new?url=…&title=…` in a
new tab, and the app does the rest.

- Permissions: **`activeTab` and `storage` only**. No host permissions, no stored
  credentials, no requests to the instance, no CORS.
- **The instance URL is a user setting with no default.** Never hardcode an instance URL,
  including `job-tracker.job-finder.dev`.
- Signed builds come from AMO's unlisted channel through CI (later). The add-on ID
  (`browser_specific_settings.gecko.id`) is fixed once AMO has signed it.

## Stack

- Manifest V3, Firefox 142+ (`strict_min_version`; the first version that supports
  `data_collection_permissions` on Android too)
- Plain JavaScript (ES modules), **no build step**: `src/` is exactly what's packaged
- Tooling: Node 24 (`.nvmrc`) · npm · **web-ext** (lint, run, build) · **prettier** ·
  **tsc** (`// @ts-check` + JSDoc, `@types/firefox-webext-browser`) · **Vitest** (`tests/`, never packaged)

## Conventions

- **Everything the extension loads lives in `src/`**; web-ext only ever sees `src/`.
- **SPDX header** as the first lines of every authored source file:
  `// Copyright (C) 2026 Luke Brewerton` / `// SPDX-License-Identifier: AGPL-3.0-or-later`
  for JavaScript, `/* */` for CSS, `<!-- -->` for HTML (after the doctype), `#` for YAML and
  Makefiles. Files that can't hold a comment (JSON, lockfiles, docs) are listed by name in
  `REUSE.toml`. The icons are CC BY-NC-ND 4.0, not AGPL.
- **British spelling** in prose, comments and UI copy.
- The entity is a **job** everywhere — never "application".

## Git and CI

- Jira project **JT** (shared with the app). Branches: `<type>/JT-<n>`, e.g. `feat/JT-39`.
- Commit subjects: conventional-commit style, imperative mood.
- Everything reaches `main` through a PR; CI must pass.
- CI (`.github/workflows/ci.yml`) runs jobs `lint`, `test`, `reuse-lint`, `secrets-scan` — each calls
  the matching `make` target. Job names are required status checks: don't rename them
  without updating the ruleset.
- **Never use `pull_request_target`**, and never let CI reference secrets. (Signing, later,
  will be the one tag-only exception.)
- **Never commit secrets.**

## Common commands

- `make sync` — install the dev dependencies (`npm ci`)
- `make lint` — `web-ext lint` (warnings fail), `tsc` and `prettier --check`
- `make test` — the unit tests (Vitest)
- `make format` — `prettier --write`
- `make run` — run the extension in a temporary Firefox profile, reloading on change
- `make build` — an unsigned package in `web-ext-artifacts/`
- `make reuse-lint` / `make secrets-scan` — REUSE and gitleaks (pinned Docker images, as CI)
- `make hooks` / `make hooks-off` — opt in/out of the pre-commit secrets hook

## Definition of done (every change)

1. `make lint`, `make test` and `make reuse-lint` pass.
2. The extension loads and works as a temporary add-on in Firefox.
3. Licence information on every new file: an SPDX header, or an entry in `REUSE.toml`.
