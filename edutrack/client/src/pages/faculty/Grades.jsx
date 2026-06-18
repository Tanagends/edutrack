import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyAssessment = { name: '', score: '', maxScore: 100, weightPercent: '' };

const FacultyGrades = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentId: '', academicYear: '2024-25', semester: 1, assessment: { ...emptyAssessment } });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.data)).catch(console.error);
  }, []);

  const loadGrades = async (courseId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/grades/course/${courseId}/all`);
      setGrades(data.data);
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load grades');
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    if (e.target.value) loadGrades(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (['name', 'score', 'maxScore', 'weightPercent'].includes(name)) {
      setForm((f) => ({ ...f, assessment: { ...f.assessment, [name]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/grades/assess', {
        studentId: form.studentId,
        courseId: selectedCourse,
        academicYear: form.academicYear,
        semester: parseInt(form.semester),
        assessment: {
          name: form.assessment.name,
          score: parseFloat(form.assessment.score),
          maxScore: parseFloat(form.assessment.maxScore),
          weightPercent: parseFloat(form.assessment.weightPercent),
        },
      });
      toast.success('Grade saved!');
      setForm({ studentId: '', academicYear: '2024-25', semester: 1, assessment: { ...emptyAssessment } });
      loadGrades(selectedCourse);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <p className="text-gray-500 text-sm mt-1">Enter assessment scores for enrolled students.</p>
      </div>

      {/* Course selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
        <select value={selectedCourse} onChange={handleCourseChange} className="input max-w-sm">
          <option value="">— Choose a course —</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
        </select>
      </div>

      {/* Add assessment form */}
      {selectedCourse && (
        <div className="card border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-4">Add / Update Assessment</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input name="studentId" value={form.studentId} onChange={handleFormChange} className="input" placeholder="Student _id from DB" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Name</label>
              <input name="name" value={form.assessment.name} onChange={handleFormChange} className="input" placeholder="Mid-1 / Assignment-2 / Final" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <input type="number" name="score" value={form.assessment.score} onChange={handleFormChange} className="input" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input type="number" name="maxScore" value={form.assessment.maxScore} onChange={handleFormChange} className="input" min="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight %</label>
              <input type="number" name="weightPercent" value={form.assessment.weightPercent} onChange={handleFormChange} className="input" min="1" max="100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input name="academicYear" value={form.academicYear} onChange={handleFormChange} className="input" placeholder="2024-25" required />
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grades table */}
      {selectedCourse && (
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : grades.length === 0 ? (
            <p className="text-center py-10 text-gray-400">No grades recorded yet for this course.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Assessments</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Weighted Score</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{g.student?.user?.name}</p>
                      <p className="text-xs text-gray-400">{g.student?.rollNumber}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {g.assessments.map((a) => (
                        <span key={a.name} className="mr-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {a.name}: {a.score}/{a.maxScore}
                        </span>
                      ))}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{g.weightedScore}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${g.letterGrade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                        {g.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyGrades;
