import mongoose from "mongoose";

// A single chatbot Q&A entry. Admins create these; logged-in users browse
// the questions in the help chatbot and reveal the matching answer.
const faqSchema = mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    // Lower numbers appear first in the chatbot question list.
    order: { type: Number, default: 0 },
    // Inactive entries stay saved but are hidden from the chatbot.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Faq = mongoose.model("Faq", faqSchema);

export default Faq;
