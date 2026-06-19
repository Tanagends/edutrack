import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, riskRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/risk'),
        ]);
        setStats(overviewRes.data.data);
        setAtRisk(riskRes.data.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening across EduTrack today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Students"  value={stats?.totalStudents}  icon="🎓" color="orange" />
        <StatCard label="Active Courses"  value={stats?.totalCourses}   icon="📚" color="blue"   />
        <StatCard label="Faculty Members" value={stats?.totalFaculty}   icon="👨‍🏫" color="purple" />
        <StatCard label="Sessions Held"   value={stats?.totalSessions}  icon="📋" color="green"  />
      </div>

      {/* At-risk students preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">⚠️ At-Risk Students</h2>
          <Link to="/admin/risk" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            View all →
          </Link>
        </div>

        {atRisk.length === 0 ? (
          <p className="text-gray-400 text-sm">No at-risk students right now. 🎉</p>
        ) : (
          <div className="space-y-3">
            {atRisk.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {entry.student?.user?.name || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.course?.code} — {entry.course?.name}
                  </p>
                </div>
                <span className="badge-risk">
                  {entry.reason === 'low_attendance'
                    ? `${entry.attendancePercent}% attendance`
                    : `Grade: ${entry.letterGrade}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/students" className="btn-secondary text-sm">+ Add Student</Link>
          <Link to="/admin/courses"  className="btn-secondary text-sm">+ Add Course</Link>
          <Link to="/admin/analytics" className="btn-secondary text-sm">📊 View Analytics</Link>
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default AdminDashboard;
