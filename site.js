// Everything specific to CityRNG: names, copy, card art, and which facts the result card shows. app.js is generic.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n.toLocaleString('en');
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const band = (x, cuts) => cuts.find(([max]) => x < max)[1];
const unknown = 'not in GeoNames';
const ROLE = { capital: 'National capital or seat of government', regional: 'Seat of a first-level division', city: 'City' };

export default {
  key: 'cityrng',
  name: 'CityRNG',
  pageTitle: 'CityRNG: a daily city discovery game',
  noun: 'city', nouns: 'cities', thing: 'City',
  worldNote: 'every city on Earth',
  repo: 'https://github.com/sharkjujg/cityrng',
  headline: 'Discover a city. Once a day.',
  intro: (n) => `Roll once to draw one city of 100,000 people or more from a pool of <b>${fmt(n)}</b>. Every city has the same 1-in-${fmt(n)} chance, capital or crossroads. Badges explain what is unusual about it, and rarer badges earn more rarity points (RP). The daily limit resets at 00:00 UTC.`,
  notice: 'Prototype: the city facts are real (from <a href="https://www.geonames.org">GeoNames</a>, CC BY), but there are no photos or accounts yet, and your results are saved only in this browser. <a href="#/about">What that means</a>',
  header: (m) => ({ title: m.name, sub: `${m.country} · ${fmt(m.population)} people` }),
  label: (m) => `${m.name}, ${m.country}`,
  shelves: (m) => [
    ['Country', m.country], ['Continent', m.continent], ['Kind', ROLE[m.kind] ?? 'City'],
    ['Population', band(m.population, [[250000, '100,000 to 249,999'], [500000, '250,000 to 499,999'], [1000000, '500,000 to 999,999'], [5000000, '1 to 5 million'], [10000000, '5 to 10 million'], [Infinity, '10 million or more']])],
    ...(m.elevation !== null ? [['Elevation', band(m.elevation, [[0, 'Below sea level'], [100, '0 to 99 m'], [500, '100 to 499 m'], [1000, '500 to 999 m'], [2000, '1,000 to 1,999 m'], [Infinity, '2,000 m or more']])]] : []),
    ['Hemisphere', m.lat < 0 ? 'Southern' : 'Northern'],
    ['Latitude band', `${Math.floor(Math.abs(m.lat) / 10) * 10} to ${Math.floor(Math.abs(m.lat) / 10) * 10 + 10}° ${m.lat < 0 ? 'south' : 'north'}`],
    ...(m.tz ? [['Time zone region', m.tz.split('/')[0]]] : []),
    ...(m.letters ? [['Name starts with', m.letters[0].toUpperCase()]] : []),
  ],
  facts: (m) => [
    ['Country', m.country], ['Continent', m.continent], ['Population', `${fmt(m.population)} (as listed by GeoNames)`], ['Kind', ROLE[m.kind] ?? unknown],
    ['Elevation', m.elevation === null ? unknown : `${fmt(m.elevation)} m (${fmt(Math.round(m.elevation * 3.28084))} ft)`],
    ['Coordinates', `${m.lat}°, ${m.lon}°`], ['Time zone', m.tz ?? unknown], ['Alternate names listed', m.names === null ? unknown : String(m.names)],
    ...(m.ascii && m.ascii !== m.name ? [['In plain letters', m.ascii]] : []),
    ['Source', `GeoNames ${m.id}`, `https://www.geonames.org/${encodeURIComponent(m.id)}`],
  ],
  art(m) { // original skyline: more and taller buildings for bigger cities, tinted by the city id; it never affects scoring
    const h = hash(m.id), hue = h % 360, s = Math.min(1, Math.max(0, Math.log10(m.population / 100000) / 2)); // 100,000 people -> 0, 10 million -> 1
    let seed = h;
    const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    let x = 3, towers = '';
    while (x < 96) {
      const w = 6 + Math.floor(rnd() * 8), bh = 12 + rnd() * (20 + 40 * s);
      towers += `<rect x="${x}" y="${(78 - bh).toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" fill="hsl(${hue} 24% ${(17 + rnd() * 11).toFixed(0)}%)"/>`;
      for (let wy = 78 - bh + 4; wy < 74; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (rnd() > 0.55) towers += `<rect x="${wx}" y="${wy.toFixed(1)}" width="1.6" height="2.2" fill="#ffd98a" opacity=".85"/>`;
      x += w + 1;
    }
    return `<svg class="avatar" viewBox="0 0 100 100" role="img" aria-label="Generated skyline for the city. Not a photograph or a map.">
      <defs><linearGradient id="sky${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${(hue + 220) % 360} 45% 12%)"/><stop offset="1" stop-color="hsl(${hue} 50% 38%)"/></linearGradient></defs>
      <rect width="100" height="100" rx="8" fill="url(#sky${h})"/><circle cx="${78 + (h % 12)}" cy="${14 + (h % 9)}" r="5" fill="#f3efd8" opacity=".9"/>
      ${towers}<rect x="0" y="78" width="100" height="22" fill="hsl(${hue} 25% 9%)"/>
      <text x="50" y="91" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="9" letter-spacing="1.5" fill="#e8ecf4">${esc(m.cc)}</text>
      <text x="50" y="97.5" text-anchor="middle" font-family="system-ui,sans-serif" font-size="4.6" letter-spacing=".6" fill="#8e9ab0">GENERATED SKYLINE</text></svg>`;
  },
  poolNotice: 'Every city comes from <a href="https://www.geonames.org">GeoNames</a> (Creative Commons Attribution), as a snapshot of places it lists as cities proper (plain populated places, administrative seats and capitals) with a population of 100,000 or more. City sections, historical or abandoned places and localities are not included. Populations are the figures GeoNames lists, which come from different sources and years, and the borders of a "city" differ between countries (Tokyo here is the metropolis of 23 wards, not the wider region). The pool describes this catalog, not every city on Earth.',
  poolExtra(pool) {
    const tally = (get) => { const c = new Map(); for (const m of pool.members) for (const v of get(m)) c.set(v, (c.get(v) || 0) + 1); return [...c]; };
    const table = (title, rows) => `<table><thead><tr><th>${title}</th><th class="n">Cities</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v)}</td></tr>`).join('')}</tbody></table>`;
    const top = (rows, k) => rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k);
    return `<h2>What is in the pool</h2><p class="small muted">Disclosed because a badge is only rare relative to this mix.</p>
      ${table('Continent', top(tally((m) => [m.continent]), 7))}${table('Kind', top(tally((m) => [ROLE[m.kind] ?? 'City']), 3))}${table('Top countries', top(tally((m) => [m.country]), 10))}`;
  },
  aboutData: `<h2>Where the facts come from</h2>
    <p>Name, country, coordinates, population, elevation, time zone, role (national capital, first-level seat) and the number of alternate names come from the <a href="https://www.geonames.org">GeoNames</a> geographical database, which is licensed under Creative Commons Attribution: this site credits GeoNames and links to it, and the data is provided as is. The elevation is GeoNames' digital elevation model value for the point, in metres, and a missing or impossible value is shown as "not in GeoNames" and never earns a badge. "Alternate names" is how many spellings and translations GeoNames lists, a rough sign of how widely a place is written about. The artwork is a generated skyline, not a photograph or a map.</p>`,
  terms: 'It is not affiliated with GeoNames or any city, country or government. Badges describe catalog facts, not how large, old or important a place is.',
};
