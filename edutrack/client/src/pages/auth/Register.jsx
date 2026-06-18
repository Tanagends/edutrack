import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    rollNumber: '', department: '', semester: '1',
    enrollmentYear: new Date().getFullYear().toString(),
    guardianEmail: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      payload.role = 'student';
      payload.semester = parseInt(payload.semester);
      payload.enrollmentYear = parseInt(payload.enrollmentYear);
      await register(payload);
      toast.success('Account created! Welcome to EduTrack.');
      navigate('/student', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-orange-500">Edu</span>
            <span className="text-gray-800">Track</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Aditya University — Student Management System</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Create student account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Tanatswa Gendere" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input name="rollNumber" value={form.rollNumber} onChange={handleChange} className="input" placeholder="24B11CS529" required />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="you@aditya.ac.in" required />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input name="department" value={form.department} onChange={handleChange} className="input" placeholder="Computer Science" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} className="input">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year</label>
                <input type="number" name="enrollmentYear" value={form.enrollmentYear} onChange={handleChange} className="input" min="2000" max="2099" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email <span className="text-gray-400">(optional)</span></label>
                <input type="email" name="guardianEmail" value={form.guardianEmail} onChange={handleChange} className="input" placeholder="parent@email.com" />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="input" placeholder="Min 6 characters" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
