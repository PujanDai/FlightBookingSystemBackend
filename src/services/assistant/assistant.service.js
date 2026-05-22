// Orchestrator for the AI assistant — the single entry point the controller
// calls. It runs the 3-tier request pipeline and owns graceful degradation.
//
//   Tier 0  classifyIntent()      free, 0 tokens — keyword rules
//   Tier 1  a specialised handler answers from the database (FAQ, flights...)
//   Tier 2  general chat fallback — Gemini with the flight system prompt
//
// Most messages are answered in Tier 0/1 without a full LLM call, which is
// the design's main token-saving mechanism.
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
import { classifyIntent, INTENT } from "./intent.service.js";
import { handlers } from "./handlers/index.js";

// Shown when Gemini is unreachable or not yet configured. The user still gets
// a useful, on-brand reply instead of a raw error.
const FALLBACK_REPLY =
  "I'm having trouble reaching the assistant right now. You can still " +
  "search flights and manage bookings in the Flixor app — please try the " +
  "chat again in a moment.";

/**
 * Call Gemini with a single retry for transient failures. We deliberately do
 * NOT retry on 429 (quota) — retrying would only make a quota problem worse.
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
 * Tier 2 — general flight chat. Uses the system prompt + recent history.
 * @returns {Promise<{intent:string, reply:string, usage:object|null, data:null, suggestions:string[]}>}
 */
const generalChat = async (session, message) => {
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
      console.error("Assistant general chat failed:", err.message);
      reply = FALLBACK_REPLY;
    }
  } else {
    console.warn(
      "GEMINI_API_KEY is not set — assistant is replying with the fallback message."
    );
  }

  return { intent: INTENT.GENERAL_CHAT, reply, usage, data: null, suggestions: [] };
};

/**
 * Handle one user message end-to-end: classify, route, persist.
 * @param {{userId:string, sessionId?:string, message:string}} input
 * @returns {Promise<{sessionId:string, reply:string, intent:string, data:object|null, suggestions:string[]}>}
 */
export const handleMessage = async ({ userId, sessionId, message }) => {
  const session = await getOrCreateSession(userId, sessionId);

  // --- Tier 0: classify the intent (free, 0 tokens). ----------------------
  const intent = classifyIntent(message);

  // --- Tier 1: let a specialised handler try to answer from the database. -
  let result = null;
  const handler = handlers[intent];
  if (handler) {
    try {
      const handled = await handler({ message, userId, session });
      if (handled?.handled) result = handled;
    } catch (err) {
      // A handler failure is never fatal — fall through to general chat.
      console.error(`Assistant handler (${intent}) failed:`, err.message);
    }
  }

  // --- Tier 2: general chat fallback. -------------------------------------
  if (!result) {
    result = await generalChat(session, message);
  }

  await recordTurn(session, {
    userMessage: message,
    reply: result.reply,
    intent: result.intent,
    usage: result.usage,
  });

  return {
    sessionId: session.sessionId,
    reply: result.reply,
    intent: result.intent,
    data: result.data ?? null,
    suggestions: result.suggestions ?? [],
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
