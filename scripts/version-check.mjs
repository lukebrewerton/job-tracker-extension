// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// One version, MAJOR.MINOR.PATCH, in src/manifest.json and package.json (`make version-check`).
// The manifest's is the one that's released.

import { readFileSync } from "node:fs";

/** @param {string} path */
const versionOf = (path) => JSON.parse(readFileSync(path, "utf8")).version;

const manifest = versionOf("src/manifest.json");
const npm = versionOf("package.json");
const problems = [];
if (!/^\d+\.\d+\.\d+$/.test(manifest)) {
  problems.push(`src/manifest.json: '${manifest}' isn't MAJOR.MINOR.PATCH`);
}
if (manifest !== npm) {
  problems.push(
    `The versions differ: src/manifest.json ${manifest}, package.json ${npm}`,
  );
}
for (const problem of problems) {
  console.error(problem);
}
process.exit(problems.length === 0 ? 0 : 1);
