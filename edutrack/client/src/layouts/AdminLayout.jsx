import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 p-8 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
