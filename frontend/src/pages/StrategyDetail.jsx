import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StrategyDetail() {
  const { id } = useParams();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto space-y-6"
    >
      <Link to="/strategies" className="inline-flex items-center text-text-main hover:text-primary transition-colors text-sm font-medium mb-4">
        <ArrowLeft size={16} className="mr-1" />
        Back to Strategy Bank
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Medium Difficulty</span>
              <div className="flex items-center text-amber-500">
                <Star size={18} fill="currentColor" />
                <span className="font-bold ml-1">4.8</span>
                <span className="text-text-main text-sm font-normal ml-1">(124 ratings)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-dark">Concept Mapping</h1>
          </div>
          <button className="bg-accent hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center space-x-2">
            <Play size={20} />
            <span>Apply to Student</span>
          </button>
        </div>

        <p className="text-lg text-text-main leading-relaxed mb-8">
          A visual teaching strategy that helps students organize and represent knowledge. It involves creating a diagram that shows relationships among concepts, making it highly effective for visual learners and complex topics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-text-dark mb-4 border-b border-gray-100 pb-2">Target Learning Styles</h3>
            <div className="flex gap-2">
              <span className="bg-blue-50 text-primary-dark font-medium px-4 py-2 rounded-lg">Visual</span>
              <span className="bg-purple-50 text-purple-700 font-medium px-4 py-2 rounded-lg">Reading-Writing</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-dark mb-4 border-b border-gray-100 pb-2">Suitable Subjects</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-gray-100 text-text-dark font-medium px-4 py-2 rounded-lg text-sm">Science</span>
              <span className="bg-gray-100 text-text-dark font-medium px-4 py-2 rounded-lg text-sm">History</span>
              <span className="bg-gray-100 text-text-dark font-medium px-4 py-2 rounded-lg text-sm">Literature</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-text-dark mb-4 border-b border-gray-100 pb-2">Implementation Steps</h3>
          <ul className="space-y-4">
            {[
              "Identify the main concept or central idea.",
              "Brainstorm related secondary concepts.",
              "Group concepts into a hierarchical structure.",
              "Connect concepts with lines and linking words.",
              "Review and refine the map collaboratively."
            ].map((step, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={20} />
                <span className="text-text-main">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
