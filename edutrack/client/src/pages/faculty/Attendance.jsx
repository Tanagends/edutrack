import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FacultyAttendance = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [session, setSession] = useState(null);      // active QR session
  const [generating, setGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch faculty's courses
  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.data))
      .catch(() => toast.error('Failed to load courses'));
  }, []);

  // Fetch session history when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/attendance/sessions/${selectedCourse}`)
      .then(({ data }) => setSessions(data.data))
      .catch(console.error);
  }, [selectedCourse]);

  // Countdown timer for active QR
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(session.expiresAt) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSession(null);
        toast('QR code expired', { icon: '⏰' });
        clearInterval(interval);
        // Refresh session history
        if (selectedCourse) {
          api.get(`/attendance/sessions/${selectedCourse}`)
            .then(({ data }) => setSessions(data.data))
            .catch(console.error);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, selectedCourse]);

  const handleGenerateQR = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    setGenerating(true);
    try {
      const { data } = await api.post('/attendance/session', { courseId: selectedCourse });
      setSession(data.data);
      setTimeLeft(data.data.expireMinutes * 60);
      toast.success('QR code generated! Students can now scan.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Generate a QR code for students to scan and mark attendance.</p>
      </div>

      {/* Course selector + QR generator */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setSession(null); }}
            className="input max-w-sm"
          >
            <option value="">— Choose a course —</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateQR}
          disabled={generating || !selectedCourse}
          className="btn-primary text-sm"
        >
          {generating ? 'Generating...' : '📱 Generate QR Code'}
        </button>
      </div>

      {/* Active QR display */}
      {session && (
        <div className="card border-2 border-orange-200 text-center space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Active QR Session</h2>
            <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-green-600'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
          <img
            src={session.qrImage}
            alt="QR Code for attendance"
            className="w-56 h-56 mx-auto rounded-xl border border-gray-200"
          />
          <p className="text-sm text-gray-500">
            Show this QR on the projector. Students scan it from their dashboard.
          </p>
          <p className="text-xs text-gray-400">
            Expires at {new Date(session.expiresAt).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Past sessions */}
      {sessions.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Past Sessions</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Present</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">{new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3">
                    <span className={s.isActive ? 'badge-ok' : 'text-gray-400 text-xs'}>
                      {s.isActive ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{s.totalPresent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
