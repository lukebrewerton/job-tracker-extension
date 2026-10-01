// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// The user's Job Tracker instance: where the toolbar button opens new jobs. A setting with
// no default — never hardcode an instance URL. Stored as a bare origin (the app always runs
// at the root of its domain), in storage.sync so it follows the user's Firefox account.

const STORAGE_KEY = "instanceUrl";

// Plain http:// is allowed only here, for a local development instance (`make dev`).
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** @typedef {{ ok: true, origin: string } | { ok: false, error: string }} ParsedInstanceUrl */

/**
 * Check what the user typed and reduce it to an origin: `https://jobs.example.com/dashboard`
 * becomes `https://jobs.example.com`. Without a scheme, https:// is assumed.
 *
 * @param {string} input
 * @returns {ParsedInstanceUrl}
 */
export function parseInstanceUrl(input) {
  const text = input.trim();
  if (text === "") {
    return { ok: false, error: "Enter your Job Tracker's address." };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text)
    ? text
    : `https://${text}`;

  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, error: "That isn't a valid web address." };
  }
  if (url.protocol === "http:" && !LOCAL_HOSTS.has(url.hostname)) {
    return {
      ok: false,
      error: "Use https://. Plain http:// is only allowed for localhost.",
    };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "The address must start with https://." };
  }
  if (url.username !== "" || url.password !== "") {
    return { ok: false, error: "Leave out the user name and password." };
  }
  if (url.search !== "" || url.hash !== "") {
    return { ok: false, error: "Leave out anything after a ? or #." };
  }
  return { ok: true, origin: url.origin };
}

/**
 * The saved instance origin, or undefined if there isn't a valid one.
 *
 * @returns {Promise<string | undefined>}
 */
export async function getInstanceUrl() {
  const stored = (await browser.storage.sync.get(STORAGE_KEY))[STORAGE_KEY];
  if (typeof stored !== "string") {
    return undefined;
  }
  const parsed = parseInstanceUrl(stored);
  return parsed.ok ? parsed.origin : undefined;
}

/** @param {string} origin An origin from parseInstanceUrl(). */
export async function setInstanceUrl(origin) {
  await browser.storage.sync.set({ [STORAGE_KEY]: origin });
}

export async function clearInstanceUrl() {
  await browser.storage.sync.remove(STORAGE_KEY);
}
