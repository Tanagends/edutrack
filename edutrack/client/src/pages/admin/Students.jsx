import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data.data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deactivated');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = students.filter((s) => {
    const name  = s.user?.name?.toLowerCase() || '';
    const roll  = s.rollNumber?.toLowerCase() || '';
    const dept  = s.department?.toLowerCase() || '';
    const q     = search.toLowerCase();
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

      {/* Search */}
      <div className="card py-4">
        <input
          type="text"
          placeholder="Search by name, roll number or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

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
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">No students found.</td>
                </tr>
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
                    <td className="px-5 py-3 text-right">
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
    </div>
  );
};

export default Students;
