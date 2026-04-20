import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './features/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Strategies from './pages/Strategies';
import StrategyDetail from './pages/StrategyDetail';
import AdminPanel from './pages/AdminPanel';
import TeacherPortal from './pages/TeacherPortal';
import StudentPortal from './pages/StudentPortal';

// Full-screen loading splash shown while we verify the token on refresh
function AppLoader() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg animate-pulse">
        <span className="text-white text-2xl font-black">I</span>
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-text-main text-sm font-medium">Restoring your session…</p>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, appReady } = useSelector((state) => state.auth);

  // On every cold boot / refresh: validate JWT and restore user
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Wait until auth check is done before rendering anything
  if (!appReady) return <AppLoader />;

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'Super Admin') return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={user?.role === 'Student' ? <Navigate to="/my-portal" replace /> : <Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="strategies/:id" element={<StrategyDetail />} />
        <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="teacher" element={<ProtectedRoute><TeacherPortal /></ProtectedRoute>} />
        <Route path="my-portal" element={<ProtectedRoute><StudentPortal /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
