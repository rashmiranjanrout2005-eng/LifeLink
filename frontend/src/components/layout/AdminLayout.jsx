import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-panel">{children}</main>
    </div>
  );
}
