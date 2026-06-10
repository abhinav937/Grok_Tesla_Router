/* Demo trip data for the Tesla Trip Planner redesign prototype.
   Madison WI → Austin TX, BBQ in Kansas City, scenic Hill Country.
   Coordinates are normalized to a 1000×1000 map viewBox. */

const TRIP = {
  prompt: 'Madison WI to Austin TX, BBQ stop in Kansas City, top up before Texas, scenic through the Hill Country',
  origin: { name: 'Madison', region: 'Wisconsin', address: 'Madison, WI', type: 'endpoint', pt: [612, 120] },
  destination: { name: 'Austin', region: 'Texas', address: 'Austin, TX', type: 'endpoint', pt: [486, 902] },
  waypoints: [
    {
      name: 'Joe’s Kansas City', region: 'Kansas City, MO', address: '3002 W 47th Ave, Kansas City, KS',
      type: 'food', detour: 4, seed: 'bbqsmoke',
      reason: 'Legendary burnt ends, 4 min off I-35 — go before noon to beat the line.',
      pt: [520, 388],
    },
    {
      name: 'Wichita Supercharger', region: 'Wichita, KS', address: '2441 N Maize Rd, Wichita, KS',
      type: 'charging', detour: 6, seed: 'evcharge',
      reason: '250 kW V3 stall. Charge to 90% here before the long Texas leg.',
      pt: [430, 540],
    },
    {
      name: 'Fredericksburg', region: 'Texas Hill Country', address: 'Main St, Fredericksburg, TX',
      type: 'scenic', detour: 35, seed: 'hillcountry',
      reason: 'Peel onto US-290 for limestone hills, vineyards, and wildflower season.',
      pt: [452, 792],
    },
  ],
  legs: [
    { dist: '512 mi', time: '7h 38m', miles: 512, secs: 27480, via: 'I-90 W · I-35 S' },
    { dist: '199 mi', time: '2h 58m', miles: 199, secs: 10680, via: 'I-35 S' },
    { dist: '432 mi', time: '6h 24m', miles: 432, secs: 23040, via: 'I-35 S · US-290' },
    { dist: '78 mi',  time: '1h 22m', miles: 78,  secs: 4920,  via: 'US-290 E' },
  ],
  total: { dist: '1,221 mi', time: '18h 22m', days: 2, kwh: '362 kWh' },
  notes: [
    'Split into 2 days — an overnight near Wichita keeps each day under 9 hours.',
    'Joe’s KC sits ~4 min off I-35; arrive before 11am to skip the lunch line.',
    'Top up to 90% at the Wichita Supercharger before the long, sparse Texas leg.',
    'US-290 through Fredericksburg adds ~35 min but is the scenic highlight of the trip.',
  ],
  // The Grok reasoning stream, chunked for a believable typewriter effect.
  reasoning: [
    'Parsing request — origin Madison, WI; destination Austin, TX. ',
    'Constraints detected: a BBQ stop, a charge before Texas, and scenic Hill Country. ',
    '\n\nRouting spine: I-35 South is the natural corridor — Madison → Kansas City → Wichita → Austin, roughly 1,200 mi. ',
    '\n\nBBQ: Kansas City is the obvious burnt-ends detour and sits right on I-35. Selecting a top-rated joint ~4 min off the highway to minimize the detour. ',
    '\n\nCharging: the gap from Kansas to central Texas is long and sparse. Inserting a 250 kW Supercharger near Wichita so arrival state-of-charge stays comfortable. ',
    '\n\nScenic: to honor "Hill Country," peel off I-35 near the end onto US-290 through Fredericksburg — limestone hills, vineyards, wildflowers. ',
    '\n\nDaily cap: total drive ≈ 18h. Splitting into 2 days with an overnight near Wichita keeps each day under 9 hours. ',
    '\n\nFinalizing 3 waypoints and handing off to plan_road_trip…',
  ],
  usage: { reasoning_tokens: 1284, prompt_tokens: 612, completion_tokens: 348, total_tokens: 2244, duration_ms: 6200 },
};

const EXAMPLE_PROMPTS = [
  'Madison WI → Austin TX, BBQ in Kansas City, scenic Hill Country',
  'SF to Portland on Highway 1, food stops only, avoid big cities',
  'Chicago → Nashville, roadside BBQ, keep each day under 8 hours',
];

const STOP_META = {
  food:       { label: 'Food',       color: 'var(--stop-food)',       icon: 'Utensils' },
  charging:   { label: 'Charging',   color: 'var(--stop-charging)',   icon: 'BatteryCharging' },
  scenic:     { label: 'Scenic',     color: 'var(--stop-scenic)',     icon: 'Mountain' },
  rest:       { label: 'Rest',       color: 'var(--stop-rest)',       icon: 'Coffee' },
  attraction: { label: 'Attraction', color: 'var(--stop-attraction)', icon: 'Star' },
  endpoint:   { label: '',           color: 'var(--accent)',          icon: 'MapPin' },
};

const RAW_STOP_COLOR = {
  food: '#FF9F43', charging: '#7CF35E', scenic: '#4FA8FF',
  rest: '#B79CFF', attraction: '#FFD25A', endpoint: '#3CE0C4',
};

// Ordered list of every stop (origin → waypoints → destination) with letter labels.
function buildStops(trip) {
  const all = [trip.origin, ...trip.waypoints, trip.destination];
  let cumMiles = 0, cumSecs = 0;
  return all.map((s, i) => {
    const legAfter = trip.legs[i] || null;
    const cum = { miles: cumMiles, secs: cumSecs };
    if (legAfter) { cumMiles += legAfter.miles; cumSecs += legAfter.secs; }
    return {
      ...s,
      index: i,
      label: String.fromCharCode(65 + i),
      isEndpoint: s.type === 'endpoint',
      isOrigin: i === 0,
      isDest: i === all.length - 1,
      legAfter,
      cum,
    };
  });
}

function fmtDur(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

Object.assign(window, { TRIP, EXAMPLE_PROMPTS, STOP_META, RAW_STOP_COLOR, buildStops, fmtDur });
