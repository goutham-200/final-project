import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus, Filter, UserRound, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchStudents } from '../features/studentsSlice';

export default function Students() {
  const dispatch = useDispatch();
  const { list: students, loading, error } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced Search logic could be added here, simplified for now
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchStudents({ search: searchTerm }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Student Profiles</h1>
          <p className="text-text-main">Manage your students and get AI-powered strategy recommendations.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search students by name..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-text-main hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl shadow-sm">{error}</div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-50 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
            <UserRound size={40} />
          </div>
          <h3 className="text-lg font-bold text-text-dark mb-1">No students found</h3>
          <p className="text-text-main">Get started by adding your first student profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student, idx) => (
            <motion.div 
              key={student._id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 group relative"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto overflow-hidden">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserRound size={32} className="text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-text-dark text-center mb-1">{student.name}</h3>
                <p className="text-sm text-text-main text-center mb-4">{student.grade} Grade</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                    <span className="text-text-main">Learning Style</span>
                    <span className="font-semibold text-text-dark">{student.learningStyle}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-main">Performance</span>
                    <span className={`font-semibold ${
                      student.performanceScore >= 85 ? 'text-accent' : 
                      student.performanceScore >= 70 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {student.performanceScore}/100
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 mt-auto">
                <button className="w-full text-primary font-medium text-sm hover:text-primary-dark transition-colors flex items-center justify-center">
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
