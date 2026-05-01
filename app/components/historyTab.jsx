export default function HistoryTab({ history, onLoad }) {
  if (history.length === 0) {
    return (
      <div className="empty-history">
        <div className="empty-icon">📭</div>
        <p className="empty-text">
          No recipe history yet.<br />
          Create your first recipe to see it here!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">Recipe History</div>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-item" onClick={() => onLoad(entry)}>
            <span className="history-thumb">
              {entry.recipes?.[0]?.emoji || "🍽️"}
            </span>
            <div className="history-info">
              <div className="history-title">
                {entry.recipes?.[0]?.name || "Recipe Session"}
              </div>
              <div className="history-ingredients">
                {entry.ingredients.slice(0, 6).join(", ")}
                {entry.ingredients.length > 6 ? "…" : ""}
              </div>
              <div className="history-time">{entry.time}</div>
            </div>
            <span className="history-count">
              {entry.recipes?.length || 0} recipes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}