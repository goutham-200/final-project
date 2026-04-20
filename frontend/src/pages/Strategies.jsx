import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus, Star, BookOpen, Clock, Loader2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchStrategies, setFilter, clearFilters } from '../features/strategiesSlice';

export default function Strategies() {
  const dispatch = useDispatch();
  const { list: strategies, filters, loading, error } = useSelector(state => state.strategies);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchStrategies({ 
      ...filters, 
      search: searchTerm 
    }));
  }, [dispatch, filters, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Strategy Bank</h1>
          <p className="text-text-main">Explore, rate, and apply teaching strategies tailored to your students.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Propose Strategy</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 relative">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search strategies by name..." 
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
              showFilters || filters.learningStyle || filters.difficulty ? 'border-primary text-primary bg-blue-50' : 'border-gray-200 text-text-main hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter Dropdown */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 right-4 z-10 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Learning Style</label>
                <select 
                  className="w-full border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary border"
                  value={filters.learningStyle}
                  onChange={(e) => dispatch(setFilter({ learningStyle: e.target.value }))}
                >
                  <option value="">All Styles</option>
                  <option value="Visual">Visual</option>
                  <option value="Auditory">Auditory</option>
                  <option value="Kinesthetic">Kinesthetic</option>
                  <option value="Reading-Writing">Reading-Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Difficulty</label>
                <select 
                  className="w-full border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary border"
                  value={filters.difficulty}
                  onChange={(e) => dispatch(setFilter({ difficulty: e.target.value }))}
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button 
                onClick={() => dispatch(clearFilters())}
                className="w-full text-center text-sm text-text-main hover:text-red-500 py-1"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl shadow-sm">{error}</div>
      ) : strategies.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-teal-50 text-accent mx-auto rounded-full flex items-center justify-center mb-4">
            <BookOpen size={40} />
          </div>
          <h3 className="text-lg font-bold text-text-dark mb-1">No strategies found</h3>
          <p className="text-text-main">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strategy, idx) => (
            <motion.div 
              key={strategy._id} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative border-l-4 border-l-transparent hover:border-l-primary"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-50 p-3 rounded-xl text-accent">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-dark group-hover:text-primary transition-colors">
                      <Link to={`/strategies/${strategy._id}`}>{strategy.title}</Link>
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center text-amber-500">
                        <Star size={16} fill="currentColor" />
                        {/* Fake average rating based on id string length for visual layout demo */}
                        <span className="text-sm font-semibold ml-1">{4 + (strategy._id.length % 10) / 10}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-medium text-text-main px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                        {strategy.difficultyLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-text-main font-medium mb-2">Effective for:</p>
                <div className="flex flex-wrap gap-2">
                  {strategy.targetLearningStyles?.map(style => (
                    <span key={style} className="text-xs px-3 py-1 bg-blue-50 text-indigo-700 rounded-full font-medium">
                      {style}
                    </span>
                  ))}
                  {strategy.subjectTags?.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-full font-medium border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                <span className="text-sm text-text-main flex items-center">
                  <Clock size={16} className="mr-1" />
                  15-30 mins
                </span>
                <Link to={`/strategies/${strategy._id}`} className="text-primary font-medium text-sm hover:underline">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
