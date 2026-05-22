// Pulls a flight route (origin + destination) out of a free-text message.
//
// The airport reference list is built from the Flight collection itself, so
// extraction always reflects exactly the routes that have real data — no
// hard-coded city list to maintain.
import Flight from "../../models/flightModel.js";

// In-memory cache for the airport list, mirroring the Aviationstack caching
// already used elsewhere in this backend. Refreshed every 10 minutes so newly
// seeded routes appear without a server restart.
const AIRPORT_TTL_MS = 10 * 60 * 1000;
let airportCache = { data: [], at: 0 };

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Distinct list of airports (code + city) across all flights. */
const loadAirports = async () => {
  const fresh = Date.now() - airportCache.at < AIRPORT_TTL_MS;
  if (fresh && airportCache.data.length > 0) return airportCache.data;

  const flights = await Flight.find(
    {},
    {
      "origin.airportCode": 1,
      "origin.cityName": 1,
      "destination.airportCode": 1,
      "destination.cityName": 1,
    }
  ).lean();

  const map = new Map();
  for (const f of flights) {
    for (const end of [f.origin, f.destination]) {
      if (end?.airportCode && !map.has(end.airportCode)) {
        map.set(end.airportCode, {
          code: end.airportCode.toUpperCase(),
          city: (end.cityName || "").trim(),
        });
      }
    }
  }

  airportCache = { data: [...map.values()], at: Date.now() };
  return airportCache.data;
};

/**
 * Extract origin and destination airports mentioned in a message.
 *
 * Uses "from X" / "to Y" prepositions when present; otherwise assumes the
 * first airport mentioned is the origin and the second the destination. A
 * lone airport is treated as the destination ("cheapest flight to Dubai").
 *
 * @param {string} message
 * @returns {Promise<{origin: object|null, destination: object|null}>}
 */
export const extractRoute = async (message) => {
  const airports = await loadAirports();
  // Pad with spaces so \b works at the very start/end of the string.
  const text = ` ${String(message || "").toLowerCase()} `;

  // Find each airport mentioned, recording where it appears.
  const found = [];
  for (const airport of airports) {
    const needles = [airport.code, airport.city].filter(Boolean);
    for (const needle of needles) {
      const re = new RegExp(`\\b${escapeRegex(needle.toLowerCase())}\\b`);
      const match = re.exec(text);
      if (match) {
        found.push({ airport, idx: match.index });
        break; // counted once, by code or city — whichever matched first
      }
    }
  }
  found.sort((a, b) => a.idx - b.idx);

  let origin = null;
  let destination = null;

  // Honour explicit "from" / "to" prepositions.
  for (const f of found) {
    const before = text.slice(Math.max(0, f.idx - 8), f.idx);
    if (/\bfrom\s*$/.test(before) && !origin) origin = f.airport;
    else if (/\bto\s*$/.test(before) && !destination) destination = f.airport;
  }

  // Fall back to positional order for anything not pinned by a preposition.
  const rest = found.filter(
    (f) => f.airport !== origin && f.airport !== destination
  );
  if (!destination && rest.length > 0) destination = rest.shift().airport;
  if (!origin && rest.length > 0) origin = rest.shift().airport;

  return { origin, destination };
};
