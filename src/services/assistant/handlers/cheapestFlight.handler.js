// Cheapest-flight intent handler.
//
// This is the core "grounded AI" pattern: the BACKEND queries the database,
// sorts by price, and verifies the data. Gemini is then asked ONLY to phrase
// that verified result — it never retrieves data and never does the maths, so
// it cannot invent a flight number, price, or date.
import Flight from "../../../models/flightModel.js";
import { extractRoute } from "../entity.extractor.js";
import { buildCheapestFlightPrompt } from "../prompt.builder.js";
import { generateContent } from "../gemini.client.js";

// How many flights to return — cheapest first.
const MAX_RESULTS = 3;

// Compact, human-readable departure time for prompts and templates.
const formatDeparture = (date) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * @param {{message:string}} input
 * @returns {Promise<object>} a handler result (always `handled:true` once the
 *   intent is CHEAPEST_FLIGHT — it either gives flights, reports none found,
 *   or asks the user for the route).
 */
export const cheapestFlightHandler = async ({ message }) => {
  const { origin, destination } = await extractRoute(message);

  // No recognisable route — ask the user. Still zero tokens.
  if (!origin && !destination) {
    return {
      handled: true,
      intent: "CHEAPEST_FLIGHT",
      reply:
        'Which route would you like? Tell me the cities — for example, ' +
        '"cheapest flight from Kathmandu to Dubai".',
      data: null,
      suggestions: ["Cheapest flight to Dubai", "Flights from Kathmandu"],
      usage: null,
    };
  }

  // Build the query from whatever route parts were extracted.
  const query = { "origin.dateTime": { $gte: new Date() } };
  if (origin) query["origin.airportCode"] = origin.code;
  if (destination) query["destination.airportCode"] = destination.code;

  const flights = await Flight.find(query)
    .sort("price.totalDisplayFare") // cheapest first
    .limit(MAX_RESULTS)
    .lean();

  const routeText =
    [origin?.city, destination?.city].filter(Boolean).join(" to ") ||
    "that route";

  if (flights.length === 0) {
    return {
      handled: true,
      intent: "CHEAPEST_FLIGHT",
      reply: `I couldn't find any upcoming flights for ${routeText}. Try a different route or check back later.`,
      data: null,
      suggestions: [],
      usage: null,
    };
  }

  // Compact summary the LLM phrases — small prompt, every number verified.
  const compact = flights.map((f) => ({
    airline: f.operatorName,
    flightNumber: f.flightNumber,
    from: f.origin.cityName,
    to: f.destination.cityName,
    departs: formatDeparture(f.origin.dateTime),
    price: f.price.totalDisplayFare,
    currency: f.price.currency || "NPR",
    refundable: !!f.attr?.isRefundable,
  }));

  let reply;
  let usage = null;
  try {
    const result = await generateContent(
      buildCheapestFlightPrompt(compact, message)
    );
    reply = result.text;
    usage = result.usage;
  } catch (err) {
    // Gemini unavailable — fall back to a deterministic template so the user
    // still gets the real, correct answer.
    console.error("cheapestFlightHandler: Gemini phrasing failed:", err.message);
    const top = compact[0];
    reply =
      `Cheapest for ${routeText}: ${top.airline} ${top.flightNumber}, ` +
      `${top.currency} ${top.price.toLocaleString()}, departing ${top.departs}` +
      (compact.length > 1
        ? `. ${compact.length - 1} more option(s) available.`
        : ".");
  }

  return {
    handled: true,
    intent: "CHEAPEST_FLIGHT",
    reply,
    data: { flights }, // full flight docs — lets the UI render flight cards
    suggestions: [],
    usage,
  };
};
