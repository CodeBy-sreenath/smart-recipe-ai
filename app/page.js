"use client";

import { useState, useCallback, useEffect } from "react";
import HistoryTab from "./components/historyTab";
import RecipeCard from "./components/receipeCard";
import InputModes from "./components/inputModes";
import IngredientPicker from "./components/ingredientPicker";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── FETCH HISTORY FROM MONGODB ON LOAD ──────────────────
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/history?userId=guest");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("fetchHistory error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── INGREDIENT HANDLERS ──────────────────────────────────
  const toggleIngredient = useCallback((label) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const addIngredients = useCallback((labels) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      labels.forEach((l) => next.add(l));
      return next;
    });
  }, []);

  const removeIngredient = useCallback((label) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      next.delete(label);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelectedIngredients(new Set()), []);

  // ── MAIN GENERATE FUNCTION — REAL API CALL ───────────────
  const generateRecipes = useCallback(async (imageBase64, mediaType) => {
    const ingredientList = [...selectedIngredients];

    if (!ingredientList.length && !imageBase64) {
      setError("Please select or add at least one ingredient!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // ── POST to backend API route ──────────────────────────
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredientList,
          imageBase64: imageBase64 || null,
          mediaType: mediaType || null,
          userId: "guest",
        }),
      });

      const data = await res.json();

      // ── Handle error response from backend ─────────────────
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // ── Validate response structure ────────────────────────
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // ── Set results ────────────────────────────────────────
      setResult(data);

      // ── Refresh history from MongoDB ───────────────────────
      await fetchHistory();

    } catch (err) {
      console.error("generateRecipes error:", err);
      setError(err.message || "Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedIngredients]);

  // ── LOAD HISTORY ENTRY ───────────────────────────────────
  const loadHistoryEntry = useCallback((entry) => {
    setSelectedIngredients(new Set(entry.ingredients || []));
    setResult({
      detectedIngredients: entry.detected || [],
      recipes: entry.recipes || [],
    });
    setActiveTab("create");
    setError(null);
    // scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">AI-Powered Kitchen</span>
          <h1 className="hero-title">
            Your <span className="hero-accent">Smart</span> Recipe<br />Generator
          </h1>
          <p className="hero-desc">
            Pick ingredients, upload a photo, or speak your pantry — our AI chef crafts
            personalized recipes instantly, just for you.
          </p>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────── */}
      <div className="tabs-wrap">
        {["create", "history"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "create"
              ? "🍳 Create Recipe"
              : `📋 History ${history.length > 0 ? `(${history.length})` : ""}`
            }
          </button>
        ))}
      </div>

      <div className="main-container">

        {/* ── CREATE TAB ───────────────────────────────────────── */}
        {activeTab === "create" && (
          <>
            {/* Ingredient Picker */}
            <IngredientPicker
              selected={selectedIngredients}
              onToggle={toggleIngredient}
              onRemove={removeIngredient}
              onClearAll={clearAll}
            />

            <div className="divider" />

            {/* Input Modes */}
            <InputModes
              onAddIngredients={addIngredients}
              onGenerateFromImage={(b64, mt) => generateRecipes(b64, mt)}
            />

            {/* Error Banner */}
            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Generate Button */}
            <button
              className="generate-btn"
              onClick={() => generateRecipes()}
              disabled={loading}
            >
              {loading
                ? <><span className="btn-spinner" /> Cooking up ideas…</>
                : <>✨ Generate Recipes</>
              }
            </button>

            {/* Loading */}
            {loading && (
              <div className="loading-wrap">
                <div className="spinner" />
                <p className="loading-text">Our AI chef is analyzing your ingredients…</p>
                <p className="loading-sub">This takes about 3–5 seconds</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="results-section">

                {/* Detected ingredients from image */}
                {result.detectedIngredients?.length > 0 && (
                  <div className="detected-bar">
                    <span className="detected-label">🔍 Detected from image:</span>
                    {result.detectedIngredients.map((d) => (
                      <span key={d} className="detected-pill">{d}</span>
                    ))}
                  </div>
                )}

                <div className="section-title">Your Recipes</div>

                <div className="recipes-grid">
                  {result.recipes.map((recipe, i) => (
                    <RecipeCard key={i} recipe={recipe} index={i} />
                  ))}
                </div>

                {/* Generate again button */}
                <button
                  className="generate-btn"
                  style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, var(--green), var(--green-light))" }}
                  onClick={() => generateRecipes()}
                  disabled={loading}
                >
                  🔄 Generate Different Recipes
                </button>

              </div>
            )}
          </>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────────── */}
        {activeTab === "history" && (
          <HistoryTab
            history={history}
            loading={historyLoading}
            onLoad={loadHistoryEntry}
            onRefresh={fetchHistory}
          />
        )}

      </div>
    </main>
  );
}