import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/students', label: 'Students', icon: '🎓' },
  { to: '/admin/faculty', label: 'Faculty', icon: '👨‍🏫' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/risk', label: 'Risk Alerts', icon: '⚠️' },
];

const facultyLinks = [
  { to: '/faculty', label: 'Dashboard', icon: '🏠' },
  { to: '/faculty/attendance', label: 'Attendance', icon: '📋' },
  { to: '/faculty/grades', label: 'Grades', icon: '✏️' },
  { to: '/faculty/risk', label: 'Risk Alerts', icon: '⚠️' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '🏠' },
  { to: '/student/attendance', label: 'Attendance', icon: '📋' },
  { to: '/student/grades', label: 'My Grades', icon: '✏️' },
];

const roleLinks = { admin: adminLinks, faculty: facultyLinks, student: studentLinks };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-orange-500">Edu</span>
        <span className="text-xl font-bold text-gray-800">Track</span>
        <p className="text-xs text-gray-400 mt-0.5">Aditya University</p>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length === 2} // exact match only for root dashboard
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-400 hover:text-red-600 hover:bg-red-50">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
