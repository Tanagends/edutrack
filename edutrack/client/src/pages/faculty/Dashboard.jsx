import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/risk')])
      .then(([cRes, rRes]) => {
        setCourses(cRes.data.data);
        setAtRisk(rRes.data.data.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Faculty portal — manage attendance and grades.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="My Courses"        value={courses.length} icon="📚" color="orange" />
        <StatCard label="At-Risk Students"  value={atRisk.length}  icon="⚠️" color="red"    />
      </div>

      {/* My courses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">My Courses</h2>
          <Link to="/faculty/attendance" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            Take Attendance →
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {courses.map((c) => (
              <div key={c._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.code} · Sem {c.semester} · {c.credits} credits</p>
                </div>
                <Link to={`/faculty/attendance?course=${c._id}`} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  Generate QR
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* At-risk preview */}
      {atRisk.length > 0 && (
        <div className="card border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">⚠️ Students Needing Attention</h2>
            <Link to="/faculty/risk" className="text-sm text-orange-500 hover:text-orange-600 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {atRisk.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{entry.student?.user?.name}</span>
                <span className="badge-risk">
                  {entry.reason === 'low_attendance' ? `${entry.attendancePercent}% attendance` : `Grade: ${entry.letterGrade}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
