// Tier-0 intent classification.
//
// This runs BEFORE any Gemini call and costs zero tokens — it is plain
// keyword/regex matching. Most messages are classified here, which is the
// single biggest token saver in the whole design: FAQ answers and flight
// lookups never reach the LLM (or reach it with a tiny prompt).
//
// The result is only a hint. The matching handler still decides whether it
// can actually answer; if it cannot, the request falls through to general
// chat. So a wrong guess here is never fatal — it just costs one DB lookup.

export const INTENT = {
  FAQ_QUERY: "FAQ_QUERY", // policy / how-to questions
  CHEAPEST_FLIGHT: "CHEAPEST_FLIGHT", // "cheapest flight to X" / find flights
  GENERAL_CHAT: "GENERAL_CHAT", // everything else -> Gemini chat
};

// Policy / how-to phrasing. Checked FIRST so a stray word like "flight" in
// "how to cancel my flight" cannot misroute a genuine FAQ question.
const FAQ_WORDS =
  /\b(how (do|to|can)|cancel\w*|refund\w*|baggage|luggage|check.?in|payment|pay\b|policy|policies|reschedul\w*|booking reference|change my|what (is|are)|am i allowed|do i need)\b/i;

// A flight-related noun. Needed for the CHEAPEST_FLIGHT intent.
const FLIGHT_WORDS = /\b(flight|flights|fare|fares|ticket|tickets|airfare|fly|flying)\b/i;

// Signals the user cares about price specifically.
const PRICE_WORDS =
  /\b(cheap(est)?|lowest|affordable|budget|least expensive|best (price|deal|fare|value))\b/i;

/**
 * Classify a user message into one of the INTENT values.
 * @param {string} message
 * @returns {string} an INTENT value
 */
export const classifyIntent = (message) => {
  const text = String(message || "").toLowerCase();

  // 1. FAQ / how-to questions take priority.
  if (FAQ_WORDS.test(text)) return INTENT.FAQ_QUERY;

  // 2. Finding a flight: a flight noun together with either a price word or
  //    a "to"/"from" preposition (a likely route).
  if (FLIGHT_WORDS.test(text) && (PRICE_WORDS.test(text) || /\b(to|from)\b/.test(text))) {
    return INTENT.CHEAPEST_FLIGHT;
  }

  // 3. Anything else -> general chat, answered by Gemini.
  return INTENT.GENERAL_CHAT;
};
