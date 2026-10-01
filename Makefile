# Copyright (C) 2026 Luke Brewerton
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# Job Tracker extension: common tasks. `make help` lists them.

.PHONY: help sync lint format run build reuse-lint secrets-scan hooks hooks-off

.DEFAULT_GOAL := help

# The extension itself: everything web-ext loads, lints and packages.
SRC := src
WEB_EXT := npx --no-install web-ext

help: ## List the targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

sync: ## Install the dev dependencies (npm ci)
	npm ci

lint: ## Lint the extension (web-ext) and check formatting (prettier)
	$(WEB_EXT) lint --source-dir $(SRC) --warnings-as-errors
	npx --no-install prettier --check .

format: ## Format everything with prettier
	npx --no-install prettier --write .

run: ## Run the extension in a temporary Firefox profile (reloads on change)
	$(WEB_EXT) run --source-dir $(SRC)

build: ## Package the extension, unsigned, into web-ext-artifacts/
	$(WEB_EXT) build --source-dir $(SRC) --overwrite-dest

# --- Licences and secrets -------------------------------------------------------

# REUSE (https://reuse.software) via the FSFE's official image, pinned by digest.
REUSE_IMAGE := fsfe/reuse:6.2.0@sha256:85462a75c0f8efda09ddd190b92816b70e7662577c8427429e11e1b9f25a992e

reuse-lint: ## Fail unless every file has copyright and licence information (a header, or REUSE.toml)
	docker run --rm -v "$(CURDIR):/data:ro" $(REUSE_IMAGE) lint --quiet \
		|| { echo "Give the file a licence header, or add it to REUSE.toml."; exit 1; }

# Same pinned image in CI and locally; the version/digest is bumped by hand.
GITLEAKS_IMAGE := ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f

secrets-scan: ## Scan the whole git history for secrets (gitleaks via Docker)
	docker run --rm -v "$(CURDIR):/repo" $(GITLEAKS_IMAGE) \
		git /repo --config /repo/.gitleaks.toml --redact --no-banner --verbose

hooks: ## Opt in: enable the pre-commit secrets hook for this clone (needs `brew install gitleaks`)
	git config core.hooksPath .githooks
	@echo "Git hooks enabled (.githooks). Disable with: make hooks-off"

hooks-off: ## Opt out: disable the repo's git hooks for this clone
	git config --unset core.hooksPath || true
	@echo "Git hooks disabled."
