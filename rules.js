// CityRNG badge rules. Each rule is a deterministic predicate over known fields: a value the catalog does not have never matches.
// test(m, poolDate) and evidence(m, poolDate) read the prepared member from prep().

export const RULESET = '1';

export const norm = (s) => s.normalize('NFKC').toLowerCase();

const fmt = (n) => n.toLocaleString('en');
const chars = (s) => Array.from(s);
const text = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

export function prep(raw) {
  const name = text(raw.name), ascii = text(raw.ascii);
  return {
    ...raw,
    n: name ? norm(name) : null,
    a: ascii ? ascii.toLowerCase() : null,
    letters: ascii ? ascii.toLowerCase().replace(/[^a-z]/g, '') : null,
    population: Number.isInteger(raw.population) && raw.population > 0 ? raw.population : null,
    elevation: num(raw.elevation), lat: num(raw.lat), lon: num(raw.lon),
    kind: raw.kind === 'capital' || raw.kind === 'regional' || raw.kind === 'city' ? raw.kind : null,
    tz: text(raw.tz), names: Number.isInteger(raw.names) && raw.names >= 0 ? raw.names : null,
    continent: text(raw.continent),
  };
}

const people = (m) => `${m.name} has ${fmt(m.population)} people in GeoNames`;
const height = (m) => `${m.name} sits at ${fmt(m.elevation)} m (${fmt(Math.round(m.elevation * 3.28084))} ft)`;
const place = (m) => `${m.name} is at ${m.lat}°, ${m.lon}°`;
const nm = (m) => `"${m.name}"`;
const byPop = (lo, hi = Infinity) => (m) => m.population !== null && m.population >= lo && m.population < hi;
const start = (re) => (m) => m.n !== null && re.test(m.n);
const onCont = (c) => (m) => m.continent === c;
const where = (m) => `${m.name} is in ${m.continent}`;

export const RULES = [
  { id: 'hundred-thousand', name: 'Hundred Thousand', family: 'Population', rule: 'Population from 100,000 up to 250,000', test: byPop(100000, 250000), evidence: people },
  { id: 'quarter-million', name: 'Quarter Million', family: 'Population', rule: 'Population from 250,000 up to 500,000', test: byPop(250000, 500000), evidence: people },
  { id: 'half-million', name: 'Half Million', family: 'Population', rule: 'Population from 500,000 up to 1,000,000', test: byPop(500000, 1000000), evidence: people },
  { id: 'million-city', name: 'Million City', family: 'Population', rule: 'Population of 1,000,000 or more', test: byPop(1000000), evidence: people },
  { id: 'multi-million', name: 'Multi-Million', family: 'Population', rule: 'Population of 5,000,000 or more', test: byPop(5000000), evidence: people },
  { id: 'megacity', name: 'Megacity', family: 'Population', rule: 'Population of 10,000,000 or more', test: byPop(10000000), evidence: people },

  { id: 'national-capital', name: 'National Capital', family: 'Role', rule: 'GeoNames lists it as a national capital or seat of government', test: (m) => m.kind === 'capital', evidence: (m) => `${m.name} is a national capital or seat of government` },
  { id: 'regional-capital', name: 'Regional Capital', family: 'Role', rule: 'GeoNames lists it as the seat of a first-level administrative division', test: (m) => m.kind === 'regional', evidence: (m) => `${m.name} is the seat of a first-level division` },

  { id: 'below-sea-level', name: 'Below Sea Level', family: 'Elevation', rule: 'Elevation under 0 m', test: (m) => m.elevation !== null && m.elevation < 0, evidence: height },
  { id: 'sea-level-city', name: 'Sea-Level City', family: 'Elevation', rule: 'Elevation of 5 m or less', test: (m) => m.elevation !== null && m.elevation <= 5, evidence: height },
  { id: 'highland-city', name: 'Highland City', family: 'Elevation', rule: 'Elevation of 1,000 m or more', test: (m) => m.elevation !== null && m.elevation >= 1000, evidence: height },
  { id: 'high-city', name: 'High City', family: 'Elevation', rule: 'Elevation of 2,000 m or more', test: (m) => m.elevation !== null && m.elevation >= 2000, evidence: height },
  { id: 'sky-city', name: 'Sky City', family: 'Elevation', rule: 'Elevation of 3,000 m or more', test: (m) => m.elevation !== null && m.elevation >= 3000, evidence: height },

  { id: 'southern-hemisphere', name: 'Southern Hemisphere', family: 'Hemisphere', rule: 'South of the equator', test: (m) => m.lat !== null && m.lat < 0, evidence: place },
  { id: 'equatorial', name: 'Equatorial', family: 'Latitude', rule: 'Within 5 degrees of the equator', test: (m) => m.lat !== null && Math.abs(m.lat) <= 5, evidence: place },
  { id: 'polar-reach', name: 'Polar Reach', family: 'Latitude', rule: 'At 60 degrees latitude or beyond', test: (m) => m.lat !== null && Math.abs(m.lat) >= 60, evidence: place },
  { id: 'in-the-tropics', name: 'In the Tropics', family: 'Climate belt', rule: 'Between the Tropic of Cancer and the Tropic of Capricorn (23.44 degrees)', test: (m) => m.lat !== null && Math.abs(m.lat) <= 23.44, evidence: place },
  { id: 'prime-meridian', name: 'Prime Meridian', family: 'Meridian', rule: 'Within 1 degree of the prime meridian', test: (m) => m.lon !== null && Math.abs(m.lon) <= 1, evidence: place },
  { id: 'date-line', name: 'Date Line', family: 'Longitude', rule: 'Within 10 degrees of the 180th meridian', test: (m) => m.lon !== null && Math.abs(m.lon) >= 170, evidence: place },
  { id: 'oceania', name: 'Oceania', family: 'Continent', rule: 'On the continent Oceania', test: onCont('Oceania'), evidence: where },
  { id: 'africa', name: 'Africa', family: 'Continent', rule: 'On the continent Africa', test: onCont('Africa'), evidence: where },
  { id: 'south-america', name: 'South America', family: 'Continent', rule: 'On the continent South America', test: onCont('South America'), evidence: where },
  { id: 'europe', name: 'Europe', family: 'Continent', rule: 'On the continent Europe', test: onCont('Europe'), evidence: where },
  { id: 'north-america', name: 'North America', family: 'Continent', rule: 'On the continent North America', test: onCont('North America'), evidence: where },

  { id: 'san-santa', name: 'San or Santa', family: 'Name start', rule: 'Name starts with the word San, Santa or São', test: start(/^(san|santa|são|sao)\s/), evidence: nm },
  { id: 'al-name', name: 'Al Name', family: 'Name start', rule: 'Name starts with the word Al', test: start(/^al[\s-]/), evidence: nm },
  { id: 'port-or-fort', name: 'Port or Fort', family: 'Name start', rule: 'Name starts with the word Port or Fort', test: start(/^(port|fort)[\s-]/), evidence: nm },
  { id: 'new-or-nova', name: 'New or Nova', family: 'Name start', rule: 'Name starts with the word New, Nova or Novo', test: start(/^(new|nova|novo)\s/), evidence: nm },
  { id: 'villa-ciudad', name: 'Villa or Ciudad', family: 'Name start', rule: 'Name starts with the word Villa or Ciudad', test: start(/^(villa|ciudad)\s/), evidence: nm },
  { id: 'palindrome-name', name: 'Palindrome Name', family: 'Name pattern', rule: 'Letters of the plain-letter name read the same backwards (3 or more)', test: (m) => m.letters !== null && m.letters.length >= 3 && m.letters === [...m.letters].reverse().join(''), evidence: nm },
  { id: 'double-letter-name', name: 'Double Letter Name', family: 'Name pattern', rule: 'Plain-letter name has two equal letters side by side', test: (m) => m.a !== null && /([a-z])\1/.test(m.a), evidence: nm },
  { id: 'same-ends', name: 'Same Ends', family: 'Name pattern', rule: 'Plain-letter name starts and ends with the same letter (3 or more letters)', test: (m) => m.letters !== null && m.letters.length >= 3 && m.letters[0] === m.letters.at(-1), evidence: nm },
  { id: 'short-name', name: 'Short Name', family: 'Name length', rule: 'Name of 4 characters or fewer', test: (m) => m.n !== null && chars(m.n).length <= 4, evidence: (m) => `${nm(m)} has ${chars(m.n).length} characters` },
  { id: 'long-name', name: 'Long Name', family: 'Name length', rule: 'Name of 14 characters or more', test: (m) => m.n !== null && chars(m.n).length >= 14, evidence: (m) => `${nm(m)} has ${chars(m.n).length} characters` },
  { id: 'very-long-name', name: 'Very Long Name', family: 'Name length', rule: 'Name of 20 characters or more', test: (m) => m.n !== null && chars(m.n).length >= 20, evidence: (m) => `${nm(m)} has ${chars(m.n).length} characters` },
  { id: 'hyphenated-name', name: 'Hyphenated Name', family: 'Name form', rule: 'Name contains a hyphen', test: (m) => m.n !== null && m.n.includes('-'), evidence: nm },
  { id: 'multi-word-name', name: 'Multi-Word Name', family: 'Name form', rule: 'Name has three or more words', test: (m) => m.n !== null && m.n.split(/\s+/).filter(Boolean).length >= 3, evidence: nm },
  { id: 'rare-initial', name: 'Rare Initial', family: 'Initial', rule: 'Plain-letter name starts with Q, X or Z', test: (m) => m.letters !== null && 'qxz'.includes(m.letters[0] ?? '#'), evidence: nm },
  { id: 'vowel-initial', name: 'Vowel Initial', family: 'Initial', rule: 'Plain-letter name starts with A, E, I, O or U', test: (m) => m.letters !== null && 'aeiou'.includes(m.letters[0] ?? '#'), evidence: nm },
  { id: 'diacritic-name', name: 'Diacritic Name', family: 'Spelling', rule: 'The name differs from its plain-letter form (accents or another script)', test: (m) => m.n !== null && m.a !== null && m.name.trim() !== m.ascii.trim(), evidence: (m) => `${nm(m)} is written ${JSON.stringify(m.ascii)} in plain letters` },

  { id: 'much-translated', name: 'Much Translated', family: 'Fame', rule: 'GeoNames lists 50 or more alternate names', test: (m) => m.names !== null && m.names >= 50, evidence: (m) => `${m.name} has ${m.names} alternate names in GeoNames` },
  { id: 'world-famous', name: 'World Famous', family: 'Fame', rule: 'GeoNames lists 100 or more alternate names', test: (m) => m.names !== null && m.names >= 100, evidence: (m) => `${m.name} has ${m.names} alternate names in GeoNames` },
  { id: 'ocean-timezone', name: 'Ocean Time Zone', family: 'Time zone', rule: 'Time zone belongs to the Pacific, Indian, Atlantic, Arctic or Antarctic regions', test: (m) => m.tz !== null && /^(Pacific|Indian|Atlantic|Arctic|Antarctica)\//.test(m.tz), evidence: (m) => `${m.name} is in the time zone ${m.tz}` },
  { id: 'round-population', name: 'Round Population', family: 'Number pattern', rule: 'Population is a whole multiple of 100,000', test: (m) => m.population !== null && m.population % 100000 === 0, evidence: people },
  { id: 'palindrome-population', name: 'Palindrome Population', family: 'Number pattern', rule: 'Population digits read the same backwards', test: (m) => m.population !== null && String(m.population).length >= 3 && String(m.population) === [...String(m.population)].reverse().join(''), evidence: people },
];
