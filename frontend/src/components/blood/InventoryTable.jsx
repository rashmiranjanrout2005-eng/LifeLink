export default function InventoryTable({ rows = [] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Unit ID</th>
          <th>Group</th>
          <th>Component</th>
          <th>Status</th>
          <th>Expiry</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row) => (
          <tr key={row.unitId || row.id}>
            <td>{row.unitId || row.id}</td>
            <td>{row.bloodGroup}</td>
            <td>{row.component}</td>
            <td>{row.status}</td>
            <td>{row.expiryDate}</td>
          </tr>
        )) : (
          <tr><td colSpan="5">No inventory data available.</td></tr>
        )}
      </tbody>
    </table>
  );
}
