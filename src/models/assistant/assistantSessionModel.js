import mongoose from "mongoose";

// One turn in an AI-assistant conversation. `intent` is "GENERAL_CHAT" in
// Phase 1; from Phase 2 it records which intent handler answered the turn.
const assistantMessageSchema = mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    intent: { type: String, default: "GENERAL_CHAT" },
  },
  { timestamps: true }
);

// A single user's conversation with the Flixor AI assistant. This is the
// human-to-AI chat — completely separate from the human-to-human `Chat`
// model used by the Socket.io messaging feature.
const assistantSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Public conversation id handed to the client. Generated with the
    // built-in crypto.randomUUID() — no extra dependency needed.
    sessionId: { type: String, required: true, unique: true },

    messages: [assistantMessageSchema],

    // Optional rolling summary of older turns (used from Phase 2+ to keep
    // long conversations cheap). Unused in Phase 1.
    summary: { type: String, default: "" },

    // Lightweight usage accounting — powers the token-saving metrics that
    // make a strong FYP talking point.
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      responseTokens: { type: Number, default: 0 },
      calls: { type: Number, default: 0 },
    },

    // Refreshed on every message. The TTL index below auto-deletes a session
    // 7 days after its last activity — history stays manageable with no cron.
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index: MongoDB purges the document 7 days (604800s) after lastActiveAt.
assistantSessionSchema.index(
  { lastActiveAt: 1 },
  { expireAfterSeconds: 604800 }
);

const AssistantSession = mongoose.model(
  "AssistantSession",
  assistantSessionSchema
);

export default AssistantSession;
