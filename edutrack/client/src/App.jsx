import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import AdminLayout   from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/StudentLayout';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents  from './pages/admin/Students';
import AdminFaculty   from './pages/admin/Faculty';
import AdminCourses   from './pages/admin/Courses';
import AdminAnalytics from './pages/admin/Analytics';
import AdminRisk      from './pages/admin/Risk';

// Faculty pages
import FacultyDashboard  from './pages/faculty/Dashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyGrades     from './pages/faculty/Grades';
import FacultyRisk       from './pages/faculty/Risk';

// Student pages
import StudentDashboard  from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentGrades     from './pages/student/Grades';

const App = () => {
  const { user } = useAuth();

  // Default redirect for "/"
  const defaultPath = user
    ? user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'
    : '/login';

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"            element={<AdminDashboard />} />
          <Route path="/admin/students"   element={<AdminStudents />} />
          <Route path="/admin/faculty"    element={<AdminFaculty />} />
          <Route path="/admin/courses"    element={<AdminCourses />} />
          <Route path="/admin/analytics"  element={<AdminAnalytics />} />
          <Route path="/admin/risk"       element={<AdminRisk />} />
        </Route>
      </Route>

      {/* Faculty */}
      <Route element={<ProtectedRoute roles={['faculty']} />}>
        <Route element={<FacultyLayout />}>
          <Route path="/faculty"            element={<FacultyDashboard />} />
          <Route path="/faculty/attendance" element={<FacultyAttendance />} />
          <Route path="/faculty/grades"     element={<FacultyGrades />} />
          <Route path="/faculty/risk"       element={<FacultyRisk />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student"            element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/grades"     element={<StudentGrades />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

export default App;
