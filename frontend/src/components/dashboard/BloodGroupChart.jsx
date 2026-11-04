import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const colors = ['#C4455C', '#E17A83', '#D98B69', '#BC5B65', '#9C3D54', '#E5B47C', '#7F9B8B', '#6E7D96'];

export default function BloodGroupChart({ data = [] }) {
  const hasUnits = data.some((entry) => entry.value > 0);

  return (
    <div className="chart-card">
      <h3>Blood Group Distribution</h3>
      {hasUnits ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : <p className="dashboard-empty">No available units to chart.</p>}
    </div>
  );
}
