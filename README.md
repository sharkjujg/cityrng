# CityRNG

A daily city discovery game: roll once per UTC day, draw one city of 100,000 people or more from a GeoNames snapshot, and see which badges make it unusual. A sibling of CinemaRNG, BrickRNG, ExoRNG, QuakeRNG, PeakRNG, AsteroidRNG, BookRNG, SpeciesRNG and AirportRNG on the same engine.

**This is a prototype.** City facts are a snapshot of [GeoNames](https://www.geonames.org), used under its Creative Commons Attribution licence (credit: GeoNames; data provided as is). There is no backend, so results live in the player's browser. No photographs or maps are used. Unofficial fan project, not affiliated with GeoNames or any city or government.

## What is built

| Area | Status |
| --- | --- |
| Daily roll, unbiased secure draw, one per UTC day, retry-safe | Done, browser-local (the day comes from the host's `Date` header, not the device clock) |
| 45 badge rules, families, RP = 100 / p, overall rarity tiers, tie rules | Done, tested in `rules.js`; `check.html` fails if any city earns no badge |
| Animated reveal, badges appearing from worst to best, reduced-motion aware | Done |
| Achievements derived from your rolls, with goals scaled to the pool size (1,355 for 5,857 cities) | Done (`achievements.js`) |
| Badge catalog, badge pages, levels, history, export, delete, pool page | Done |
| Sign-in, ranked limit, leaderboards, friends | Needs a server (see the `rng-accounts` design) |

## Run it

No build step.

```
python -m http.server 8765
```

Open <http://localhost:8765>. Open `/check.html` for the self-check; its title becomes `PASS` or `FAIL n`.

## Layout

- `engine.js` and `achievements.js` generic scoring, tiers, sampling, day helpers and achievements (shared with sibling RNG games)
- `rules.js` this game's badge rules; `site.js` its names, copy, art and shelves; `fixtures.js` rule fixtures for `check.html`
- `app.js`, `index.html`, `style.css` the site (hash routes, so it works on any static host)
- `data/pool-v1.json` the published pool; `tools/import_geonames.py` rebuilds it from GeoNames' `cities15000.zip` and `countryInfo.txt`, and `tools/test_import.py` checks the conversion. Only proper cities (not city sections, historical or abandoned places) with a population of 100,000 or more are kept; a missing or impossible elevation stays unknown so it never earns a badge

## Publishing

GitHub Pages serves the repository root from `main`. Push to `main` to update the site.
