#!/usr/bin/env python3
"""Build data/pool-v1.json from GeoNames (https://www.geonames.org/export/, Creative Commons Attribution: credit GeoNames).

Eligible: a populated place that is a city proper (a plain populated place, an administrative seat of any level, a capital or a
seat of government) with a recorded population of 100,000 or more and a known country. Sections of a city (PPLX), historical,
abandoned, destroyed and religious places, farm villages and localities are out. A missing value stays missing (elevation,
alternate names), so it can never satisfy a badge. Elevation is GeoNames' digital elevation model value in metres; the -9999
"no data" sentinel and anything below -500 m is treated as unknown.

Usage:
  mkdir dl && cd dl
  curl -LO https://download.geonames.org/export/dump/cities15000.zip   (and countryInfo.txt)
  python tools/import_geonames.py dl     (from the repository root; run tools/test_import.py first)
"""
import datetime as dt
import json
import pathlib
import sys
import zipfile

COLS = ["id", "name", "ascii", "alt", "lat", "lon", "fclass", "fcode", "cc", "cc2", "a1", "a2", "a3", "a4", "pop", "elev", "dem", "tz", "mod"]
CITY_CODES = {"PPL", "PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLA5", "PPLC", "PPLG"}
KIND = {"PPLC": "capital", "PPLG": "capital", "PPLA": "regional"}  # first-order seat; everything else is a plain city
CONTINENTS = {"AF": "Africa", "AN": "Antarctica", "AS": "Asia", "EU": "Europe", "NA": "North America", "OC": "Oceania", "SA": "South America"}
MIN_POP = 100_000


def parse_countries(lines):
    out = {}
    for line in lines:
        if line.startswith("#") or not line.strip():
            continue
        f = line.rstrip("\n").split("\t")
        out[f[0]] = (f[4], CONTINENTS.get(f[8]))
    return out


def convert(lines, countries):
    pool = []
    for line in lines:
        if not line.strip():
            continue
        r = dict(zip(COLS, line.rstrip("\n").split("\t")))
        try:
            pop, lat, lon = int(r["pop"]), float(r["lat"]), float(r["lon"])
        except (KeyError, ValueError):
            continue
        if not (r["fcode"] in CITY_CODES and pop >= MIN_POP and r["cc"] in countries and r["name"].strip() and -90 <= lat <= 90 and -180 <= lon <= 180):
            continue
        dem = int(r["dem"]) if r["dem"].lstrip("-").isdigit() else None
        pool.append({
            "id": r["id"], "name": r["name"].strip(), "ascii": r["ascii"].strip() or r["name"].strip(), "cc": r["cc"],
            "country": countries[r["cc"]][0], "continent": countries[r["cc"]][1], "lat": round(lat, 4), "lon": round(lon, 4),
            "population": pop, "kind": KIND.get(r["fcode"], "city"), "elevation": dem if dem is not None and dem > -500 else None,
            "tz": r["tz"] or None, "names": len([a for a in r["alt"].split(",") if a.strip()]),
        })
    return sorted(pool, key=lambda m: int(m["id"]))


def main(folder):
    d = pathlib.Path(folder)
    with zipfile.ZipFile(d / "cities15000.zip") as z:
        lines = z.read("cities15000.txt").decode("utf-8").split("\n")
    countries = parse_countries(open(d / "countryInfo.txt", encoding="utf-8"))
    members = convert(lines, countries)
    n, today = len(members), dt.datetime.now(dt.timezone.utc).date().isoformat()
    known = lambda f, what: f"known for {sum(m[f] is not None for m in members):,} of {n:,}; {what}"
    meta = {"version": "v1", "publishedAt": today, "capturedAt": today, "source": "GeoNames, Creative Commons Attribution (https://www.geonames.org)",
            "provenance": f"Snapshot of the GeoNames cities15000 download taken {today}, converted by tools/import_geonames.py. Facts only; no photographs or maps. Credit: GeoNames.",
            "selection": "Cities proper (plain populated places, administrative seats, capitals) with a recorded population of 100,000 or more.",
            "fieldStatus": {"id": "known (GeoNames id)", "name": "known", "ascii": "known", "country": "known", "continent": "known", "lat": "known", "lon": "known",
                            "population": "known (as listed by GeoNames; estimates differ between sources and years)", "kind": "known (capital, first-order administrative seat, or other city)",
                            "elevation": known("elevation", "metres, digital elevation model; unknown never satisfies a badge"), "tz": known("tz", "IANA time zone"),
                            "names": "known (how many alternate names GeoNames lists; a rough measure of how widely a place is written about)"}}
    lines_out = ",\n".join("  " + json.dumps(m, ensure_ascii=False, separators=(",", ":")) for m in members)
    out = pathlib.Path(__file__).resolve().parent.parent / "data" / "pool-v1.json"
    out.parent.mkdir(exist_ok=True)
    out.write_bytes(('{"meta":' + json.dumps(meta, ensure_ascii=False) + ',\n"members":[\n' + lines_out + "\n]}\n").encode("utf-8"))
    print(f"wrote {out}: {n} cities")


if __name__ == "__main__":
    main(sys.argv[1])
