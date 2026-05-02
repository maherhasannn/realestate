export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="app-empty-state">
      {icon && <div className="app-empty-icon">{icon}</div>}
      <h3 className="app-empty-title">{title || 'No data yet'}</h3>
      {description && <p className="app-empty-desc">{description}</p>}
      {action && <div className="app-empty-action">{action}</div>}
    </div>
  );
}
