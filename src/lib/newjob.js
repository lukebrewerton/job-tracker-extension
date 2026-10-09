// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// The page the toolbar button opens: the instance's new-job form, pre-filled from the
// current tab's address and title. Only what the browser already knows about the tab is
// used — no content script, nothing read from the page itself.

/**
 * The job advert's address, or undefined if the tab isn't a web page (about:, file:,
 * an extension page…). Reader view gives the original page's address, and a job opened
 * from LinkedIn or Indeed search results gives the job's own page, not the search,
 * which wouldn't lead back to the job later.
 *
 * @param {string} tabUrl
 * @returns {string | undefined}
 */
export function jobPageUrl(tabUrl) {
  let url;
  try {
    url = new URL(tabUrl);
  } catch {
    return undefined;
  }
  if (url.protocol === "about:" && url.pathname === "reader") {
    const original = url.searchParams.get("url");
    return original === null ? undefined : jobPageUrl(original);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return undefined;
  }

  // LinkedIn: /jobs/search/?currentJobId=123… (or /jobs/collections/…) → /jobs/view/123/
  const linkedInJob = url.searchParams.get("currentJobId");
  if (
    /(^|\.)linkedin\.com$/.test(url.hostname) &&
    url.pathname.startsWith("/jobs/") &&
    linkedInJob !== null &&
    /^\d+$/.test(linkedInJob)
  ) {
    return `https://www.linkedin.com/jobs/view/${linkedInJob}/`;
  }

  // Indeed (any country): /jobs?q=…&vjk=abc → /viewjob?jk=abc on the same host
  const indeedJob = url.searchParams.get("vjk");
  if (
    /(^|\.)indeed\.[a-z.]+$/.test(url.hostname) &&
    indeedJob !== null &&
    /^[0-9a-f]+$/i.test(indeedJob)
  ) {
    return `${url.origin}/viewjob?jk=${indeedJob}`;
  }

  return tabUrl;
}

/**
 * The tab's title, trimmed and without a leading notification count such as "(3) ".
 *
 * @param {string} tabTitle
 * @returns {string}
 */
export function jobTitle(tabTitle) {
  return tabTitle.trim().replace(/^\(\d+\+?\)\s*/, "");
}

/**
 * The new-job form on the instance, pre-filled from the tab. A tab that isn't a web page
 * gets the empty form.
 *
 * @param {string} origin The instance, from getInstanceUrl().
 * @param {string | undefined} tabUrl
 * @param {string | undefined} tabTitle
 * @returns {string}
 */
export function newJobUrl(origin, tabUrl, tabTitle) {
  const target = new URL("/jobs/new", origin);
  const url = tabUrl === undefined ? undefined : jobPageUrl(tabUrl);
  if (url === undefined) {
    return target.href;
  }
  target.searchParams.set("url", url);
  const title = tabTitle === undefined ? "" : jobTitle(tabTitle);
  if (title !== "") {
    target.searchParams.set("title", title);
  }
  return target.href;
}
