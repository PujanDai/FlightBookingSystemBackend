// Orchestrator for the AI assistant — the single entry point the controller
// calls. It runs the request pipeline and owns graceful degradation.
//
// Phase 1: every message is general chat. Phase 2 will insert intent
// classification + handler routing at the marked extension point below, so
// most messages will be answered without ever calling Gemini.
import {
  getOrCreateSession,
  getRecentHistory,
  recordTurn,
  findUserSession,
  deleteUserSession,
} from "./context.service.js";
import { buildContents } from "./prompt.builder.js";
import { generateContent, GeminiError } from "./gemini.client.js";
import { isGeminiConfigured } from "../../config/gemini.config.js";

// Shown when Gemini is unreachable or not yet configured. The user still gets
// a useful, on-brand reply instead of a raw error.
const FALLBACK_REPLY =
  "I'm having trouble reaching the assistant right now. You can still " +
  "search flights and manage bookings in the Flixor app — please try the " +
  "chat again in a moment.";

/**
 * Call Gemini with a single retry for transient failures.
 * We deliberately do NOT retry on 429 (quota) — retrying would only make a
 * quota problem worse.
 */
const callGeminiWithRetry = async (contents) => {
  try {
    return await generateContent(contents);
  } catch (err) {
    if (err instanceof GeminiError && err.retryable && err.status !== 429) {
      return await generateContent(contents);
    }
    throw err;
  }
};

/**
 * Handle one user message end-to-end: load context, get a reply, persist.
 * @param {{userId:string, sessionId?:string, message:string}} input
 * @returns {Promise<{sessionId:string, reply:string, intent:string, data:object|null, suggestions:string[]}>}
 */
export const handleMessage = async ({ userId, sessionId, message }) => {
  const session = await getOrCreateSession(userId, sessionId);

  // --- Phase 2 extension point --------------------------------------------
  // Intent classification + handler routing will go here. Handlers that can
  // answer from the database (FAQs, cheapest flight, refunds...) will return
  // early — so the Gemini call below becomes the GENERAL_CHAT fallback only.
  const intent = "GENERAL_CHAT";
  // ------------------------------------------------------------------------

  let reply = FALLBACK_REPLY;
  let usage = null;

  if (isGeminiConfigured()) {
    try {
      const history = getRecentHistory(session);
      const contents = buildContents(history, message);
      const result = await callGeminiWithRetry(contents);
      reply = result.text;
      usage = result.usage;
    } catch (err) {
      // Logged for the developer; internals are never exposed to the client.
      console.error("Assistant Gemini call failed:", err.message);
      reply = FALLBACK_REPLY;
    }
  } else {
    console.warn(
      "GEMINI_API_KEY is not set — assistant is replying with the fallback message."
    );
  }

  await recordTurn(session, { userMessage: message, reply, intent, usage });

  return {
    sessionId: session.sessionId,
    reply,
    intent,
    data: null, // populated by data-driven intent handlers from Phase 2+
    suggestions: [], // quick-reply chips, added in Phase 2+
  };
};

/**
 * Return a session transcript for the chat widget, or null if not found.
 */
export const getSessionHistory = (userId, sessionId) =>
  findUserSession(userId, sessionId);

/**
 * Delete a conversation. Returns the deleted document, or null if not found.
 */
export const clearSession = (userId, sessionId) =>
  deleteUserSession(userId, sessionId);
