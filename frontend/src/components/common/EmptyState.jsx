export default function EmptyState({ title = 'No records found', message = 'Try changing your filters.' }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
