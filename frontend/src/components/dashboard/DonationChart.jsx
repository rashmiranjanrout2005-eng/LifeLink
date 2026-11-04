import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DonationChart({ data = [] }) {
  const chartData = data.map(({ month, value }) => ({ month, donations: value }));

  return (
    <div className="chart-card">
      <h3>Monthly Donations</h3>
      {chartData.length ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#eee8e5" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="donations" stroke="#C4455C" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="dashboard-empty">No donation data available yet.</p>}
    </div>
  );
}
