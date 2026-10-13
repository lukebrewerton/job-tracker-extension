// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// Print the updates.json for a signed .xpi: the file Firefox fetches from the manifest's
// update_url to find new versions (https://extensionworkshop.com/documentation/manage/updating-your-extension/).
// It lists only this release, which is attached to the GitHub release next to it.
//
//   node scripts/updates-json.mjs signed/job-tracker-1.0.0.xpi > updates.json
//
// GITHUB_REPOSITORY (owner/repo) is set in GitHub Actions; elsewhere it defaults to this repo.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const xpi = process.argv[2];
if (xpi === undefined) {
  console.error("Usage: node scripts/updates-json.mjs <signed .xpi>");
  process.exit(2);
}

/** @type {{ version: string, browser_specific_settings: { gecko: { id: string, strict_min_version: string } } }} */
const manifest = JSON.parse(readFileSync("src/manifest.json", "utf8"));
const { id, strict_min_version } = manifest.browser_specific_settings.gecko;
const repo =
  process.env.GITHUB_REPOSITORY ?? "lukebrewerton/job-tracker-extension";
const hash = createHash("sha256").update(readFileSync(xpi)).digest("hex");

const updates = {
  addons: {
    [id]: {
      updates: [
        {
          version: manifest.version,
          update_link: `https://github.com/${repo}/releases/download/v${manifest.version}/${basename(xpi)}`,
          update_hash: `sha256:${hash}`,
          applications: { gecko: { strict_min_version } },
        },
      ],
    },
  },
};
console.log(JSON.stringify(updates, null, 2));
