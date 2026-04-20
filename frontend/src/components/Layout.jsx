import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { BookOpen, Users, LayoutDashboard, LogOut, GraduationCap, ShieldCheck, ClipboardList, BookMarked } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={twMerge(
        clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium",
          isActive 
            ? "bg-primary text-white" 
            : "text-text-main hover:bg-white hover:text-primary hover:shadow-sm"
        )
      )}
    >
      <Icon size={20} className={isActive ? "text-white" : "text-text-main"} />
      <span>{children}</span>
    </Link>
  );
};

export default function Layout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-[#F8FAFC] flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-xl">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-text-dark tracking-tight">ITSRE</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {user?.role !== 'Student' && (
            <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          )}
          {/* Student-only nav */}
          {user?.role === 'Student' && (
            <SidebarLink to="/my-portal" icon={BookMarked}>My Portal</SidebarLink>
          )}
          {/* Teacher / Admin nav */}
          {(user?.role === 'Teacher' || user?.role === 'Super Admin') && (
            <>
              <SidebarLink to="/students" icon={Users}>Students</SidebarLink>
              <SidebarLink to="/teacher" icon={ClipboardList}>Teacher Portal</SidebarLink>
              <SidebarLink to="/strategies" icon={BookOpen}>Strategy Bank</SidebarLink>
            </>
          )}
          {user?.role === 'Super Admin' && (
            <>
              <div className="my-3 border-t border-gray-200" />
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
              <SidebarLink to="/admin" icon={ShieldCheck}>User Management</SidebarLink>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'T'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">{user?.name || 'Teacher'}</p>
              <p className="text-xs text-text-main capitalize">{user?.role || 'Educator'}</p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            className="flex items-center space-x-2 w-full px-4 py-2 text-text-main hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="text-primary" size={24} />
            <span className="text-xl font-bold text-text-dark">ITSRE</span>
          </div>
          <button onClick={() => dispatch(logout())} className="text-text-main">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
