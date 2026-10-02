# Job Tracker for Firefox

[![CI](https://img.shields.io/github/actions/workflow/status/lukebrewerton/job-tracker-extension/ci.yml?branch=main&label=CI)](https://github.com/lukebrewerton/job-tracker-extension/actions/workflows/ci.yml)
![Development status](https://img.shields.io/badge/development_status-in_development-orange)

A Firefox extension for [Job Tracker](https://github.com/lukebrewerton/job-tracker). One click
on a job advert opens the new-job page on **your own** Job Tracker instance, with the advert's
link and title already filled in.

It's a link-opener, not an API client: it asks only for the `activeTab` and `storage`
permissions, stores no credentials, and talks to nothing but the tab it opens. Your
instance's address is a setting with no default.

> In development: the toolbar button doesn't do anything yet.

## Setting it up

Open `about:addons`, choose **Job Tracker** → **Preferences**, and enter the address you sign
in to Job Tracker at, such as `https://jobs.example.com`. Only `https://` addresses are
accepted, apart from `http://localhost` for a development instance. The setting is saved with
your Firefox account if you use sync.

## Development

Needs Node 24 (`.nvmrc`) and Firefox 142 or newer.

```sh
make sync   # install the dev dependencies
make run    # run it in a temporary Firefox profile, reloading on change
make lint   # web-ext lint, tsc and prettier, as CI runs them
make test   # the unit tests (Vitest)
make build  # an unsigned package in web-ext-artifacts/
```

To load it into your everyday Firefox instead, open `about:debugging#/runtime/this-firefox`,
choose **Load Temporary Add-on…** and pick `src/manifest.json`. It stays until Firefox
restarts.

## Licence

The code is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE).
The icons are not: they're © Luke Brewerton under
[CC BY-NC-ND 4.0](LICENSES/CC-BY-NC-ND-4.0.txt). See
[Licence and branding](https://job-tracker-docs.job-finder.dev/about/licence-and-branding/).
