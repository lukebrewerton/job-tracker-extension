// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

// The page the toolbar button opens: the instance's new-job form, pre-filled from the
// current tab's address and title (and the company, where the title gives it). Only what
// the browser already knows about the tab is used — no content script, nothing read from
// the page itself.

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
 * The role (and, where the site's title says, the company) from the tab's title: trimmed,
 * without a leading notification count such as "(3) ", and without the site's name.
 *
 * - LinkedIn: "Role | Company | LinkedIn".
 * - Indeed: "Role - Location - Indeed" on a job's page (the location is dropped); a search
 *   page's "Job Search | Indeed" isn't a role at all.
 * - Anywhere else, the whole title is the role.
 *
 * @param {string} jobUrl The job's address, from jobPageUrl().
 * @param {string} tabTitle
 * @returns {{ role: string, company: string }}
 */
export function fromTitle(jobUrl, tabTitle) {
  const title = tabTitle.trim().replace(/^\(\d+\+?\)\s*/, "");
  const host = new URL(jobUrl).hostname;

  if (/(^|\.)linkedin\.com$/.test(host)) {
    const parts = title.split(" | ");
    if (parts.length >= 2 && parts.at(-1) === "LinkedIn") {
      parts.pop();
      const company = parts.length >= 2 ? (parts.pop() ?? "") : "";
      return { role: parts.join(" | "), company };
    }
  }

  if (/(^|\.)indeed\.[a-z.]+$/.test(host)) {
    if (/ \| Indeed(\.com)?$/.test(title)) {
      return { role: "", company: "" };
    }
    const match = / - Indeed(\.com)?$/.exec(title);
    if (match !== null) {
      const parts = title.slice(0, match.index).split(" - ");
      if (parts.length >= 2) {
        parts.pop();
      }
      return { role: parts.join(" - "), company: "" };
    }
  }

  return { role: title, company: "" };
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
  const { role, company } = fromTitle(url, tabTitle ?? "");
  if (role !== "") {
    target.searchParams.set("title", role);
  }
  if (company !== "") {
    target.searchParams.set("company", company);
  }
  return target.href;
}
