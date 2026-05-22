// The ONLY file in the codebase that talks to the Gemini API.
// Centralising the call here means the API key, endpoint, timeout, and error
// handling all live in one place — easy to secure, test, and reason about.
//
// Uses the global `fetch` available in Node 18+ (Express 5 requires Node 18+),
// so no HTTP library or SDK dependency is added.
import { geminiConfig, isGeminiConfigured } from "../../config/gemini.config.js";
import { SYSTEM_PROMPT } from "./prompt.builder.js";

/**
 * Raised when Gemini cannot be reached or returns an error. The service layer
 * catches this and degrades gracefully instead of failing the user's request.
 */
export class GeminiError extends Error {
  constructor(message, { status, retryable } = {}) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
    // `retryable` is true for transient failures (timeout, network, 5xx, 429).
    this.retryable = retryable === true;
  }
}

/**
 * Call Gemini's generateContent endpoint.
 * @param {Array} contents - the conversation `contents` array.
 * @param {object} [opts]
 * @param {string} [opts.systemPrompt] - overrides the default system prompt.
 * @returns {Promise<{text: string, usage: {promptTokens:number, responseTokens:number}}>}
 * @throws {GeminiError}
 */
export const generateContent = async (contents, opts = {}) => {
  if (!isGeminiConfigured()) {
    throw new GeminiError("Gemini API key is not configured", {
      retryable: false,
    });
  }

  const url = `${geminiConfig.baseUrl}/models/${geminiConfig.model}:generateContent`;

  const body = {
    systemInstruction: {
      parts: [{ text: opts.systemPrompt || SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: geminiConfig.generation,
  };

  // Abort the request if Gemini takes too long, so the user is not left
  // hanging and a slow upstream cannot tie up the Node event loop.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), geminiConfig.timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key travels in a header, not the URL — so it never lands in
        // server access logs or browser history.
        "x-goog-api-key": geminiConfig.apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err.name === "AbortError";
    throw new GeminiError(
      aborted ? "Gemini request timed out" : "Could not reach Gemini",
      { retryable: true }
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // 429 = quota exhausted, 5xx = transient server error — both let the
    // caller fall back or retry. Other 4xx are permanent (bad request/key).
    const retryable = response.status === 429 || response.status >= 500;
    throw new GeminiError(`Gemini returned HTTP ${response.status}`, {
      status: response.status,
      retryable,
    });
  }

  const data = await response.json();

  // Extract the reply text. Gemini may omit it if the prompt was blocked by
  // a safety filter — treated as a non-retryable empty response.
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new GeminiError("Gemini returned an empty response", {
      retryable: false,
    });
  }

  const usage = data?.usageMetadata || {};
  return {
    text,
    usage: {
      promptTokens: usage.promptTokenCount || 0,
      responseTokens: usage.candidatesTokenCount || 0,
    },
  };
};
