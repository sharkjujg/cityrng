// CityRNG fixtures for check.html: one row per case, [rule id, field overrides, expected match].
export const V = '2026-11-01';
export const base = { id: '1', name: 'Sample City', ascii: 'Sample City', cc: 'FR', country: 'France', continent: 'Europe', lat: 45, lon: 10, population: 300000, kind: 'city', elevation: 300, tz: 'Europe/Paris', names: 10 };

const bands = (id, key, rows) => rows.map(([v, want]) => [id, { [key]: v }, want]);
const names = (id, yes, no) => [...yes.map((n) => [id, { name: n, ascii: n }, true]), ...no.map((n) => [id, { name: n, ascii: n }, false])];

export const cases = [
  ...bands('hundred-thousand', 'population', [[100000, true], [249999, true], [250000, false], [99999, false], [null, false], [0, false], ['150000', false]]),
  ...bands('quarter-million', 'population', [[250000, true], [499999, true], [249999, false], [500000, false], [null, false]]),
  ...bands('half-million', 'population', [[500000, true], [999999, true], [499999, false], [1000000, false], [null, false]]),
  ...bands('million-city', 'population', [[1000000, true], [999999, false], [null, false]]),
  ...bands('multi-million', 'population', [[5000000, true], [4999999, false], [null, false]]),
  ...bands('megacity', 'population', [[10000000, true], [9999999, false], [null, false]]),

  ...bands('national-capital', 'kind', [['capital', true], ['regional', false], ['city', false], [null, false]]),
  ...bands('regional-capital', 'kind', [['regional', true], ['capital', false], ['city', false], [null, false]]),

  ...bands('below-sea-level', 'elevation', [[-1, true], [0, false], [null, false], [undefined, false]]),
  ...bands('sea-level-city', 'elevation', [[5, true], [0, true], [-3, true], [6, false], [null, false]]),
  ...bands('highland-city', 'elevation', [[1000, true], [999, false], [null, false]]),
  ...bands('high-city', 'elevation', [[2000, true], [1999, false], [null, false]]),
  ...bands('sky-city', 'elevation', [[3000, true], [2999, false], [null, false], ['3000', false]]),

  ...bands('southern-hemisphere', 'lat', [[-0.1, true], [0, false], [10, false], [null, false]]),
  ...bands('equatorial', 'lat', [[5, true], [-5, true], [5.1, false], [-5.1, false], [null, false]]),
  ...bands('polar-reach', 'lat', [[60, true], [-60, true], [59.9, false], [null, false]]),
  ...bands('in-the-tropics', 'lat', [[23.44, true], [-23.44, true], [0, true], [23.45, false], [null, false]]),
  ...bands('prime-meridian', 'lon', [[1, true], [-1, true], [0, true], [1.1, false], [null, false]]),
  ...bands('date-line', 'lon', [[170, true], [-170, true], [169.9, false], [null, false]]),
  ...[['oceania', 'Oceania'], ['africa', 'Africa'], ['south-america', 'South America'], ['europe', 'Europe'], ['north-america', 'North America']]
    .flatMap(([id, c]) => [[id, { continent: c }, true], [id, { continent: 'Asia' }, false], [id, { continent: null }, false]]),

  ...names('san-santa', ['San Diego', 'Santa Cruz', 'São Paulo', 'Sao Paulo'], ['Sanaa', 'Santiago', 'San', 'Pasan Diego']),
  ...names('al-name', ['Al Ain', 'Al-Hasakah'], ['Alexandria', 'Alabama', 'Sal Al']),
  ...names('port-or-fort', ['Port Harcourt', 'Port-au-Prince', 'Fort Worth'], ['Portland', 'Fortaleza', 'Transport City']),
  ...names('new-or-nova', ['New York', 'Nova Iguaçu', 'Novo Hamburgo'], ['Newcastle', 'Novara', 'Novosibirsk']),
  ...names('villa-ciudad', ['Villa Nueva', 'Ciudad Juárez'], ['Villahermosa', 'Ciudadela']),
  ...names('palindrome-name', ['Oruro', 'Aba', 'Ede', 'Nan', 'Madam Im Adam'], ['Lima', 'Ab', 'Rome']),
  ...names('double-letter-name', ['Cannes', 'Aa B'], ['Lima', 'Ab Bc', 'Rome']),
  ...names('same-ends', ['Tarot', 'Ana'], ['Lima', 'Aa', 'Rome']),
  ...names('short-name', ['Rome', 'Ede', 'Pune'], ['Paris', 'Lima!']),
  ...names('long-name', ['x'.repeat(14)], ['x'.repeat(13)]),
  ...names('very-long-name', ['x'.repeat(20)], ['x'.repeat(19)]),
  ...names('hyphenated-name', ['Port-au-Prince', 'Wilkes-Barre'], ['Lima', 'New York']),
  ...names('multi-word-name', ['San Juan de Dios', 'Rio de Janeiro'], ['New York', 'Lima']),
  ...names('rare-initial', ['Zagreb', 'Xi\'an', 'Quito'], ['Yaounde', 'Lima', 'Oslo']),
  ...names('vowel-initial', ['Oslo', 'Abuja', 'Utrecht'], ['Lima', 'Zagreb', 'Yaounde']),
  ['short-name', { name: undefined }, false], ['palindrome-name', { ascii: undefined, name: 'Aba' }, false], ['rare-initial', { ascii: null, name: 'Zagreb' }, false],
  ['diacritic-name', { name: 'São Paulo', ascii: 'Sao Paulo' }, true], ['diacritic-name', { name: 'Lima', ascii: 'Lima' }, false], ['diacritic-name', { name: 'São Paulo', ascii: undefined }, false],
  ['diacritic-name', { name: ' Lima ', ascii: 'Lima' }, false],

  ...bands('much-translated', 'names', [[50, true], [49, false], [null, false], ['50', false]]),
  ...bands('world-famous', 'names', [[100, true], [99, false], [null, false]]),
  ...bands('ocean-timezone', 'tz', [['Pacific/Auckland', true], ['Indian/Mauritius', true], ['Atlantic/Reykjavik', true], ['Europe/Paris', false], ['America/Lima', false], ['Pacific', false], [null, false]]),
  ...bands('round-population', 'population', [[100000, true], [1500000, true], [100001, false], [0, false], [null, false]]),
  ...bands('palindrome-population', 'population', [[123321, true], [1234321, true], [123456, false], [5, false], [null, false]]),
];

export function poolChecks(raw, pool, ok) {
  const ms = raw.members;
  const CONT = new Set(['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']);
  ok('city ids are numeric strings and ascend', ms.every((m, i) => /^[1-9]\d*$/.test(m.id) && (i === 0 || +m.id > +ms[i - 1].id)));
  ok('every city has a name, a plain-letter name, a country, a continent and a kind', ms.every((m) => m.name && m.ascii && m.country && CONT.has(m.continent) && ['capital', 'regional', 'city'].includes(m.kind)));
  ok('populations are whole numbers of at least 100,000', ms.every((m) => Number.isInteger(m.population) && m.population >= 100000));
  ok('coordinates are in range', ms.every((m) => Math.abs(m.lat) <= 90 && Math.abs(m.lon) <= 180));
  ok('elevations are plausible metres (or unknown)', ms.every((m) => m.elevation === null || (m.elevation > -500 && m.elevation < 6000)));
  ok('alternate-name counts are whole numbers', ms.every((m) => Number.isInteger(m.names) && m.names >= 0));
  ok('every city has a time zone', ms.every((m) => typeof m.tz === 'string' && m.tz.includes('/')));
  ok('the pool is large enough to be a game (>= 1000)', pool.n >= 1000);
}
