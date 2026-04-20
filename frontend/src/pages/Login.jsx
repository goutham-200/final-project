import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../features/authSlice';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-light bg-opacity-10 p-3 rounded-2xl mb-4">
            <GraduationCap className="text-primary" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-text-dark text-center">Intelligent Teaching Strategy Recommendation Engine</h1>
          <p className="text-text-main text-center mt-2 text-sm">"The right strategy for every student, every time."</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="teacher@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg flex justify-center items-center space-x-2 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-text-main">
          <p>Demo accounts:</p>
          <p className="mt-1 font-mono bg-gray-100 py-1 rounded inline-block px-2">teacher@demo.com / password</p>
        </div>
      </motion.div>
    </div>
  );
}
