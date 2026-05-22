// Central configuration for the Gemini integration.
// Every sensitive value is read from environment variables — nothing is
// hard-coded — and the API key NEVER leaves the backend.
//
// `dotenv.config()` is called here as well as in server.js because ES module
// imports are evaluated before server.js's own dotenv call runs. Calling it
// twice is safe (idempotent) and guarantees process.env is populated before
// the config object below is built.
import dotenv from "dotenv";

dotenv.config();

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",

  // Free-tier, fast and cheap. `gemini-2.0-flash` is a drop-in fallback.
  // Kept env-overridable so a future model rename needs no code change.
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  // v1beta is the current public REST surface for generateContent.
  baseUrl:
    process.env.GEMINI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta",

  // Replies must stay short and travel-focused — a small output cap is the
  // simplest, most reliable token saver.
  generation: {
    temperature: 0.3, // factual, not creative
    maxOutputTokens: 256, // ~2-4 short sentences
    topP: 0.9,
  },

  // Abort the request if Gemini is slow, so a user is never left hanging.
  timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 12000,
};

// Used by the service layer to decide whether to attempt a live call at all.
// When false, the assistant degrades gracefully to a fallback reply instead
// of throwing — so the chat endpoint stays testable before a key is added.
export const isGeminiConfigured = () => geminiConfig.apiKey.length > 0;
