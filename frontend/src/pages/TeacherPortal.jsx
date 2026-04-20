import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStudents } from '../features/studentsSlice';
import { generateRecommendations } from '../features/recommendationsSlice';
import * as studentsApi from '../api/studentsApi';
import {
  Users, Plus, Search, BookOpen, ClipboardList, BarChart2,
  Loader2, Pencil, Trash2, X, CheckCircle, AlertTriangle,
  ChevronDown, Sparkles, UserRound, Calendar
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
const EXAM_TYPES = ['Unit Test', 'Mid Term', 'Final', 'Assignment', 'Quiz'];
const LEARNING_STYLES = ['Visual', 'Auditory', 'Kinesthetic', 'Reading-Writing'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const pct = (marks, max) => Math.round((marks / max) * 100);
const gradeLabel = (p) => p >= 85 ? { label: 'A', color: 'text-green-600 bg-green-50' } :
  p >= 70 ? { label: 'B', color: 'text-blue-600 bg-blue-50' } :
  p >= 55 ? { label: 'C', color: 'text-amber-600 bg-amber-50' } :
  p >= 40 ? { label: 'D', color: 'text-orange-600 bg-orange-50' } :
                             { label: 'F', color: 'text-red-600 bg-red-50' };

const emptyForm = () => ({
  name: '', grade: '10th', rollNumber: '', learningStyle: 'Visual',
  studentEmail: '',
  totalClasses: '', attendedClasses: '', notes: '',
  subjectMarks: [{ subject: 'Mathematics', marks: '', maxMarks: 100, examType: 'Unit Test' }]
});

// ── sub-components ────────────────────────────────────────────────────────────
const PerformanceBar = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full transition-all ${value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

export default function TeacherPortal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: students, loading, pagination } = useSelector(s => s.students);
  const { generating } = useSelector(s => s.recommendations);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);   // student being edited
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [tab, setTab] = useState('students');              // 'students' | 'marks'

  // Fetch all students on load / search change
  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchStudents({ search })), 300);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  // Open modal for new student
  const openNew = () => {
    setEditStudent(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  // Open modal to edit existing
  const openEdit = (student) => {
    setEditStudent(student);
    setForm({
      name: student.name,
      grade: student.grade || '10th',
      rollNumber: student.rollNumber || '',
      learningStyle: student.learningStyle,
      studentEmail: '',           // cannot retrieve plain email from userId — leave blank for edits
      totalClasses: student.totalClasses ?? '',
      attendedClasses: student.attendedClasses ?? '',
      notes: student.notes || '',
      subjectMarks: student.subjectMarks?.length
        ? student.subjectMarks.map(m => ({ ...m }))
        : [{ subject: 'Mathematics', marks: '', maxMarks: 100, examType: 'Unit Test' }]
    });
    setFormError('');
    setShowModal(true);
  };

  // Add a blank subject row
  const addSubject = () =>
    setForm(f => ({ ...f, subjectMarks: [...f.subjectMarks, { subject: '', marks: '', maxMarks: 100, examType: 'Unit Test' }] }));

  // Remove subject row
  const removeSubject = (i) =>
    setForm(f => ({ ...f, subjectMarks: f.subjectMarks.filter((_, idx) => idx !== i) }));

  // Update subject row field
  const updateSubject = (i, field, val) =>
    setForm(f => {
      const updated = [...f.subjectMarks];
      updated[i] = { ...updated[i], [field]: val };
      return { ...f, subjectMarks: updated };
    });

  // Submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate marks
    for (const sm of form.subjectMarks) {
      if (!sm.subject) { setFormError('Please select a subject for every row.'); return; }
      if (sm.marks === '' || sm.marks === null) { setFormError('Please enter marks for every subject.'); return; }
      if (Number(sm.marks) > Number(sm.maxMarks)) { setFormError(`Marks for ${sm.subject} cannot exceed max marks.`); return; }
    }

    const payload = {
      ...form,
      totalClasses: Number(form.totalClasses) || 0,
      attendedClasses: Number(form.attendedClasses) || 0,
      subjectMarks: form.subjectMarks.map(m => ({ ...m, marks: Number(m.marks), maxMarks: Number(m.maxMarks) }))
    };

    setSubmitting(true);
    try {
      if (editStudent) {
        await studentsApi.updateStudent(editStudent._id, payload);
      } else {
        await studentsApi.createStudent(payload);
      }
      // Always refetch from DB so Redux list is up-to-date after save
      await dispatch(fetchStudents({ search }));
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student and all their recommendations?')) return;
    setDeletingId(id);
    await studentsApi.deleteStudent(id);
    dispatch(fetchStudents({ search }));
    setDeletingId(null);
  };

  const [recError, setRecError] = useState('');

  // Generate recommendations and navigate to profile
  const handleGenerate = async (student) => {
    setRecError('');
    setGeneratingId(student._id);
    const result = await dispatch(generateRecommendations(student._id));
    setGeneratingId(null);

    if (generateRecommendations.fulfilled.match(result)) {
      setSuccessId(student._id);
      setTimeout(() => setSuccessId(null), 2000);
      navigate(`/students/${student._id}`);
    } else {
      setRecError(result.payload || 'Failed to generate recommendations. Check the Strategy Bank has approved strategies.');
    }
  };

  // ── aggregate stats for marks tab ─────────────────────────────────────────
  const allMarks = students.flatMap(s => s.subjectMarks || []);
  const subjectAvg = SUBJECTS.reduce((acc, subj) => {
    const rows = allMarks.filter(m => m.subject === subj);
    if (!rows.length) return acc;
    acc[subj] = Math.round(rows.reduce((s, m) => s + pct(m.marks, m.maxMarks), 0) / rows.length);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Teacher Portal</h1>
          <p className="text-text-main">Add students, record marks & attendance, generate AI strategy recommendations.</p>
        </div>
        <button onClick={openNew} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-sm transition-colors">
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: pagination.total || students.length, icon: Users, color: 'bg-blue-50 text-primary' },
          { label: 'Avg Performance', value: students.length ? `${Math.round(students.reduce((a, s) => a + (s.performanceScore || 0), 0) / students.length)}%` : '—', icon: BarChart2, color: 'bg-teal-50 text-accent' },
          { label: 'At-Risk Students', value: students.filter(s => s.performanceScore < 50).length, icon: AlertTriangle, color: 'bg-red-50 text-red-500' },
          { label: 'Subjects Tracked', value: Object.keys(subjectAvg).length, icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.color}`}><card.icon size={22} /></div>
            <div>
              <p className="text-xs text-text-main font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-text-dark">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: 'students', label: 'Student Roster', icon: Users }, { key: 'marks', label: 'Class Marks Overview', icon: BarChart2 }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-text-dark' : 'text-text-main hover:text-text-dark'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── STUDENT ROSTER TAB ── */}
      {tab === 'students' && (
        <div className="space-y-4">
          {recError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle size={18} className="flex-shrink-0 text-red-500" />
              <span>{recError}</span>
              <button onClick={() => setRecError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={36} /></div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <UserRound className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-text-dark font-semibold">No students yet</p>
              <p className="text-text-main text-sm mt-1">Click "Add Student" to create your first student profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {students.map((student, idx) => {
                const attend = student.attendancePercent;
                const perf = student.performanceScore || 0;
                const isGenerating = generatingId === student._id;
                const isSuccess = successId === student._id;

                return (
                  <motion.div key={student._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                    {/* Card header */}
                    <div className="p-5 border-b border-gray-50 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-text-dark">{student.name}</p>
                          <p className="text-xs text-text-main">{student.grade} Grade {student.rollNumber && `· Roll #${student.rollNumber}`}</p>
                          {student.userId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-0.5">
                              ✓ Portal Linked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                              ⚠ No Portal Account
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg hover:bg-blue-50 text-text-main hover:text-primary transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(student._id)} disabled={deletingId === student._id} className="p-1.5 rounded-lg hover:bg-red-50 text-text-main hover:text-red-500 transition-colors">
                          {deletingId === student._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="px-5 pt-4 pb-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-main font-medium">Overall Performance</span>
                          <span className={`font-bold ${perf >= 70 ? 'text-green-600' : perf >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{perf}%</span>
                        </div>
                        <PerformanceBar value={perf} />
                      </div>

                      {attend !== null && attend !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-main font-medium">Attendance</span>
                            <span className={`font-bold ${attend >= 75 ? 'text-green-600' : attend >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{attend}%</span>
                          </div>
                          <PerformanceBar value={attend} />
                        </div>
                      )}

                      {/* Subject marks pills */}
                      {student.subjectMarks?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {student.subjectMarks.map((m, i) => {
                            const p = pct(m.marks, m.maxMarks);
                            const g = gradeLabel(p);
                            return (
                              <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.color}`}>
                                {m.subject.split(' ')[0]}: {g.label} ({m.marks}/{m.maxMarks})
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="bg-blue-50 text-primary px-2 py-0.5 rounded font-medium">{student.learningStyle}</span>
                        {student.subjectWeaknesses?.length > 0 && (
                          <span className="text-red-400 font-medium">⚠ {student.subjectWeaknesses.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-5 pb-4 flex gap-2">
                      <button
                        onClick={() => handleGenerate(student)}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-70"
                      >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> :
                          isSuccess ? <CheckCircle size={14} /> : <Sparkles size={14} />}
                        {isGenerating ? 'Generating…' : 'AI Recommend'}
                      </button>
                      <button onClick={() => navigate(`/students/${student._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-text-dark text-xs font-semibold py-2.5 rounded-xl transition-colors">
                        <BookOpen size={14} /> View Profile
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CLASS MARKS OVERVIEW TAB ── */}
      {tab === 'marks' && (
        <div className="space-y-4">
          {Object.keys(subjectAvg).length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-text-dark font-semibold">No marks recorded yet</p>
              <p className="text-text-main text-sm mt-1">Add students with subject marks to see class-wide analytics here.</p>
            </div>
          ) : (
            <>
              {/* Class-wide subject averages */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-text-dark mb-5 text-lg">Class Subject Averages</h2>
                <div className="space-y-4">
                  {Object.entries(subjectAvg).map(([subj, avg]) => {
                    const g = gradeLabel(avg);
                    return (
                      <div key={subj}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-text-dark">{subj}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.color}`}>{g.label}</span>
                            <span className="font-semibold text-text-dark">{avg}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }}
                            className={`h-2.5 rounded-full ${avg >= 70 ? 'bg-green-500' : avg >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-student marks table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-text-dark text-lg">Individual Student Marks</h2>
                  <p className="text-sm text-text-main mt-0.5">Click a student card to edit their marks.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-bold uppercase text-text-main">Student</th>
                        <th className="text-center px-3 py-3 text-xs font-bold uppercase text-text-main">Attend %</th>
                        <th className="text-center px-3 py-3 text-xs font-bold uppercase text-text-main">Avg Score</th>
                        {SUBJECTS.filter(s => Object.keys(subjectAvg).includes(s)).map(s => (
                          <th key={s} className="text-center px-3 py-3 text-xs font-bold uppercase text-text-main">{s.split(' ')[0]}</th>
                        ))}
                        <th className="text-center px-3 py-3 text-xs font-bold uppercase text-text-main">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map(student => {
                        const marksMap = {};
                        student.subjectMarks?.forEach(m => { marksMap[m.subject] = m; });
                        return (
                          <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-semibold text-text-dark">{student.name}</td>
                            <td className="px-3 py-3 text-center">
                              {student.attendancePercent !== null && student.attendancePercent !== undefined ? (
                                <span className={`font-semibold ${student.attendancePercent >= 75 ? 'text-green-600' : 'text-red-500'}`}>{student.attendancePercent}%</span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`font-bold ${student.performanceScore >= 70 ? 'text-green-600' : student.performanceScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {student.performanceScore || 0}%
                              </span>
                            </td>
                            {SUBJECTS.filter(s => Object.keys(subjectAvg).includes(s)).map(subj => {
                              const m = marksMap[subj];
                              if (!m) return <td key={subj} className="px-3 py-3 text-center text-gray-200 text-xs">—</td>;
                              const p = pct(m.marks, m.maxMarks);
                              const g = gradeLabel(p);
                              return (
                                <td key={subj} className="px-3 py-3 text-center">
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${g.color}`}>{m.marks}/{m.maxMarks}</span>
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 text-center">
                              <button onClick={() => openEdit(student)} className="text-primary text-xs hover:underline font-medium">Edit</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ADD / EDIT STUDENT MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex justify-between items-center z-10 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-text-dark">{editStudent ? 'Edit Student' : 'Add New Student'}</h2>
                  <p className="text-sm text-text-main mt-0.5">Fill in marks and attendance — the AI engine uses these to recommend strategies.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-text-main" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-7 py-6 space-y-7">
                {formError && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{formError}</div>
                )}

                {/* ── SECTION 1: Basic Info ── */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Full Name</label>
                      <input required type="text" placeholder="e.g. Alice Johnson"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="input" />
                    </div>
                    <div>
                      <label className="label">Grade</label>
                      <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input">
                        {GRADES.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Roll Number</label>
                      <input type="text" placeholder="Optional" value={form.rollNumber}
                        onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} className="input" />
                    </div>

                    {/* ── Student Login Account Link ── */}
                    {!editStudent && (
                      <div className="col-span-2">
                        <label className="label">
                          Student Login Email
                          <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Links Portal Access</span>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. alice@school.edu (created by Admin)"
                          value={form.studentEmail}
                          onChange={e => setForm(f => ({ ...f, studentEmail: e.target.value }))}
                          className="input"
                        />
                        <p className="text-[11px] text-text-main mt-1.5 flex items-center gap-1">
                          <span className="text-amber-500">ℹ</span>
                          Enter the Student account email created by the Admin. Once linked, the student can log in and view their marks &amp; strategies.
                        </p>
                      </div>
                    )}

                    {/* Edit mode: show link status */}
                    {editStudent && editStudent.userId && (
                      <div className="col-span-2">
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <span className="text-green-500 text-sm">✓</span>
                          <p className="text-green-700 text-xs font-medium">Student portal account is linked. Student can log in to view their data.</p>
                        </div>
                      </div>
                    )}
                    {editStudent && !editStudent.userId && (
                      <div className="col-span-2">
                        <label className="label">
                          Link Student Login Email
                          <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Not Linked Yet</span>
                        </label>
                        <input
                          type="email"
                          placeholder="Enter student's login email to link their portal"
                          value={form.studentEmail}
                          onChange={e => setForm(f => ({ ...f, studentEmail: e.target.value }))}
                          className="input"
                        />
                        <p className="text-[11px] text-text-main mt-1.5 flex items-center gap-1">
                          <span className="text-amber-500">ℹ</span>
                          Student cannot see their portal until linked. Ask Admin to create their account first.
                        </p>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="label">Learning Style</label>
                      <div className="grid grid-cols-4 gap-2">
                        {LEARNING_STYLES.map(style => (
                          <button key={style} type="button" onClick={() => setForm(f => ({ ...f, learningStyle: style }))}
                            className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${form.learningStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-text-main hover:border-gray-300'}`}>
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── SECTION 2: Attendance ── */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <Calendar size={14} /> Attendance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Total Classes Held</label>
                      <input type="number" min="0" placeholder="e.g. 120"
                        value={form.totalClasses} onChange={e => setForm(f => ({ ...f, totalClasses: e.target.value }))}
                        className="input" />
                    </div>
                    <div>
                      <label className="label">Classes Attended</label>
                      <input type="number" min="0" placeholder="e.g. 95"
                        value={form.attendedClasses} onChange={e => setForm(f => ({ ...f, attendedClasses: e.target.value }))}
                        className="input" />
                    </div>
                  </div>
                  {form.totalClasses > 0 && form.attendedClasses !== '' && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-main">Attendance</span>
                          <span className="font-bold">{Math.round((form.attendedClasses / form.totalClasses) * 100)}%</span>
                        </div>
                        <PerformanceBar value={Math.round((form.attendedClasses / form.totalClasses) * 100)} />
                      </div>
                    </div>
                  )}
                </section>

                {/* ── SECTION 3: Subject Marks ── */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <ClipboardList size={14} /> Subject Marks
                    </h3>
                    <button type="button" onClick={addSubject}
                      className="text-primary text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Subject
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.subjectMarks.map((mark, i) => {
                      const percent = mark.marks !== '' ? pct(Number(mark.marks), Number(mark.maxMarks)) : null;
                      const g = percent !== null ? gradeLabel(percent) : null;
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-4">
                              <label className="label">Subject</label>
                              <select value={mark.subject} onChange={e => updateSubject(i, 'subject', e.target.value)} className="input text-xs">
                                <option value="">Select…</option>
                                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="label">Marks</label>
                              <input type="number" min="0" max={mark.maxMarks} placeholder="0"
                                value={mark.marks} onChange={e => updateSubject(i, 'marks', e.target.value)}
                                className="input text-xs" />
                            </div>
                            <div className="col-span-2">
                              <label className="label">Max</label>
                              <input type="number" min="1" placeholder="100"
                                value={mark.maxMarks} onChange={e => updateSubject(i, 'maxMarks', e.target.value)}
                                className="input text-xs" />
                            </div>
                            <div className="col-span-3">
                              <label className="label">Exam Type</label>
                              <select value={mark.examType} onChange={e => updateSubject(i, 'examType', e.target.value)} className="input text-xs">
                                {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="col-span-1 flex flex-col items-center pt-5">
                              {g && <span className={`text-xs font-bold px-1.5 py-0.5 rounded mb-1 ${g.color}`}>{g.label}</span>}
                              {form.subjectMarks.length > 1 && (
                                <button type="button" onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-600 p-0.5">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          {percent !== null && (
                            <div className="mt-2">
                              <PerformanceBar value={percent} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ── SECTION 4: Notes ── */}
                <section>
                  <label className="label">Teacher Notes (optional)</label>
                  <textarea rows={3} placeholder="Any observations, learning challenges, or special notes…"
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="input resize-none" />
                </section>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-text-main font-medium text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {submitting ? 'Saving…' : editStudent ? 'Update Student' : 'Save & Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
