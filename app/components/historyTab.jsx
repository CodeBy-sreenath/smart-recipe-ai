export default function HistoryTab({ history, loading, onLoad, onRefresh }) {

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <p className="loading-text">Loading your history…</p>
      </div>
    );
  }

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div className="section-title" style={{ margin: 0 }}>Recipe History</div>
        <button className="clear-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div className="history-list">
        {history.map((entry) => (
          <div
            key={entry._id}
            className="history-item"
            onClick={() => onLoad(entry)}
          >
            <span className="history-thumb">
              {entry.recipes?.[0]?.emoji || "🍽️"}
            </span>
            <div className="history-info">
              <div className="history-title">
                {entry.recipes?.[0]?.name || "Recipe Session"}
              </div>
              <div className="history-ingredients">
                {entry.ingredients?.slice(0, 5).join(", ")}
                {entry.ingredients?.length > 5 ? "…" : ""}
              </div>
              <div className="history-time">
                {new Date(entry.createdAt).toLocaleString()}
                {entry.fromImage && (
                  <span className="image-badge">📷 from image</span>
                )}
              </div>
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