// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

import { describe, expect, test } from "vitest";

import { newJobUrl } from "../src/lib/newjob.js";

const INSTANCE = "https://jobs.example.com";

/**
 * The url, title and company newJobUrl() pre-fills, decoded (null when not set).
 *
 * @param {string | undefined} tabUrl
 * @param {string | undefined} tabTitle
 */
function prefill(tabUrl, tabTitle) {
  const target = new URL(newJobUrl(INSTANCE, tabUrl, tabTitle));
  expect(target.origin + target.pathname).toBe(`${INSTANCE}/jobs/new`);
  return {
    url: target.searchParams.get("url"),
    title: target.searchParams.get("title"),
    company: target.searchParams.get("company"),
  };
}

describe("newJobUrl", () => {
  test.each([
    // A careers page: the address as it is, query and all.
    [
      "https://careers.example.com/jobs/42?utm_source=x#apply",
      "https://careers.example.com/jobs/42?utm_source=x#apply",
    ],
    [
      "http://intranet.example.com/vacancy/7",
      "http://intranet.example.com/vacancy/7",
    ],
    // LinkedIn: a job opened from search results or a collection → the job's own page.
    [
      "https://www.linkedin.com/jobs/search/?currentJobId=4012345678&keywords=sre",
      "https://www.linkedin.com/jobs/view/4012345678/",
    ],
    [
      "https://uk.linkedin.com/jobs/collections/recommended/?currentJobId=4012345678",
      "https://www.linkedin.com/jobs/view/4012345678/",
    ],
    [
      "https://www.linkedin.com/jobs/view/4012345678/?trackingId=abc",
      "https://www.linkedin.com/jobs/view/4012345678/?trackingId=abc",
    ],
    // …but not a currentJobId elsewhere on LinkedIn, or one that isn't an ID.
    [
      "https://www.linkedin.com/feed/?currentJobId=4012345678",
      "https://www.linkedin.com/feed/?currentJobId=4012345678",
    ],
    [
      "https://www.linkedin.com/jobs/search/?currentJobId=abc",
      "https://www.linkedin.com/jobs/search/?currentJobId=abc",
    ],
    // Indeed, any country: a job opened from search results → its own page, same host.
    [
      "https://uk.indeed.com/jobs?q=sre&l=London&vjk=0a1b2c3d4e5f6789",
      "https://uk.indeed.com/viewjob?jk=0a1b2c3d4e5f6789",
    ],
    [
      "https://www.indeed.com/jobs?q=sre&vjk=0A1B2C3D",
      "https://www.indeed.com/viewjob?jk=0A1B2C3D",
    ],
    [
      "https://uk.indeed.com/viewjob?jk=0a1b2c3d4e5f6789&from=serp",
      "https://uk.indeed.com/viewjob?jk=0a1b2c3d4e5f6789&from=serp",
    ],
    // A lookalike domain is left alone.
    [
      "https://notindeed.com/jobs?vjk=0a1b2c3d",
      "https://notindeed.com/jobs?vjk=0a1b2c3d",
    ],
    // Reader view: the original page.
    [
      "about:reader?url=https%3A%2F%2Fcareers.example.com%2Fjobs%2F42",
      "https://careers.example.com/jobs/42",
    ],
  ])("pre-fills %j as %j", (tabUrl, url) => {
    expect(prefill(tabUrl, "Senior SRE").url).toBe(url);
  });

  test.each([
    ["about:newtab"],
    ["about:reader"],
    ["about:reader?url=about%3Aconfig"],
    ["file:///Users/me/job.pdf"],
    ["moz-extension://0d1e2f/options/options.html"],
    ["view-source:https://careers.example.com/jobs/42"],
    ["not a url"],
    [undefined],
  ])("opens the empty form from %j", (tabUrl) => {
    expect(newJobUrl(INSTANCE, tabUrl, "New Tab")).toBe(`${INSTANCE}/jobs/new`);
  });

  const CAREERS = "https://careers.example.com/jobs/42";
  const LINKEDIN = "https://www.linkedin.com/jobs/view/4012345678/";
  const INDEED = "https://uk.indeed.com/viewjob?jk=0a1b2c3d4e5f6789";

  test.each([
    // Anywhere else, the whole title is the role.
    [CAREERS, "Senior SRE", "Senior SRE", null],
    [CAREERS, "  Senior SRE | Globex  ", "Senior SRE | Globex", null],
    [
      CAREERS,
      "Senior SRE - London - Indeed",
      "Senior SRE - London - Indeed",
      null,
    ],
    [CAREERS, "Senior SRE (Remote)", "Senior SRE (Remote)", null],
    // A leading notification count is dropped.
    [CAREERS, "(99+) Senior SRE", "Senior SRE", null],
    // Characters that need encoding survive the round trip.
    [CAREERS, "C++ & Rust: 50% remote?", "C++ & Rust: 50% remote?", null],
    [CAREERS, "   ", null, null],
    [CAREERS, undefined, null, null],
    // LinkedIn: "Role | Company | LinkedIn".
    [LINKEDIN, "Senior SRE | Globex | LinkedIn", "Senior SRE", "Globex"],
    [LINKEDIN, "(3) Senior SRE | Globex | LinkedIn", "Senior SRE", "Globex"],
    [
      LINKEDIN,
      "SRE | Platform | Globex | LinkedIn",
      "SRE | Platform",
      "Globex",
    ],
    [
      LINKEDIN,
      "Senior SRE jobs in London | LinkedIn",
      "Senior SRE jobs in London",
      null,
    ],
    [LINKEDIN, "Senior SRE | Globex", "Senior SRE | Globex", null],
    // Indeed: "Role - Location - Indeed" on a job's page; the location is dropped.
    [INDEED, "Senior SRE - London (Hybrid) - Indeed", "Senior SRE", null],
    [INDEED, "SRE - Platform - Remote - Indeed.com", "SRE - Platform", null],
    [INDEED, "Senior SRE - Indeed", "Senior SRE", null],
    // A search page's title isn't a role.
    [INDEED, "Job Search | Indeed", null, null],
    [INDEED, "Senior SRE", "Senior SRE", null],
  ])(
    "on %s, pre-fills the title %j as role %j and company %j",
    (url, tabTitle, title, company) => {
      expect(prefill(url, tabTitle)).toEqual({ url, title, company });
    },
  );

  test("works with a local development instance", () => {
    expect(
      newJobUrl(
        "http://localhost:8000",
        "https://careers.example.com/1",
        "SRE",
      ),
    ).toBe(
      "http://localhost:8000/jobs/new?url=https%3A%2F%2Fcareers.example.com%2F1&title=SRE",
    );
  });
});
