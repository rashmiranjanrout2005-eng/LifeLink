import { Link } from 'react-router-dom';

export default function Sidebar() {
  const menu = [
    ['Dashboard', '/admin'],
    ['Donors', '/admin/donors'],
    ['Hospitals', '/admin/hospitals'],
    ['Inventory', '/admin/inventory'],
    ['Requests', '/admin/requests'],
    ['Reports', '/admin/reports'],
    ['Settings', '/admin/settings']
  ];

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <h3>BBMS</h3>
      </div>
      <nav>
        {menu.map(([label, path]) => (
          <Link key={path} to={path}>{label}</Link>
        ))}
      </nav>
    </aside>
  );
}
