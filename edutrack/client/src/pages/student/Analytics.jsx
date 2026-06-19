import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StudentAnalytics = () => {
  const [rows, setRows] = useState([]); // [{ course, attendancePercent, weightedScore, letterGrade }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: courseRes } = await api.get('/courses');
        const courses = courseRes.data;

        const results = await Promise.all(
          courses.map(async (c) => {
            const [attRes, gradeRes] = await Promise.allSettled([
              api.get(`/attendance/summary/${c._id}`),
              api.get(`/grades/${c._id}`),
            ]);

            return {
              course: c,
              attendancePercent: attRes.status === 'fulfilled' ? attRes.value.data.data.percentage : 0,
              weightedScore: gradeRes.status === 'fulfilled' ? gradeRes.value.data.data.weightedScore : null,
              letterGrade: gradeRes.status === 'fulfilled' ? gradeRes.value.data.data.letterGrade : 'N/A',
            };
          })
        );

        setRows(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Your attendance and grade trends across courses.</p>
        </div>
        <div className="card text-center py-16 text-gray-400">
          You&apos;re not enrolled in any courses yet.
        </div>
      </div>
    );
  }

  const attendanceChart = {
    labels: rows.map((r) => r.course.code),
    datasets: [{
      label: 'Attendance %',
      data: rows.map((r) => r.attendancePercent),
      backgroundColor: rows.map((r) => r.attendancePercent >= 75 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
      borderRadius: 6,
    }],
  };

  const gradeChart = {
    labels: rows.map((r) => r.course.code),
    datasets: [{
      label: 'Weighted Score',
      data: rows.map((r) => r.weightedScore ?? 0),
      backgroundColor: rows.map((r) => {
        if (r.weightedScore === null) return 'rgba(209,213,219,0.7)'; // gray — no grade yet
        return r.weightedScore >= 50 ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.7)';
      }),
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Your attendance and grade trends across all enrolled courses.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Attendance by Course</h2>
          <Bar
            data={attendanceChart}
            options={{
              responsive: true,
              scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
              plugins: { legend: { display: false } },
            }}
          />
          <p className="text-xs text-gray-400 mt-3">🟢 ≥ 75% (safe)  🔴 &lt; 75% (at risk)</p>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Grade Performance</h2>
          <Bar
            data={gradeChart}
            options={{
              responsive: true,
              scales: { y: { min: 0, max: 100 } },
              plugins: { legend: { display: false } },
            }}
          />
          <p className="text-xs text-gray-400 mt-3">🔵 Passing  🔴 At risk  ⚪ Not graded yet</p>
        </div>
      </div>

      {/* Detail table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">Course</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Attendance</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Score</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.course._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{r.course.code}</p>
                  <p className="text-xs text-gray-400">{r.course.name}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={r.attendancePercent >= 75 ? 'badge-ok' : 'badge-risk'}>
                    {r.attendancePercent}%
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{r.weightedScore ?? '—'}</td>
                <td className="px-5 py-3 font-bold text-gray-800">{r.letterGrade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAnalytics;
