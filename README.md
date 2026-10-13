# Job Tracker Companion for Firefox

[![CI](https://img.shields.io/github/actions/workflow/status/lukebrewerton/job-tracker-extension/ci.yml?branch=main&label=CI)](https://github.com/lukebrewerton/job-tracker-extension/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/lukebrewerton/job-tracker-extension)](https://github.com/lukebrewerton/job-tracker-extension/releases/latest)

A Firefox extension for [Job Tracker](https://github.com/lukebrewerton/job-tracker). One click
on a job advert opens the new-job page on **your own** Job Tracker instance, with the advert's
link and title already filled in.

It's a link-opener, not an API client: it asks only for the `activeTab` and `storage`
permissions, stores no credentials, and talks to nothing but the tab it opens. Your
instance's address is a setting with no default.

## Installing it

Needs Firefox 142 or newer. Install **Job Tracker Companion** from addons.mozilla.org: see
[Browser extension](https://job-tracker-docs.job-finder.dev/using/browser-extension/) in the
Job Tracker manual. Firefox keeps it up to date.

## Setting it up

Open `about:addons`, choose **Job Tracker Companion** → **Preferences**, and enter the address you sign
in to Job Tracker at, such as `https://jobs.example.com`. Only `https://` addresses are
accepted, apart from `http://localhost` for a development instance. The setting is saved with
your Firefox account if you use sync.

## Using it

On a job advert, click the Job Tracker button in the toolbar. Your instance's new-job form
opens in a new tab, with the advert's address and title filled in. On LinkedIn the company
is filled in too, and LinkedIn's and Indeed's own names are left out of the role. Jobs opened from LinkedIn or
Indeed search results are saved with the job's own address, not the search's. If you're
signed out, you sign in first and then land on the filled-in form. Until an address is set,
the button opens the settings instead.

## Development

Needs Node 24 (`.nvmrc`) and Firefox 142 or newer.

```sh
make sync   # install the dev dependencies
make run    # run it in a temporary Firefox profile, reloading on change
make lint   # web-ext lint, tsc and prettier, as CI runs them
make test   # the unit tests (Vitest)
make build  # an unsigned package in web-ext-artifacts/
```

### Releasing

Bump the version in `src/manifest.json` and `package.json` (`npm version X.Y.Z
--no-git-tag-version` does both) in a PR titled `chore: release X.Y.Z`. When it's merged, the
release workflow submits it to addons.mozilla.org as a new version of the listing (its
summary, category and licence come from `amo-metadata.json`) and publishes release `vX.Y.Z`.
Mozilla reviews the version, and Firefox updates to it once it's approved.

## Licence

The code is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE).
The icons are not: they're © Luke Brewerton under
[CC BY-NC-ND 4.0](LICENSES/CC-BY-NC-ND-4.0.txt). See
[Licence and branding](https://job-tracker-docs.job-finder.dev/about/licence-and-branding/).
