import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProfile, getMyRecommendations } from '../api/studentPortalApi';
import {
  GraduationCap, BarChart2, BookOpen, Sparkles,
  Loader2, Star, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, Award, AlertCircle, CheckCircle2, Calendar
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
const pct = (marks, max) => Math.round((marks / (max || 100)) * 100);

const gradeConfig = (p) => {
  if (p >= 85) return { label: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', ring: 'ring-emerald-400', trend: 'up' };
  if (p >= 70) return { label: 'B', color: 'text-blue-600',    bg: 'bg-blue-50',    bar: 'bg-blue-500',    ring: 'ring-blue-400',    trend: 'up' };
  if (p >= 55) return { label: 'C', color: 'text-amber-600',   bg: 'bg-amber-50',   bar: 'bg-amber-400',   ring: 'ring-amber-400',   trend: 'flat' };
  if (p >= 40) return { label: 'D', color: 'text-orange-600',  bg: 'bg-orange-50',  bar: 'bg-orange-400',  ring: 'ring-orange-400',  trend: 'down' };
  return          { label: 'F', color: 'text-red-600',    bg: 'bg-red-50',    bar: 'bg-red-500',    ring: 'ring-red-400',    trend: 'down' };
};

const TrendIcon = ({ trend }) =>
  trend === 'up'   ? <TrendingUp  size={14} className="text-emerald-500" /> :
  trend === 'down' ? <TrendingDown size={14} className="text-red-400"    /> :
                     <Minus        size={14} className="text-amber-400"   />;

// Circular ring progress
const RingGauge = ({ pct: value, config, size = 100 }) => {
  const r = 38, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
      <motion.circle cx={cx} cy={cy} r={r} fill="none"
        stroke={`var(--tw-ring-color, currentColor)`}
        className={config.ring.replace('ring-', 'stroke-').replace('ring', 'stroke')}
        strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
};

export default function StudentPortal() {
  const { user } = useSelector(s => s.auth);
  const [profile, setProfile]     = useState(null);
  const [recs, setRecs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState('marks');
  const [expandedRec, setExpandedRec] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, recsRes] = await Promise.all([
          getMyProfile(),
          getMyRecommendations()
        ]);
        setProfile(profileRes.data);
        setRecs(recsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 size={40} className="animate-spin text-primary" />
      <p className="text-text-main text-sm">Loading your profile…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
      <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
      <h2 className="text-xl font-bold text-text-dark mb-2">Profile Not Linked</h2>
      <p className="text-text-main text-sm leading-relaxed">{error}</p>
      <p className="mt-4 text-xs text-gray-400">Ask your teacher to link your account from the Teacher Portal.</p>
    </div>
  );

  const marks = profile?.subjectMarks || [];
  const attend = profile?.attendancePercent;
  const perf = profile?.performanceScore || 0;
  const perfConfig = gradeConfig(perf);
  const weakSubjects = profile?.subjectWeaknesses || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── HERO HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white/30 flex-shrink-0">
          {profile?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Student Portal</p>
          <h1 className="text-2xl font-bold">{profile?.name}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
            <span className="flex items-center gap-1"><GraduationCap size={14} /> {profile?.grade} Grade</span>
            {profile?.rollNumber && <span>Roll #{profile.rollNumber}</span>}
            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs font-medium">{profile?.learningStyle} Learner</span>
            {profile?.teacherId && <span className="text-blue-200">Teacher: {profile.teacherId.name}</span>}
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="relative">
              <RingGauge pct={perf} config={perfConfig} size={80} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{perf}%</span>
                <span className="text-[9px] text-blue-200 uppercase">Score</span>
              </div>
            </div>
          </div>
          {attend !== null && attend !== undefined && (
            <div className="text-center">
              <div className="relative">
                <RingGauge pct={attend} config={gradeConfig(attend)} size={80} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">{attend}%</span>
                  <span className="text-[9px] text-blue-200 uppercase">Attend</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── ALERT BANNERS ── */}
      <AnimatePresence>
        {weakSubjects.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-bold">Needs Attention:</span> You&apos;re below 50% in{' '}
              <span className="font-semibold">{weakSubjects.join(', ')}</span>. Check your recommended strategies!
            </p>
          </motion.div>
        )}
        {attend !== null && attend !== undefined && attend < 75 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Calendar size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-bold">Low Attendance ({attend}%):</span> Regular attendance is required (min 75%).
            </p>
          </motion.div>
        )}
        {perf >= 85 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Award size={18} className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">🎉 Excellent performance! Keep it up, {profile?.name?.split(' ')[0]}!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'marks',      label: 'My Marks',      icon: BarChart2 },
          { key: 'strategies', label: 'My Strategies',  icon: Sparkles },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-white shadow text-text-dark' : 'text-text-main hover:text-text-dark'}`}>
            <t.icon size={16} />
            {t.label}
            {t.key === 'strategies' && recs.length > 0 && (
              <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{recs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── MY MARKS TAB ── */}
      {tab === 'marks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {marks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
              <BarChart2 className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-text-dark font-semibold">No marks recorded yet</p>
              <p className="text-text-main text-sm mt-1">Your teacher will update your marks soon.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Overall Score', value: `${perf}%`, sub: perfConfig.label + ' Grade', config: perfConfig },
                  { label: 'Subjects', value: marks.length, sub: 'tracked', config: gradeConfig(70) },
                  { label: 'Passed', value: marks.filter(m => pct(m.marks, m.maxMarks) >= 40).length, sub: 'subjects', config: gradeConfig(85) },
                  { label: 'Need Work', value: weakSubjects.length, sub: 'subjects <50%', config: gradeConfig(30) },
                ].map((card, i) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5`}>
                    <p className="text-xs text-text-main font-medium">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.config.color}`}>{card.value}</p>
                    <p className="text-xs text-text-main mt-0.5">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Per-subject breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="font-bold text-text-dark text-lg">Subject-wise Performance</h2>
                  <p className="text-sm text-text-main mt-0.5">Tap a row to see details</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[...marks].sort((a, b) => pct(a.marks, a.maxMarks) - pct(b.marks, b.maxMarks)).map((m, i) => {
                    const p = pct(m.marks, m.maxMarks);
                    const cfg = gradeConfig(p);
                    const isWeak = p < 50;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Grade badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-text-dark text-sm flex items-center gap-2">
                                {m.subject}
                                {isWeak && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Needs Work</span>}
                              </span>
                              <div className="flex items-center gap-2 text-sm">
                                <TrendIcon trend={cfg.trend} />
                                <span className={`font-bold ${cfg.color}`}>{p}%</span>
                                <span className="text-text-main text-xs">({m.marks}/{m.maxMarks})</span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                className={`h-2 rounded-full ${cfg.bar}`} />
                            </div>
                            <p className="text-xs text-text-main mt-1">{m.examType} · {new Date(m.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher notes */}
              {profile?.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-lg flex-shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm mb-1">Teacher&apos;s Note</p>
                    <p className="text-amber-700 text-sm leading-relaxed">{profile.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ── MY STRATEGIES TAB ── */}
      {tab === 'strategies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {recs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
              <Sparkles className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-text-dark font-semibold">No strategies yet</p>
              <p className="text-text-main text-sm mt-1">Your teacher will generate personalised strategies for you soon.</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-2xl px-6 py-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-accent flex-shrink-0" />
                <p className="text-sm text-teal-800">
                  <span className="font-bold">{recs.length} strategies</span> have been personalised for you based on your marks and learning style.
                </p>
              </div>

              <div className="space-y-4">
                {recs.map((rec, idx) => {
                  const strategy = rec.strategyId;
                  const isOpen = expandedRec === rec._id;
                  if (!strategy) return null;

                  return (
                    <motion.div key={rec._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Rank ribbon */}
                      <div className="flex items-start gap-4 p-5">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-teal-500'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-text-dark text-base">{strategy.title}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${strategy.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' : strategy.difficultyLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {strategy.difficultyLevel}
                                </span>
                                {strategy.targetLearningStyles?.map(s => (
                                  <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s}</span>
                                ))}
                                {strategy.subjectTags?.map(t => (
                                  <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                                ))}
                              </div>
                            </div>
                            {/* Rating stars */}
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={16} className={s <= (rec.effectivenessRating || 0) ? 'text-amber-400 fill-current' : 'text-gray-200'} />
                              ))}
                            </div>
                          </div>

                          {/* AI Explanation pill */}
                          {rec.teacherNotes && (
                            <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl px-4 py-3 flex gap-2">
                              <Sparkles size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-purple-800 leading-relaxed">{rec.teacherNotes}</p>
                            </div>
                          )}
                        </div>
                        <button onClick={() => setExpandedRec(isOpen ? null : rec._id)}
                          className="flex-shrink-0 p-1 text-text-main hover:text-primary transition-colors">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      {/* Expanded: strategy description */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100">
                            <div className="px-6 py-5 bg-gray-50">
                              <p className="text-sm font-semibold text-text-dark mb-2">About this strategy</p>
                              <p className="text-sm text-text-main leading-relaxed">{strategy.description || 'No description provided.'}</p>
                              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text-main">
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="font-bold text-text-dark mb-0.5">Best For</p>
                                  <p>{strategy.targetLearningStyles?.join(', ')} learners</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="font-bold text-text-dark mb-0.5">Subjects</p>
                                  <p>{strategy.subjectTags?.join(', ') || 'All subjects'}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
