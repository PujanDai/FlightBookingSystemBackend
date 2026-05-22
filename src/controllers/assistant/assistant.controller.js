// HTTP layer for the AI assistant. Controllers stay thin: validate the
// request, delegate to the service, shape the response. All AI logic lives
// in services/assistant/.
import asyncHandler from "express-async-handler";
import {
  handleMessage,
  getSessionHistory,
  clearSession,
} from "../../services/assistant/assistant.service.js";

// Caps user input — short messages are enough for a booking assistant and
// this is a simple guard against token-bombing / prompt-injection padding.
const MAX_MESSAGE_LENGTH = 500;

// @desc    Send a message to the AI assistant
// @route   POST /api/assistant/message
// @access  Private
export const postMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400);
    throw new Error("Message is required");
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400);
    throw new Error(
      `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`
    );
  }

  const result = await handleMessage({
    userId: req.userId,
    sessionId: typeof sessionId === "string" ? sessionId : undefined,
    message: message.trim(),
  });

  res.json(result);
});

// @desc    Get a conversation transcript (to reopen the chat widget)
// @route   GET /api/assistant/session/:sessionId
// @access  Private
export const getSession = asyncHandler(async (req, res) => {
  const session = await getSessionHistory(req.userId, req.params.sessionId);

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  res.json({
    sessionId: session.sessionId,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      intent: m.intent,
      createdAt: m.createdAt,
    })),
  });
});

// @desc    Delete / reset a conversation
// @route   DELETE /api/assistant/session/:sessionId
// @access  Private
export const deleteSession = asyncHandler(async (req, res) => {
  const deleted = await clearSession(req.userId, req.params.sessionId);

  if (!deleted) {
    res.status(404);
    throw new Error("Session not found");
  }

  res.json({ message: "Conversation cleared" });
});
