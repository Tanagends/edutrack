import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Risk = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    api.get('/risk')
      .then(({ data }) => setList(data.data))
      .catch(() => toast.error('Failed to load risk data'))
      .finally(() => setLoading(false));
  }, []);

  const handleNotifyAll = async () => {
    if (!confirm(`Send alert emails to ${list.length} at-risk students?`)) return;
    setNotifying(true);
    try {
      const { data } = await api.post('/risk/notify', { atRiskStudents: list });
      const sent = data.results.filter((r) => r.status === 'sent').length;
      toast.success(`${sent} alerts sent successfully`);
    } catch (err) {
      toast.error('Failed to send alerts');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚠️ Risk Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Students below 75% attendance or with a C/F grade in any course.
          </p>
        </div>
        {list.length > 0 && (
          <button onClick={handleNotifyAll} disabled={notifying} className="btn-primary text-sm">
            {notifying ? 'Sending...' : `📧 Notify All (${list.length})`}
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium">No at-risk students right now.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Course</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Issue</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Severity</th>
              </tr>
            </thead>
            <tbody>
              {list.map((entry, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-red-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{entry.student?.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{entry.student?.user?.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-gray-700">{entry.course?.name}</p>
                    <p className="text-xs text-gray-400">{entry.course?.code}</p>
                  </td>
                  <td className="px-5 py-3">
                    {entry.reason === 'low_attendance' ? (
                      <span>
                        Attendance: <strong className="text-red-600">{entry.attendancePercent}%</strong>
                        <span className="text-gray-400 text-xs"> ({entry.attended}/{entry.totalSessions})</span>
                      </span>
                    ) : (
                      <span>
                        Grade: <strong className="text-red-600">{entry.letterGrade}</strong>
                        <span className="text-gray-400 text-xs"> ({entry.currentScore}/100)</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge-risk">
                      {entry.reason === 'low_attendance'
                        ? entry.attendancePercent < 50 ? 'Critical' : 'Warning'
                        : entry.letterGrade === 'F' ? 'Critical' : 'Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Risk;
