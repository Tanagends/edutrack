import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FacultyAttendance = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('qr'); // 'qr' | 'manual'
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');

  // QR state
  const [session, setSession] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Manual state
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' }
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.data)).catch(() => toast.error('Failed to load courses'));
  }, []);

  // Load sessions when course changes (QR tab)
  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/attendance/sessions/${selectedCourse}`)
      .then(({ data }) => setSessions(data.data))
      .catch(console.error);
  }, [selectedCourse]);

  // Load enrolled students when course changes (Manual tab)
  useEffect(() => {
    if (!selectedCourse || tab !== 'manual') return;
    setLoadingStudents(true);
    api.get(`/courses/${selectedCourse}/students`)
      .then(({ data }) => {
        setEnrolledStudents(data.data);
        // Default everyone to present
        const defaults = {};
        data.data.forEach((s) => { defaults[s._id] = 'present'; });
        setAttendance(defaults);
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoadingStudents(false));
  }, [selectedCourse, tab]);

  // QR countdown
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(session.expiresAt) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSession(null);
        toast('QR code expired', { icon: '⏰' });
        clearInterval(interval);
        api.get(`/attendance/sessions/${selectedCourse}`).then(({ data }) => setSessions(data.data)).catch(console.error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, selectedCourse]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSession(null);
    setEnrolledStudents([]);
    setAttendance({});
  };

  // ── QR handlers ─────────────────────────────────────────────────────────
  const handleGenerateQR = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    setGenerating(true);
    try {
      const { data } = await api.post('/attendance/session', { courseId: selectedCourse });
      setSession(data.data);
      setTimeLeft(data.data.expireMinutes * 60);
      toast.success('QR code generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Manual handlers ──────────────────────────────────────────────────────
  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status) => {
    const updated = {};
    enrolledStudents.forEach((s) => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleManualSubmit = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    if (enrolledStudents.length === 0) return toast.error('No students enrolled in this course');
    setSubmitting(true);
    try {
      const attendances = enrolledStudents.map((s) => ({
        studentId: s._id,
        status: attendance[s._id] || 'absent',
      }));
      const { data } = await api.post('/attendance/manual', {
        courseId: selectedCourse,
        date: manualDate,
        attendances,
      });
      toast.success(data.message);
      // Refresh sessions
      api.get(`/attendance/sessions/${selectedCourse}`).then(({ d }) => setSessions(d?.data || [])).catch(console.error);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount  = Object.values(attendance).filter((v) => v === 'absent').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Generate QR for students to scan, or mark attendance manually.</p>
      </div>

      {/* Course selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
        <select value={selectedCourse} onChange={handleCourseChange} className="input max-w-sm">
          <option value="">— Choose a course —</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('qr')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'qr' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📱 QR Session
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ✏️ Manual Entry
        </button>
      </div>

      {/* ── QR Tab ─────────────────────────────────────────────────────── */}
      {tab === 'qr' && (
        <>
          <div className="card space-y-4">
            <button onClick={handleGenerateQR} disabled={generating || !selectedCourse} className="btn-primary text-sm">
              {generating ? 'Generating...' : '📱 Generate QR Code'}
            </button>
          </div>

          {session && (
            <div className="card border-2 border-orange-200 text-center space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Active QR Session</h2>
                <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-green-600'}`}>
                  ⏱ {formatTime(timeLeft)}
                </span>
              </div>
              <img src={session.qrImage} alt="QR Code" className="w-56 h-56 mx-auto rounded-xl border border-gray-200" />
              <p className="text-sm text-gray-500">Show this on the projector. Students scan from their dashboard.</p>
              <p className="text-xs text-gray-400">Expires at {new Date(session.expiresAt).toLocaleTimeString()}</p>
            </div>
          )}
        </>
      )}

      {/* ── Manual Tab ─────────────────────────────────────────────────── */}
      {tab === 'manual' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="input"
                />
              </div>
              {enrolledStudents.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={() => markAll('present')} className="btn-secondary text-xs">✅ All Present</button>
                  <button onClick={() => markAll('absent')} className="btn-secondary text-xs">❌ All Absent</button>
                </div>
              )}
            </div>

            {!selectedCourse && (
              <p className="text-gray-400 text-sm">Select a course above to load enrolled students.</p>
            )}

            {selectedCourse && loadingStudents && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                Loading students...
              </div>
            )}

            {selectedCourse && !loadingStudents && enrolledStudents.length === 0 && (
              <p className="text-gray-400 text-sm">No students enrolled in this course yet.</p>
            )}

            {enrolledStudents.length > 0 && (
              <>
                {/* Summary bar */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-green-600 font-medium">✅ {presentCount} present</span>
                  <span className="text-red-500 font-medium">❌ {absentCount} absent</span>
                  <span className="text-gray-400">/ {enrolledStudents.length} total</span>
                </div>

                {/* Student checklist */}
                <div className="divide-y divide-gray-100">
                  {enrolledStudents.map((s) => {
                    const isPresent = attendance[s._id] === 'present';
                    return (
                      <div key={s._id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                            {s.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.user?.name}</p>
                            <p className="text-xs text-gray-400">{s.rollNumber}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStatus(s._id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            isPresent
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {isPresent ? '✅ Present' : '❌ Absent'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Saving...' : `Save Attendance (${presentCount} present)`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Past sessions (both tabs) */}
      {sessions.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Session History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Present</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">
                    {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {s.type === 'manual' ? '✏️ Manual' : s.isActive ? '📱 QR' : '📱 QR (closed)'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={s.isActive ? 'badge-ok' : 'text-gray-400 text-xs'}>
                      {s.isActive ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">{s.totalPresent}</td>
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
