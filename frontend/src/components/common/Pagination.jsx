export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button onClick={onPrev} disabled={page <= 1}>Previous</button>
      <span>Page {page} of {totalPages || 1}</span>
      <button onClick={onNext} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
