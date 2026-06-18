import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enrollModal, setEnrollModal] = useState(null); // { studentId, studentName }
  const [enrollForm, setEnrollForm] = useState({ courseId: '', academicYear: '2024-25', semester: 1 });
  const [enrolling, setEnrolling] = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([api.get('/students'), api.get('/courses')]);
      setStudents(sRes.data.data);
      setCourses(cRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deactivated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollForm.courseId) return toast.error('Select a course');
    setEnrolling(true);
    try {
      await api.post(`/courses/${enrollForm.courseId}/enroll`, {
        studentId: enrollModal.studentId,
        academicYear: enrollForm.academicYear,
        semester: parseInt(enrollForm.semester),
      });
      toast.success(`${enrollModal.studentName} enrolled successfully!`);
      setEnrollModal(null);
      setEnrollForm({ courseId: '', academicYear: '2024-25', semester: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const filtered = students.filter((s) => {
    const name = s.user?.name?.toLowerCase() || '';
    const roll = s.rollNumber?.toLowerCase() || '';
    const dept = s.department?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || roll.includes(q) || dept.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} registered students</p>
        </div>
      </div>

      <div className="card py-4">
        <input
          type="text"
          placeholder="Search by name, roll number or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Roll No.</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Sem</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No students found.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-xs">
                          {s.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.user?.name}</p>
                          <p className="text-xs text-gray-400">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{s.rollNumber}</td>
                    <td className="px-5 py-3 text-gray-600">{s.department}</td>
                    <td className="px-5 py-3 text-gray-600">{s.semester}</td>
                    <td className="px-5 py-3">
                      <span className={s.user?.isActive ? 'badge-ok' : 'badge-risk'}>
                        {s.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-3">
                      <button
                        onClick={() => setEnrollModal({ studentId: s._id, studentName: s.user?.name })}
                        className="text-xs text-orange-500 hover:text-orange-700 font-medium"
                      >
                        + Enroll
                      </button>
                      {s.user?.isActive && (
                        <button
                          onClick={() => handleDeactivate(s._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Enrollment modal */}
      {enrollModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Enroll Student in Course</h3>
              <button onClick={() => setEnrollModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <p className="text-sm text-gray-500">
              Enrolling: <span className="font-medium text-gray-800">{enrollModal.studentName}</span>
            </p>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={enrollForm.courseId}
                  onChange={(e) => setEnrollForm((f) => ({ ...f, courseId: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input
                    value={enrollForm.academicYear}
                    onChange={(e) => setEnrollForm((f) => ({ ...f, academicYear: e.target.value }))}
                    className="input"
                    placeholder="2024-25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={enrollForm.semester}
                    onChange={(e) => setEnrollForm((f) => ({ ...f, semester: e.target.value }))}
                    className="input"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEnrollModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={enrolling} className="btn-primary flex-1 text-sm">
                  {enrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
