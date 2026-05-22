// Intent -> handler registry.
//
// Adding a new capability (refund guidance, rebooking, fare-drop...) is just:
//   1. add an INTENT in intent.service.js + a keyword rule,
//   2. create the handler file,
//   3. register it here.
// No other file changes — that is the point of this modular design.
import { INTENT } from "../intent.service.js";
import { faqHandler } from "./faq.handler.js";
import { cheapestFlightHandler } from "./cheapestFlight.handler.js";

// Intents with no entry here (e.g. GENERAL_CHAT) fall through to Gemini chat.
export const handlers = {
  [INTENT.FAQ_QUERY]: faqHandler,
  [INTENT.CHEAPEST_FLIGHT]: cheapestFlightHandler,
};
