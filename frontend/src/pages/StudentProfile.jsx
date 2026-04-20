import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchByStudent, generateRecommendations } from '../features/recommendationsSlice';
import * as studentsApi from '../api/studentsApi';
import { ArrowLeft, UserRound, Sparkles, Star, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function StudentProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { items: recommendations, generating, loading: recsLoading } = useSelector(state => state.recommendations);
  
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const res = await studentsApi.getStudentById(id);
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudent(false);
      }
    };
    
    loadStudent();
    dispatch(fetchByStudent(id));
  }, [id, dispatch]);

  const handleGenerate = () => {
    dispatch(generateRecommendations(id));
  };

  if (loadingStudent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-gray-800">Student not found</h2>
        <Link to="/students" className="text-primary mt-4 inline-block">Return to Students</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center text-text-main hover:text-primary transition-colors text-sm font-medium mb-2">
        <ArrowLeft size={16} className="mr-1" />
        Back to Students
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Detail */}
        <div className="lg:col-span-1 border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="bg-primary/5 p-8 flex flex-col items-center border-b border-gray-100">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <UserRound size={40} className="text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-text-dark text-center">{student.name}</h1>
            <p className="text-text-main">{student.grade} Grade</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-text-main uppercase font-bold tracking-wider mb-1">Learning Style</p>
              <div className="inline-block bg-blue-50 text-primary-dark font-semibold px-3 py-1 rounded-md">
                {student.learningStyle}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-text-main uppercase font-bold tracking-wider mb-1">Performance Score</p>
              <div className="flex items-center">
                <div className="w-full bg-gray-100 rounded-full h-2.5 mr-3">
                  <div className={`h-2.5 rounded-full ${student.performanceScore >= 80 ? 'bg-teal-500' : student.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.performanceScore}%` }}></div>
                </div>
                <span className="font-bold text-text-dark">{student.performanceScore}%</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-main uppercase font-bold tracking-wider mb-1">Subject Weaknesses</p>
              <div className="flex flex-wrap gap-2">
                {student.subjectWeaknesses?.length > 0 ? (
                  student.subjectWeaknesses.map(sub => (
                    <span key={sub} className="bg-gray-100 text-text-dark text-xs font-medium px-2 py-1 rounded">
                      {sub}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-main">None recorded</span>
                )}
              </div>
            </div>

            {student.notes && (
              <div>
                <p className="text-xs text-text-main uppercase font-bold tracking-wider mb-1">Teacher Notes</p>
                <p className="text-sm text-text-dark bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">{student.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-dark">AI Strategy Recommendations</h2>
              <p className="text-sm text-text-main">Powered by ITSRE Engine</p>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="bg-accent hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center space-x-2 disabled:opacity-75"
            >
              {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{recommendations?.length > 0 ? 'Regenerate Top 5' : 'Generate Top 5'}</span>
            </button>
          </div>

          {recsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : recommendations?.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center border-dashed">
              <Sparkles className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-text-main">No recommendations generated yet. Click above to analyze student profile.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={rec._id} 
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 hover:border-accent transition-colors"
                >
                  <div className="bg-teal-50 text-accent p-4 rounded-xl flex-shrink-0 h-fit self-start">
                    <BookOpen size={28} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/strategies/${rec.strategyId?._id}`} className="text-lg font-bold text-text-dark hover:text-primary transition-colors">
                        {rec.strategyId?.title || 'Unknown Strategy'}
                      </Link>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                        {rec.strategyId?.difficultyLevel}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.strategyId?.targetLearningStyles?.map(style => (
                        <span key={style} className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {style}
                        </span>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4">
                      <p className="text-sm font-medium text-text-dark flex items-start gap-2">
                        <Sparkles size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{rec.teacherNotes}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                      <span className="text-xs font-semibold text-text-main uppercase tracking-wider">Effectiveness Rating:</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={20} 
                            className={star <= (rec.effectivenessRating || 0) ? "fill-current cursor-pointer" : "text-gray-200 cursor-pointer hover:text-amber-200"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
