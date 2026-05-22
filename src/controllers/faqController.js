import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Faq from "../models/faqModel.js";

// @desc    Get active FAQs for the help chatbot question list
// @route   GET /api/faqs
// @access  Private
export const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json(faqs);
});

// @desc    Get every FAQ (admin management view, includes inactive ones)
// @route   GET /api/faqs/all
// @access  Private/Admin
export const getAllFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
  res.json(faqs);
});

// @desc    Create an FAQ
// @route   POST /api/faqs
// @access  Private/Admin
export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, order, isActive } = req.body;

  if (!question?.trim() || !answer?.trim()) {
    res.status(400);
    throw new Error("Question and answer are both required");
  }

  const faq = await Faq.create({
    question: question.trim(),
    answer: answer.trim(),
    order: Number(order) || 0,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });

  res.status(201).json(faq);
});

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid FAQ ID");
  }

  const faq = await Faq.findById(id);
  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  const { question, answer, order, isActive } = req.body;
  if (question !== undefined) faq.question = String(question).trim();
  if (answer !== undefined) faq.answer = String(answer).trim();
  if (order !== undefined) faq.order = Number(order) || 0;
  if (isActive !== undefined) faq.isActive = Boolean(isActive);

  const updated = await faq.save();
  res.json(updated);
});

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid FAQ ID");
  }

  const faq = await Faq.findById(id);
  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  await faq.deleteOne();
  res.json({ message: "FAQ removed" });
});
