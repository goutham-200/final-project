import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Lightbulb, TrendingUp, ShieldCheck,
  GraduationCap, BookUser, BarChart2, AlertTriangle,
  Loader2, Sparkles, Target, Award
} from 'lucide-react';
import api from '../api/axiosConfig';

// ── micro-components ───────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, colorClass, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${colorClass} flex-shrink-0`}><Icon size={22} /></div>
    <div>
      <p className="text-xs text-text-main font-medium">{title}</p>
      <p className="text-2xl font-bold text-text-dark">{value ?? '—'}</p>
      {sub && <p className="text-xs text-text-main mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

// Animated bar for learning styles chart
const Bar = ({ label, count, total, color, delay }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center w-1/4 h-full justify-end">
      <span className="text-xs font-bold text-text-dark mb-1">{pct > 0 ? `${pct}%` : ''}</span>
      <motion.div
        initial={{ height: 0 }} animate={{ height: `${Math.max(pct, 4)}%` }}
        transition={{ delay, duration: 0.7, ease: 'easeOut' }}
        className={`w-full rounded-t-lg ${color} opacity-90`}
      />
      <span className="text-[11px] text-text-main mt-2 font-medium text-center">{label}<br/>({count})</span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'Super Admin';

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, studentsRes] = await Promise.all([
          api.get('/stats'),
          // Only fetch students if teacher/admin (teachers have a roster)
          user?.role !== 'Student'
            ? api.get('/students', { params: { limit: 4, page: 1 } })
            : Promise.resolve({ data: { data: [] } })
        ]);
        setStats(statsRes.data.data);
        setRecentStudents(studentsRes.data.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 size={36} className="animate-spin text-primary" />
      <p className="text-text-main text-sm">Loading dashboard…</p>
    </div>
  );

  const ls = stats?.learningStyles || {};
  const lsTotal = Object.values(ls).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Overview</h1>
          <p className="text-text-main mt-0.5">
            Welcome back, <span className="font-semibold text-primary">{user?.name}</span>!
            {isAdmin ? " Here's the system-wide summary." : " Here's what's happening with your students today."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
          <Sparkles size={13} />
          AI Engine Online
        </div>
      </div>

      {/* ── ADMIN STAT ROW ── */}
      {isAdmin && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">System Users</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard delay={0.05} title="Total Users"       value={stats?.totalUsers}           icon={Users}        colorClass="bg-slate-100 text-slate-700" />
            <StatCard delay={0.10} title="Super Admins"      value={stats?.totalAdmins}          icon={ShieldCheck}  colorClass="bg-purple-100 text-purple-700" />
            <StatCard delay={0.15} title="Teachers"          value={stats?.totalTeachers}        icon={BookUser}     colorClass="bg-blue-100 text-blue-700" />
            <StatCard delay={0.20} title="Student Accounts"  value={stats?.totalStudentAccounts} icon={GraduationCap}colorClass="bg-green-100 text-green-700" />
          </div>
          <div className="border-t border-gray-100 pt-2" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Academic Summary</p>
        </>
      )}

      {/* ── ACADEMIC STAT ROW (all roles) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.25} title="Students Managed"    value={stats?.totalStudents}   icon={Users}     colorClass="bg-blue-50 text-primary"     sub={isAdmin ? 'All classes' : 'Your class'} />
        <StatCard delay={0.30} title="Strategy Bank"       value={stats?.totalStrategies} icon={BookOpen}  colorClass="bg-teal-50 text-accent"       sub="Approved strategies" />
        <StatCard delay={0.35} title="AI Recommendations"  value={stats?.totalRecs}       icon={Lightbulb} colorClass="bg-purple-50 text-purple-600" sub="Generated total" />
        <StatCard delay={0.40} title="At-Risk Students"    value={stats?.atRisk}          icon={AlertTriangle} colorClass="bg-red-50 text-red-500"  sub="Score < 50%" />
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Students */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-text-dark text-lg">Recently Added Students</h2>
            {user?.role !== 'Student' && (
              <Link to="/teacher" className="text-primary text-xs font-semibold hover:underline">View all →</Link>
            )}
          </div>
          <div className="space-y-3">
            {recentStudents.length > 0 ? recentStudents.slice(0, 4).map((student) => {
              const perf = student.performanceScore || 0;
              return (
                <div key={student._id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark text-sm">{student.name}</p>
                      <p className="text-xs text-text-main">{student.learningStyle} · {student.grade} Grade</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${perf >= 70 ? 'bg-green-100 text-green-700' : perf >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {perf}%
                    </span>
                    <Link to={`/students/${student._id}`} className="text-primary font-semibold text-xs hover:underline">View</Link>
                  </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center">
                <Users className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-sm text-text-main">No students yet. Add students in the Teacher Portal.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column: class perf + learning styles */}
        <div className="space-y-4">
          {/* Avg Performance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-text-dark text-lg mb-4">Class Performance</h2>
            <div className="space-y-3">
              {[
                { label: 'Average Score', value: `${stats?.avgPerf || 0}%`, icon: Target, color: stats?.avgPerf >= 70 ? 'text-green-600' : stats?.avgPerf >= 50 ? 'text-amber-500' : 'text-red-500' },
                { label: 'At-Risk Students', value: stats?.atRisk || 0, icon: AlertTriangle, color: 'text-red-500' },
                { label: 'AI Strategies Used', value: stats?.totalRecs || 0, icon: Award, color: 'text-purple-600' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-text-main">
                    <item.icon size={15} className={item.color} />
                    {item.label}
                  </div>
                  <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Learning Styles chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-text-dark text-lg mb-4">Learning Styles Distribution</h2>
            <div className="flex items-end justify-between px-2 pb-1 h-[140px] gap-2">
              {[
                { label: 'Visual',    count: ls.Visual || 0,              color: 'bg-primary' },
                { label: 'Auditory',  count: ls.Auditory || 0,            color: 'bg-accent' },
                { label: 'Kinaest.', count: ls.Kinesthetic || 0,          color: 'bg-purple-500' },
                { label: 'R/W',       count: ls['Reading-Writing'] || 0,  color: 'bg-amber-500' },
              ].map((bar, i) => (
                <Bar key={bar.label} {...bar} total={lsTotal} delay={0.6 + i * 0.07} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
