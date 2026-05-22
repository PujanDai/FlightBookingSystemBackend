// Conversation context management: every database operation on an
// AssistantSession lives here, so the service layer never touches the model
// directly. This is also where token-saving context trimming happens.
import crypto from "crypto";
import AssistantSession from "../../models/assistant/assistantSessionModel.js";
import { HISTORY_WINDOW } from "./prompt.builder.js";

/**
 * Find this user's existing session, or create a fresh one.
 *
 * The query is scoped by `user`, so passing another user's sessionId simply
 * matches nothing and a brand-new session is created instead — a user can
 * never read or continue someone else's conversation.
 *
 * @param {string} userId
 * @param {string} [sessionId]
 * @returns {Promise<import("mongoose").Document>}
 */
export const getOrCreateSession = async (userId, sessionId) => {
  if (sessionId) {
    const existing = await AssistantSession.findOne({
      sessionId,
      user: userId,
    });
    if (existing) return existing;
  }

  return AssistantSession.create({
    user: userId,
    sessionId: crypto.randomUUID(),
    messages: [],
  });
};

/**
 * The recent turns to send to Gemini — a sliding window, not the whole
 * transcript, so token cost stays flat as the conversation grows.
 * @param {import("mongoose").Document} session
 * @returns {Array<{role:string, content:string}>}
 */
export const getRecentHistory = (session) =>
  session.messages
    .slice(-HISTORY_WINDOW)
    .map((m) => ({ role: m.role, content: m.content }));

/**
 * Append the user message and the assistant reply, update usage counters and
 * the activity timestamp, then persist.
 * @param {import("mongoose").Document} session
 * @param {{userMessage:string, reply:string, intent:string, usage?:object}} turn
 * @returns {Promise<import("mongoose").Document>}
 */
export const recordTurn = async (
  session,
  { userMessage, reply, intent, usage }
) => {
  session.messages.push({ role: "user", content: userMessage, intent });
  session.messages.push({ role: "assistant", content: reply, intent });

  if (usage) {
    session.tokenUsage.promptTokens += usage.promptTokens || 0;
    session.tokenUsage.responseTokens += usage.responseTokens || 0;
    session.tokenUsage.calls += 1;
  }

  session.lastActiveAt = new Date();
  await session.save();
  return session;
};

/**
 * Load a session owned by this user (for the GET history endpoint).
 * @returns {Promise<import("mongoose").Document|null>}
 */
export const findUserSession = (userId, sessionId) =>
  AssistantSession.findOne({ sessionId, user: userId });

/**
 * Delete a session owned by this user (for the DELETE / reset endpoint).
 * @returns {Promise<import("mongoose").Document|null>} the deleted doc, or null.
 */
export const deleteUserSession = (userId, sessionId) =>
  AssistantSession.findOneAndDelete({ sessionId, user: userId });
