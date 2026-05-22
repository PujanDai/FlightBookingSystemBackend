// FAQ intent handler.
//
// Answers from the existing `Faq` collection (admin-managed Q&A) with ZERO
// Gemini tokens. If no FAQ is a strong enough match, it returns
// { handled: false } so the request falls through to general chat — that way
// a weak guess never produces a confidently wrong canned answer.
import Faq from "../../../models/faqModel.js";

// Minimum fraction of the user's content words that must appear in an FAQ
// before we answer from it. Tunable: lower = more FAQ hits but more risk of
// a loose match; higher = safer but more questions go to the LLM.
const MATCH_THRESHOLD = 0.4;

// Words that carry no matching signal — ignored on both sides.
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "to", "how", "can", "my",
  "of", "for", "on", "what", "with", "and", "or", "you", "your", "me",
  "please", "flixor", "it", "in", "i", "we", "if", "be", "this", "that",
]);

// Lower-case, strip punctuation, drop stopwords and very short words.
const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

/**
 * @param {{message:string}} input
 * @returns {Promise<object>} a handler result; `handled:false` means "pass on".
 */
export const faqHandler = async ({ message }) => {
  const faqs = await Faq.find({ isActive: true }).sort("order").lean();
  if (faqs.length === 0) return { handled: false };

  const queryWords = tokenize(message);
  if (queryWords.length === 0) return { handled: false };

  // Score each FAQ by how much of the user's question it covers. The FAQ
  // answer text is included so phrasing differences still match.
  let best = null;
  let bestScore = 0;
  for (const faq of faqs) {
    const faqWords = new Set(tokenize(`${faq.question} ${faq.answer}`));
    const overlap = queryWords.filter((w) => faqWords.has(w)).length;
    const score = overlap / queryWords.length;
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (!best || bestScore < MATCH_THRESHOLD) return { handled: false };

  // Offer a few other questions as quick-reply chips. Clicking one sends its
  // exact text back, which matches cleanly here again — still 0 tokens.
  const suggestions = faqs
    .filter((f) => String(f._id) !== String(best._id))
    .slice(0, 3)
    .map((f) => f.question);

  return {
    handled: true,
    intent: "FAQ_QUERY",
    reply: best.answer,
    data: null,
    suggestions,
    usage: null, // answered straight from the database — zero LLM tokens
  };
};
