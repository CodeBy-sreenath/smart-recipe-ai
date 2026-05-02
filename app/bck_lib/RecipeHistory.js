// models/RecipeHistory.js

import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  emoji:       { type: String },
  cookTime:    { type: String },
  difficulty:  { type: String },
  description: { type: String },
  ingredients: [{ type: String }],
  steps:       [{ type: String }],
});

const HistorySchema = new mongoose.Schema(
  {
    userId:      { type: String, required: true, index: true },
    ingredients: [{ type: String }],
    detected:    [{ type: String }],
    recipes:     [RecipeSchema],
    fromImage:   { type: Boolean, default: false },  // ← NEW
  },
  { timestamps: true }
);

export default mongoose.models.RecipeHistory ||
  mongoose.model("RecipeHistory", HistorySchema);