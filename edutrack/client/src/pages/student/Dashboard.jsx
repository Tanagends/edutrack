import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/courses');
        setCourses(data.data);

        // Fetch attendance summary for each enrolled course
        const summaryResults = await Promise.allSettled(
          data.data.map((c) => api.get(`/attendance/summary/${c._id}`))
        );

        const sums = summaryResults.map((res, i) =>
          res.status === 'fulfilled'
            ? { courseId: data.data[i]._id, ...res.value.data.data }
            : { courseId: data.data[i]._id, percentage: 0, atRisk: false }
        );
        setSummaries(sums);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const atRiskCount = summaries.filter((s) => s.atRisk).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your attendance and grades in one place.</p>
      </div>

      {/* Risk banner */}
      {atRiskCount > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">Attendance Warning</p>
            <p className="text-sm text-red-600 mt-0.5">
              You are below 75% in {atRiskCount} course{atRiskCount > 1 ? 's' : ''}. Please attend more classes.
            </p>
          </div>
        </div>
      )}

      {/* Attendance by course */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">My Attendance</h2>
          <Link to="/student/attendance" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            Scan QR →
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((c) => {
              const sum = summaries.find((s) => s.courseId === c._id);
              const pct = sum?.percentage ?? 0;
              return (
                <div key={c._id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">{c.code} — {c.name}</p>
                    <span className={`text-sm font-bold ${pct < 75 ? 'text-red-600' : 'text-green-600'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${pct < 75 ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sum?.attended ?? 0} of {sum?.totalSessions ?? 0} sessions
                    {pct < 75 && <span className="text-red-500 ml-2">⚠ Below threshold</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My courses quick list */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Enrolled Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c._id} className="p-3 border border-gray-100 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">{c.code}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1">{c.credits} credits · Sem {c.semester}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
