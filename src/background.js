// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// The toolbar button: open the new-job form for the current tab on the user's instance,
// in a new tab next to it. With no instance set, open the options page instead.

import { getInstanceUrl } from "./lib/instance.js";
import { newJobUrl } from "./lib/newjob.js";

browser.action.onClicked.addListener(async (tab) => {
  const origin = await getInstanceUrl();
  if (origin === undefined) {
    await browser.runtime.openOptionsPage();
    return;
  }
  await browser.tabs.create({
    url: newJobUrl(origin, tab.url, tab.title),
    windowId: tab.windowId,
    index: tab.index + 1,
    openerTabId: tab.id,
    active: true,
  });
});
