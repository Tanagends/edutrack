import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { code: '', name: '', credits: 3, semester: 1, department: '', faculty: '' };

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [cRes, fRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users?role=faculty'),
      ]);
      setCourses(cRes.data.data);
      setFacultyList(fRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: ['credits', 'semester'].includes(name) ? parseInt(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.faculty) return toast.error('Please select a faculty member');
    setSaving(true);
    try {
      await api.post('/courses', form);
      toast.success('Course created!');
      setForm(emptyForm);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} active courses</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-4">New Course</h3>

          {facultyList.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              ⚠️ No faculty found. <a href="/admin/faculty" className="underline font-medium">Add faculty first</a> before creating courses.
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input name="code" value={form.code} onChange={handleChange} className="input" placeholder="CS301" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Data Structures" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input" placeholder="Computer Science" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Faculty</label>
              <select name="faculty" value={form.faculty} onChange={handleChange} className="input" required>
                <option value="">— Select faculty —</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <select name="credits" value={form.credits} onChange={handleChange} className="input">
                {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} className="input">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving || facultyList.length === 0} className="btn-primary text-sm">
                {saving ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Faculty</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Sem / Credits</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No courses yet. Create one above.</td></tr>
              ) : (
                courses.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 font-medium">{c.code}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-5 py-3 text-gray-600">{c.department}</td>
                    <td className="px-5 py-3 text-gray-600">{c.faculty?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">Sem {c.semester} · {c.credits} cr</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Courses;
