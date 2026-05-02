"use client";

import { useState, useCallback } from "react";
import HistoryTab from "./components/historyTab";
import RecipeCard from "./components/receipeCard";
import InputModes from "./components/inputModes";
import IngredientPicker from "./components/ingredientPicker";



// ── Mock recipes for frontend demo (replace with real API call later) ──
const MOCK_RESULTS = {
  Fish: {
    detectedIngredients: [],
    recipes: [
      {
        name: "Lemon Garlic Pan-Seared Fish",
        emoji: "🐟",
        cookTime: "20 min",
        difficulty: "Easy",
        description: "A light, crispy fish fillet with a bright lemon-garlic butter sauce.",
        ingredients: ["Fish fillet", "Garlic", "Lemon", "Butter", "Olive Oil", "Salt", "Pepper", "Parsley"],
        steps: [
          "Pat fish fillets dry with paper towels and season with salt and pepper.",
          "Heat olive oil in a pan over medium-high heat until shimmering.",
          "Place fish skin-side down and cook 3–4 minutes until golden and crispy.",
          "Flip and cook another 2–3 minutes until cooked through.",
          "Add butter and minced garlic to the pan and baste the fish.",
          "Squeeze fresh lemon juice over the top and garnish with parsley.",
        ],
      },
      {
        name: "Spicy Fish Curry",
        emoji: "🍛",
        cookTime: "35 min",
        difficulty: "Medium",
        description: "A bold, aromatic curry with tender fish pieces in a spiced tomato coconut sauce.",
        ingredients: ["Fish", "Coconut Milk", "Tomato", "Onion", "Garlic", "Chili", "Cumin", "Turmeric"],
        steps: [
          "Sauté onions, garlic and chili in oil until golden.",
          "Add cumin and turmeric, stir for 1 minute.",
          "Pour in diced tomatoes and cook 5 minutes.",
          "Add coconut milk and bring to a gentle simmer.",
          "Add fish pieces and cook 8–10 minutes until tender.",
          "Season to taste and serve with rice or naan.",
        ],
      },
      {
        name: "Fish Tacos with Avocado Slaw",
        emoji: "🌮",
        cookTime: "25 min",
        difficulty: "Easy",
        description: "Crispy battered fish in warm tortillas topped with creamy avocado slaw.",
        ingredients: ["Fish", "Tortillas", "Avocado", "Cabbage", "Lime", "Sour Cream", "Chili Powder", "Cumin"],
        steps: [
          "Season fish with chili powder, cumin, salt and pepper.",
          "Pan-fry fish in oil until golden and cooked through, about 3 min per side.",
          "Mash avocado with lime juice, salt and a pinch of chili.",
          "Shred cabbage and mix with avocado mash to make slaw.",
          "Warm tortillas in a dry pan.",
          "Assemble tacos with fish, slaw and a dollop of sour cream.",
        ],
      },
    ],
  },
  Eggs: {
    detectedIngredients: [],
    recipes: [
      {
        name: "Classic French Omelette",
        emoji: "🍳",
        cookTime: "10 min",
        difficulty: "Easy",
        description: "Silky, buttery and perfectly folded — the ultimate egg technique.",
        ingredients: ["Eggs", "Butter", "Salt", "Pepper", "Chives", "Cheese"],
        steps: [
          "Beat 3 eggs with salt and pepper until fully combined.",
          "Heat butter in a non-stick pan over medium heat.",
          "Pour in eggs and stir gently with a spatula.",
          "When eggs are just set but still creamy, add cheese.",
          "Fold omelette in thirds and slide onto a plate.",
          "Garnish with chives and serve immediately.",
        ],
      },
      {
        name: "Shakshuka",
        emoji: "🍅",
        cookTime: "30 min",
        difficulty: "Medium",
        description: "Eggs poached in a spiced tomato and pepper sauce — a Middle Eastern classic.",
        ingredients: ["Eggs", "Tomatoes", "Pepper", "Onion", "Garlic", "Cumin", "Paprika", "Chili"],
        steps: [
          "Sauté onion, pepper and garlic in olive oil until soft.",
          "Add cumin, paprika and chili — stir 1 minute.",
          "Pour in crushed tomatoes and simmer 10 minutes.",
          "Make wells in the sauce and crack eggs into them.",
          "Cover and cook until whites are set but yolks are runny, 6–8 min.",
          "Serve with crusty bread for dipping.",
        ],
      },
      {
        name: "Egg Fried Rice",
        emoji: "🍚",
        cookTime: "15 min",
        difficulty: "Easy",
        description: "Quick, satisfying and perfect for using up leftover rice.",
        ingredients: ["Eggs", "Rice", "Soy Sauce", "Garlic", "Onion", "Carrot", "Sesame Oil", "Spring Onion"],
        steps: [
          "Heat oil in a wok over high heat.",
          "Scramble eggs lightly, then push to the side.",
          "Add garlic and vegetables — stir-fry 2 minutes.",
          "Add cold cooked rice and toss everything together.",
          "Pour soy sauce around the edges of the wok.",
          "Drizzle sesame oil, top with spring onions and serve hot.",
        ],
      },
    ],
  },
};

function getMockResult(ingredients) {
  for (const ing of ingredients) {
    if (MOCK_RESULTS[ing]) return MOCK_RESULTS[ing];
  }
  // Generic fallback
  return {
    detectedIngredients: [],
    recipes: [
      {
        name: `${ingredients[0] || "Chef's"} Special Stir Fry`,
        emoji: "🥘",
        cookTime: "20 min",
        difficulty: "Easy",
        description: "A quick and delicious stir fry using your selected ingredients.",
        ingredients: [...ingredients, "Soy Sauce", "Garlic", "Ginger", "Sesame Oil"],
        steps: [
          "Prep all ingredients — chop, slice and measure.",
          "Heat oil in a wok or large pan over high heat.",
          "Add aromatics (garlic, ginger) and stir for 30 seconds.",
          "Add your main ingredients in order of cooking time.",
          "Pour in soy sauce and toss everything well.",
          "Drizzle sesame oil, taste and adjust seasoning.",
          "Serve hot with steamed rice.",
        ],
      },
      {
        name: `Hearty ${ingredients[0] || "Veggie"} Soup`,
        emoji: "🍲",
        cookTime: "40 min",
        difficulty: "Easy",
        description: "A warming, nourishing soup that comes together with minimal effort.",
        ingredients: [...ingredients, "Vegetable Broth", "Onion", "Garlic", "Bay Leaf", "Salt"],
        steps: [
          "Sauté onion and garlic in olive oil until translucent.",
          "Add your main ingredients and stir to coat.",
          "Pour in vegetable broth and add bay leaf.",
          "Bring to a boil, then reduce to a simmer.",
          "Cook 25–30 minutes until everything is tender.",
          "Season with salt and pepper, remove bay leaf and serve.",
        ],
      },
      {
        name: `${ingredients[0] || "Garden"} Grain Bowl`,
        emoji: "🥗",
        cookTime: "30 min",
        difficulty: "Easy",
        description: "A nourishing grain bowl packed with your chosen ingredients and a tangy dressing.",
        ingredients: [...ingredients, "Rice", "Olive Oil", "Lemon", "Salt", "Pepper", "Herbs"],
        steps: [
          "Cook rice or grain of choice according to package instructions.",
          "Roast or sauté your main ingredients with olive oil, salt and pepper.",
          "Make a simple dressing with olive oil, lemon juice and herbs.",
          "Assemble bowls with grain as the base.",
          "Top with your cooked ingredients.",
          "Drizzle dressing over and serve warm or at room temperature.",
        ],
      },
    ],
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("recipeHistory") || "[]"); }
    catch { return []; }
  });

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

  const saveToHistory = useCallback((ingredients, data) => {
    const entry = {
      id: Date.now(),
      ingredients,
      detected: data.detectedIngredients || [],
      recipes: data.recipes,
      time: new Date().toLocaleString(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 20);
      localStorage.setItem("recipeHistory", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const generateRecipes = useCallback((imageBase64, mediaType) => {
    const ingredientList = [...selectedIngredients];
    if (!ingredientList.length && !imageBase64) {
      alert("Please select or add at least one ingredient!");
      return;
    }
    setLoading(true);
    setResult(null);

    // Simulate API delay — replace with real fetch() call to /api/generate-recipe later
    setTimeout(() => {
      const data = imageBase64
        ? { detectedIngredients: ["Fish", "Lemon", "Garlic"], recipes: MOCK_RESULTS.Fish.recipes }
        : getMockResult(ingredientList);
      setResult(data);
      saveToHistory(ingredientList, data);
      setLoading(false);
    }, 1800);
  }, [selectedIngredients, saveToHistory]);

  const loadHistoryEntry = useCallback((entry) => {
    setSelectedIngredients(new Set(entry.ingredients));
    setResult({ detectedIngredients: entry.detected, recipes: entry.recipes });
    setActiveTab("create");
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HERO */}
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

      {/* TABS */}
      <div className="tabs-wrap">
        {["create", "history"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "create" ? "🍳 Create Recipe" : "📋 History"}
          </button>
        ))}
      </div>

      <div className="main-container">

        {/* CREATE TAB */}
        {activeTab === "create" && (
          <>
            <IngredientPicker
              selected={selectedIngredients}
              onToggle={toggleIngredient}
              onRemove={removeIngredient}
              onClearAll={clearAll}
            />

            <div className="divider" />

            <InputModes
              onAddIngredients={addIngredients}
              onGenerateFromImage={(b64, mt) => generateRecipes(b64, mt)}
            />

            <button
              className="generate-btn"
              onClick={() => generateRecipes()}
              disabled={loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Cooking up ideas…</>
              ) : (
                <>✨ Generate Recipes</>
              )}
            </button>

            {/* LOADING */}
            {loading && (
              <div className="loading-wrap">
                <div className="spinner" />
                <p className="loading-text">Our AI chef is analyzing your ingredients…</p>
              </div>
            )}

            {/* RESULTS */}
            {result && !loading && (
              <div className="results-section">
                {result.detectedIngredients?.length > 0 && (
                  <div className="detected-bar">
                    <span className="detected-label">🔍 Detected:</span>
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
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <HistoryTab history={history} onLoad={loadHistoryEntry} />
        )}

      </div>
    </main>
  );
}