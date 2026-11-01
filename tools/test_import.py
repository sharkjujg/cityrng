#!/usr/bin/env python3
"""Check import_geonames.py against a few hand-made rows in GeoNames' column layout. Usage: python tools/test_import.py"""
import import_geonames as imp


def row(id, name, ascii, alt, lat, lon, fcode, cc, pop, dem, tz="Europe/Test"):
    return "\t".join([id, name, ascii, alt, str(lat), str(lon), "P", fcode, cc, "", "01", "", "", "", str(pop), "", str(dem), tz, "2026-01-01"])


countries = imp.parse_countries(["#comment\n", "FR\tFRA\t250\tFR\tFrance\tParis\t547030\t66000000\tEU\n", "ZZ\tZZZ\t999\tZZ\tZedland\tZed\t1\t1\tAS\n"])
assert countries == {"FR": ("France", "Europe"), "ZZ": ("Zedland", "Asia")}, countries
lines = [
    row("3", "Paris", "Paris", "Lutece,Parigi,Parijs", 48.85, 2.35, "PPLC", "FR", 2138551, 35),
    row("1", "Lyon", "Lyon", "", 45.76, 4.84, "PPLA2", "FR", 472317, "-9999"),                 # no-data elevation sentinel stays unknown
    row("2", "Montmartre", "Montmartre", "", 48.88, 2.34, "PPLX", "FR", 150000, 120),        # a section of a city
    row("4", "Smalltown", "Smalltown", "", 40, 2, "PPL", "FR", 99999, 10),                   # under 100,000
    row("5", "Nowhere", "Nowhere", "", 10, 10, "PPL", "QQ", 500000, 10),                     # unknown country
    row("6", "Toulouse", "Toulouse", "", 43.6, 1.44, "PPLA", "FR", 433055, 146),
    "garbage line without enough columns",
]
got = {m["id"]: m for m in imp.convert(lines, countries)}
assert list(got) == ["1", "3", "6"], list(got)  # ordered by GeoNames id; sections, small and unknown-country rows are gone
p = got["3"]
assert (p["kind"], p["names"], p["elevation"], p["country"], p["continent"], p["population"]) == ("capital", 3, 35, "France", "Europe", 2138551), p
assert got["1"]["elevation"] is None and got["1"]["names"] == 0 and got["1"]["kind"] == "city", got["1"]
assert got["6"]["kind"] == "regional", got["6"]
print("OK")
