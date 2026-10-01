// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// The options page (about:addons → Job Tracker → Preferences): the instance URL setting.

import {
  clearInstanceUrl,
  getInstanceUrl,
  parseInstanceUrl,
  setInstanceUrl,
} from "../lib/instance.js";

const form = /** @type {HTMLFormElement} */ (document.getElementById("form"));
const input = /** @type {HTMLInputElement} */ (
  document.getElementById("instance-url")
);
const status = /** @type {HTMLElement} */ (document.getElementById("status"));
const open = /** @type {HTMLAnchorElement} */ (document.getElementById("open"));

/**
 * @param {string} message
 * @param {{ error?: boolean }} [options]
 */
function setStatus(message, { error = false } = {}) {
  status.textContent = message;
  status.classList.toggle("error", error);
  input.setAttribute("aria-invalid", String(error));
}

/** @param {string | undefined} origin The saved origin, if any. */
function showSaved(origin) {
  input.value = origin ?? "";
  open.hidden = origin === undefined;
  open.href = origin === undefined ? "#" : `${origin}/dashboard`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (input.value.trim() === "") {
    await clearInstanceUrl();
    showSaved(undefined);
    setStatus("Removed. The toolbar button will ask for an address.");
    return;
  }
  const parsed = parseInstanceUrl(input.value);
  if (!parsed.ok) {
    setStatus(parsed.error, { error: true });
    input.focus();
    return;
  }
  await setInstanceUrl(parsed.origin);
  showSaved(parsed.origin);
  setStatus(`Saved: ${parsed.origin}`);
});

// Open the instance in a normal tab (links inside about:addons don't navigate it).
open.addEventListener("click", (event) => {
  event.preventDefault();
  void browser.tabs.create({ url: open.href });
});

showSaved(await getInstanceUrl());
