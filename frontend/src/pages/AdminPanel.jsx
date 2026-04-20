import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, deleteUser, updateUser } from '../features/usersSlice';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import { 
  Users, UserPlus, Trash2, Loader2, ShieldCheck, 
  GraduationCap, BookUser, Eye, EyeOff, X, Search, RefreshCw, Edit2
} from 'lucide-react';

const ROLE_CONFIG = {
  'Super Admin': { color: 'bg-purple-100 text-purple-700', icon: ShieldCheck },
  'Teacher':     { color: 'bg-blue-100 text-blue-700',   icon: BookUser },
  'Student':     { color: 'bg-green-100 text-green-700', icon: GraduationCap },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { color: 'bg-gray-100 text-gray-700', icon: Users };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon size={12} />
      {role}
    </span>
  );
};

export default function AdminPanel() {
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector(state => state.users);
  const { user: me } = useSelector(state => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [formError, setFormError] = useState('');
  const [liveStats, setLiveStats] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Teacher' });

  const loadData = () => {
    dispatch(fetchUsers());
    api.get('/stats').then(r => setLiveStats(r.data.data)).catch(() => {});
  };

  useEffect(() => { loadData(); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editingId && form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    
    let result;
    if (editingId) {
      result = await dispatch(updateUser({ id: editingId, userData: form }));
    } else {
      result = await dispatch(createUser(form));
    }
    
    setSubmitting(false);
    if ((editingId && updateUser.fulfilled.match(result)) || (!editingId && createUser.fulfilled.match(result))) {
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'Teacher' });
      setEditingId(null);
      loadData(); // refresh stats
    } else {
      setFormError(result.payload || `Failed to ${editingId ? 'update' : 'create'} user.`);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'Teacher' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    await dispatch(deleteUser(id));
    setDeletingId(null);
    loadData(); // refresh stats
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Super Admin').length,
    teachers: users.filter(u => u.role === 'Teacher').length,
    students: users.filter(u => u.role === 'Student').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Admin Panel</h1>
          <p className="text-text-main">Manage all users — Teachers, Students, and Admins.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData}
            className="border border-gray-200 text-text-main px-4 py-2.5 rounded-xl flex items-center space-x-2 text-sm hover:bg-gray-50 transition-colors font-medium">
            <RefreshCw size={15} /> <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm font-medium"
          >
            <UserPlus size={18} />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Stat Cards — live from /api/stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: liveStats?.totalUsers           ?? users.length, icon: Users,        color: 'bg-slate-100 text-slate-700' },
          { label: 'Super Admins',   value: liveStats?.totalAdmins          ?? stats.admins,  icon: ShieldCheck,  color: 'bg-purple-100 text-purple-700' },
          { label: 'Teachers',       value: liveStats?.totalTeachers        ?? stats.teachers,icon: BookUser,     color: 'bg-blue-100 text-blue-700' },
          { label: 'Students',       value: liveStats?.totalStudentAccounts ?? stats.students,icon: GraduationCap,color: 'bg-green-100 text-green-700' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-text-main text-xs font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-text-dark">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Super Admin', 'Teacher', 'Student'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterRole === role
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-main hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-main">User</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-main">Role</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-main hidden md:table-cell">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-main">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-16"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-text-main">No users found.</td></tr>
              ) : (
                filtered.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-dark flex items-center gap-2">
                            {user.name}
                            {user._id === me?._id && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">YOU</span>
                            )}
                          </p>
                          <p className="text-text-main text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 hidden md:table-cell text-text-main">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      {user._id === me?._id ? (
                        <span className="text-xs text-gray-400 italic px-3 py-1.5">Cannot delete self</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingId === user._id}
                          className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === user._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Delete
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text-dark">
                    {editingId ? 'Edit User' : 'Create New User'}
                  </h2>
                  <p className="text-sm text-text-main mt-0.5">
                    {editingId ? 'Update user details and access.' : 'Add a Teacher, Student, or Admin account.'}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} className="text-text-main" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 mb-5">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="user@school.edu"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      required={!editingId}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={editingId ? 'Leave blank to keep current password' : 'Min. 6 characters'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5">Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Teacher', 'Student', 'Super Admin'].map(role => {
                      const cfg = ROLE_CONFIG[role];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setForm({ ...form, role })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                            form.role === role
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 text-text-main hover:border-gray-300'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-xs">{role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-text-main font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? <Edit2 size={18} /> : <UserPlus size={18} />)}
                    {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update User' : 'Create User')}
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
