import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useSocket from '../hooks/useSocket';

const StudentLayout = () => {
  useSocket();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
