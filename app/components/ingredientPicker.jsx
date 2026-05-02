"use client";

import { useState } from "react";
import { CATEGORIES } from "../lib/ingredients";
//import { CATEGORIES } from "./lib/ingredients";

export default function IngredientPicker({ selected, onToggle, onRemove, onClearAll }) {
  const [activeCategory, setActiveCategory] = useState("Proteins");

  return (
    <div>
      <div className="section-title">Choose Ingredients</div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {Object.keys(CATEGORIES).map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ingredient Grid */}
      <div className="ingredient-grid">
        {CATEGORIES[activeCategory].map((item) => (
          <div
            key={item.label}
            className={`ingredient-chip ${selected.has(item.label) ? "selected" : ""}`}
            onClick={() => onToggle(item.label)}
          >
            <span className="chip-emoji">{item.emoji}</span>
            <span className="chip-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Selected Pills Bar */}
      {selected.size > 0 && (
        <div className="selected-bar">
          <span className="sel-label">Selected:</span>
          <div className="sel-pills">
            {[...selected].map((ing) => (
              <span key={ing} className="sel-pill">
                {ing}
                <button className="sel-remove" onClick={() => onRemove(ing)}>×</button>
              </span>
            ))}
          </div>
          <button className="clear-btn" onClick={onClearAll}>Clear all</button>
        </div>
      )}
    </div>
  );
}