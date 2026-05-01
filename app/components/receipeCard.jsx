export default function RecipeCard({ recipe, index }) {
  return (
    <div className="recipe-card" style={{ animationDelay: `${index * 0.1}s` }}>

      {/* Header */}
      <div className="recipe-header">
        <div style={{ flex: 1 }}>
          <div className="recipe-title">{recipe.name}</div>
          <div className="recipe-meta">
            <span className="recipe-badge">⏱ {recipe.cookTime || "30 min"}</span>
            <span className="recipe-badge">📊 {recipe.difficulty || "Medium"}</span>
          </div>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
        </div>
        <span className="recipe-emoji">{recipe.emoji || "🍽️"}</span>
      </div>

      {/* Body */}
      <div className="recipe-body">

        {/* Ingredients */}
        <div className="recipe-section">
          <div className="recipe-section-title">Ingredients</div>
          <div className="ingredients-list">
            {recipe.ingredients.map((ing, i) => (
              <span key={i} className="ing-tag">{ing}</span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="recipe-section">
          <div className="recipe-section-title">Steps</div>
          <ul className="steps-list">
            {recipe.steps.map((step, i) => (
              <li key={i} className="step-item">
                <span className="step-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}