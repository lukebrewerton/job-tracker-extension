// Copyright (C) 2026 Luke Brewerton
// SPDX-License-Identifier: AGPL-3.0-or-later
// @ts-check

import { describe, expect, test } from "vitest";

import { parseInstanceUrl } from "../src/lib/instance.js";

describe("parseInstanceUrl", () => {
  test.each([
    ["https://jobs.example.com", "https://jobs.example.com"],
    // Reduced to the origin: the app always runs at the root of its domain.
    ["https://jobs.example.com/", "https://jobs.example.com"],
    ["https://jobs.example.com/dashboard", "https://jobs.example.com"],
    ["  https://Jobs.Example.com:8443  ", "https://jobs.example.com:8443"],
    // No scheme: https:// is assumed.
    ["jobs.example.com", "https://jobs.example.com"],
    ["localhost:8000", "https://localhost:8000"],
    // Plain http:// only for a local development instance.
    ["http://localhost:8000", "http://localhost:8000"],
    ["http://127.0.0.1:8000/", "http://127.0.0.1:8000"],
    ["http://[::1]:8000", "http://[::1]:8000"],
  ])("accepts %j as %j", (input, origin) => {
    expect(parseInstanceUrl(input)).toEqual({ ok: true, origin });
  });

  test.each([
    ["", "Enter your Job Tracker's address."],
    ["   ", "Enter your Job Tracker's address."],
    ["https://", "That isn't a valid web address."],
    ["https://jobs example.com", "That isn't a valid web address."],
    ["javascript:alert(1)", "That isn't a valid web address."],
    [
      "http://jobs.example.com",
      "Use https://. Plain http:// is only allowed for localhost.",
    ],
    [
      "http://localhost.example.com",
      "Use https://. Plain http:// is only allowed for localhost.",
    ],
    ["ftp://jobs.example.com", "The address must start with https://."],
    [
      "https://me:secret@jobs.example.com",
      "Leave out the user name and password.",
    ],
    [
      "https://jobs.example.com/?next=/jobs",
      "Leave out anything after a ? or #.",
    ],
    ["https://jobs.example.com/#jobs", "Leave out anything after a ? or #."],
  ])("rejects %j", (input, error) => {
    expect(parseInstanceUrl(input)).toEqual({ ok: false, error });
  });
});
