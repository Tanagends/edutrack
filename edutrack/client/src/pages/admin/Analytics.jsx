import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/attendance'), api.get('/analytics/grades')])
      .then(([aRes, gRes]) => {
        setAttendance(aRes.data.data);
        setGrades(gRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const attendanceChart = {
    labels: attendance.map((c) => c.courseCode),
    datasets: [{
      label: 'Attendance %',
      data: attendance.map((c) => c.percentage),
      backgroundColor: attendance.map((c) =>
        c.percentage >= 75 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'
      ),
      borderRadius: 6,
    }],
  };

  // Aggregate grade distribution across all courses
  const gradeLabels = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];
  const gradeCounts = gradeLabels.map((g) =>
    grades.reduce((sum, course) => {
      const match = course.distribution?.find((d) => d.grade === g);
      return sum + (match?.count || 0);
    }, 0)
  );

  const gradeChart = {
    labels: gradeLabels,
    datasets: [{
      data: gradeCounts,
      backgroundColor: [
        '#f97316','#fb923c','#fdba74','#fbbf24','#a3e635','#34d399','#f87171',
      ],
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Attendance rates and grade distributions across all courses.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Attendance bar chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Attendance by Course</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-400 text-sm">No attendance data yet.</p>
          ) : (
            <Bar
              data={attendanceChart}
              options={{
                responsive: true,
                scales: {
                  y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          )}
          <p className="text-xs text-gray-400 mt-3">🟢 ≥ 75%  🔴 &lt; 75%</p>
        </div>

        {/* Grade doughnut */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Overall Grade Distribution</h2>
          {gradeCounts.every((c) => c === 0) ? (
            <p className="text-gray-400 text-sm">No grade data yet.</p>
          ) : (
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut data={gradeChart} options={{ cutout: '60%' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance table */}
      {attendance.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Course</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Present</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Total Records</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{c.courseCode} — {c.courseName}</td>
                  <td className="px-5 py-3 text-gray-600">{c.presentCount}</td>
                  <td className="px-5 py-3 text-gray-600">{c.totalRecords}</td>
                  <td className="px-5 py-3">
                    <span className={c.percentage >= 75 ? 'badge-ok' : 'badge-risk'}>
                      {c.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;
