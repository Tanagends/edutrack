import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const GRADE_COLORS = { O: 'text-green-600', 'A+': 'text-green-500', A: 'text-blue-500', 'B+': 'text-blue-400', B: 'text-yellow-500', C: 'text-orange-500', F: 'text-red-600', 'N/A': 'text-gray-400' };

const StudentGrades = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/courses');
        setCourses(data.data);

        const gradeResults = await Promise.allSettled(
          data.data.map((c) => api.get(`/grades/${c._id}`))
        );

        const gradeList = gradeResults
          .map((res, i) =>
            res.status === 'fulfilled' ? res.value.data.data : { course: data.data[i], assessments: [], weightedScore: 0, letterGrade: 'N/A' }
          );
        setGrades(gradeList);
      } catch (err) {
        toast.error('Failed to load grades');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-500 text-sm mt-1">Assessment scores and computed grades for all enrolled courses.</p>
      </div>

      {grades.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No grade records found yet.</div>
      ) : (
        <div className="space-y-4">
          {grades.map((g, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-800">{g.course?.name || courses[i]?.name}</p>
                  <p className="text-xs text-gray-400">{g.course?.code || courses[i]?.code}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${GRADE_COLORS[g.letterGrade] || 'text-gray-400'}`}>
                    {g.letterGrade}
                  </p>
                  <p className="text-xs text-gray-400">{g.weightedScore ?? 0} / 100</p>
                </div>
              </div>

              {g.assessments?.length > 0 ? (
                <div className="space-y-2">
                  {g.assessments.map((a, j) => (
                    <div key={j} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{a.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-xs">{a.weightPercent}% weight</span>
                        <span className="font-medium text-gray-800">{a.score} / {a.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No assessments recorded yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
