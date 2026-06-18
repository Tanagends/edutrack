import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '' };

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchFaculty = async () => {
    try {
      const { data } = await api.get('/users?role=faculty');
      setFaculty(data.data);
    } catch (err) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.post('/users', { ...form, role: 'faculty' });
      toast.success('Faculty account created!');
      setForm(emptyForm);
      setShowForm(false);
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create faculty');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.put(`/users/${id}/toggle`);
      toast.success(isActive ? 'Faculty deactivated' : 'Faculty activated');
      fetchFaculty();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
          <p className="text-gray-500 text-sm mt-1">{faculty.length} faculty member{faculty.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Faculty'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-4">New Faculty Account</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Dr. John Smith" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="faculty@aditya.ac.in" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="input" placeholder="Min 6 characters" required />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm w-full">
                {saving ? 'Creating...' : 'Create Faculty Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : faculty.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👨‍🏫</p>
            <p className="font-medium">No faculty yet.</p>
            <p className="text-sm mt-1">Click "+ Add Faculty" to create the first account.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                        {f.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-medium text-gray-800">{f.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{f.email}</td>
                  <td className="px-5 py-3">
                    <span className={f.isActive ? 'badge-ok' : 'badge-risk'}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggle(f._id, f.isActive)}
                      className={`text-xs font-medium ${f.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {f.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default Faculty;
