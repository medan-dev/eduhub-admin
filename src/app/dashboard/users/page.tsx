'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [viewing, setViewing] = useState<Profile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', school: '', district: '', school_type: '', stream: '', role: 'student',
    grade: '', gpa: 0, total_score: 0, papers_completed: 0, videos_watched: 0, hours_studied: 0, study_streak: 0
  });

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.stream || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm({ 
      full_name: '', email: '', phone: '', school: '', district: '', school_type: '', stream: '', role: 'student',
      grade: '', gpa: 0, total_score: 0, papers_completed: 0, videos_watched: 0, hours_studied: 0, study_streak: 0
    });
    setShowModal(true);
  }

  function openEdit(user: Profile) {
    setEditing(user);
    setForm({ 
      full_name: user.full_name || '', 
      email: user.email || '', 
      phone: user.phone || '', 
      school: user.school || '', 
      district: user.district || '',
      school_type: user.school_type || '',
      stream: user.stream || '', 
      role: user.role || 'student',
      grade: user.grade || '',
      gpa: user.gpa || 0,
      total_score: user.total_score || 0,
      papers_completed: user.papers_completed || 0,
      videos_watched: user.videos_watched || 0,
      hours_studied: user.hours_studied || 0,
      study_streak: user.study_streak || 0
    });
    setShowModal(true);
  }

  function openView(user: Profile) {
    setViewing(user);
    setShowViewModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('profiles').update(form).eq('id', editing.id);
      if (error) { showToast('Error updating user', 'error'); return; }
      showToast('User updated successfully!', 'success');
    } else {
      const newId = crypto.randomUUID();
      const { error } = await supabase.from('profiles').insert([{ ...form, id: newId }]);
      if (error) { showToast('Error creating user (Ensure RLS policy allows this)', 'error'); return; }
      showToast('User created successfully!', 'success');
    }
    setShowModal(false);
    fetchUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) { showToast('Error deleting user', 'error'); return; }
    showToast('User deleted successfully!', 'success');
    fetchUsers();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const roleColor: Record<string, string> = { admin: 'badge-pink', student: 'badge-green', teacher: 'badge-blue' };

  return (
    <>
      <header className="content-header">
        <div>
          <h2>👥 Users</h2>
          <p>Manage registered students and admins</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-container">
            <input 
              type="text" 
              className="form-input search-input" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
        </div>
      </header>
      
      <div className="content-body">
        <div className="glass-card">
          <div style={{ marginBottom: '16px', display: 'flex', gap: 8, alignItems: 'center' }}>
             <span className="badge badge-purple">{filteredUsers.length} Total</span>
          </div>
          {filteredUsers.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>School</th>
                    <th>District</th>
                    <th>Stream</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.full_name || '—'}</td>
                      <td>{u.email}</td>
                      <td>{u.school || '—'}</td>
                      <td>{u.district || '—'}</td>
                      <td>{u.stream || '—'}</td>
                      <td><span className={`badge ${roleColor[u.role] || 'badge-blue'}`}>{u.role}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openView(u)} title="View">👁️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">👥</div>
              <h3>No users found</h3>
              <p>Users will appear here when they register through the app</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">School</label>
                  <input className="form-input" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input className="form-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">School Type</label>
                  <select className="form-select" value={form.school_type} onChange={(e) => setForm({ ...form, school_type: e.target.value })}>
                    <option value="">Select Type</option>
                    <option value="Government - Mixed Secondary">Government - Mixed Secondary</option>
                    <option value="Private - Mixed Secondary">Private - Mixed Secondary</option>
                    <option value="Government - Single Sex">Government - Single Sex</option>
                    <option value="Private - Single Sex">Private - Single Sex</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stream</label>
                  <select className="form-select" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
                    <option value="">Select Stream</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div className="form-group">
                  {/* Empty space for alignment */}
                </div>
              </div>

              
              {form.role === 'student' && (
                <>
                  <h4 style={{ margin: '16px 0 8px', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Academic Progress</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Level / Grade</label>
                      <select className="form-select" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                        <option value="">Select Level</option>
                        <option value="Senior One (S.1)">Senior One (S.1)</option>
                        <option value="Senior Two (S.2)">Senior Two (S.2)</option>
                        <option value="Senior Three (S.3)">Senior Three (S.3)</option>
                        <option value="Senior Four (S.4)">Senior Four (S.4)</option>
                        <option value="Senior Five (S.5)">Senior Five (S.5)</option>
                        <option value="Senior Six (S.6)">Senior Six (S.6)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">GPA</label>
                      <input type="number" step="0.1" className="form-input" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Total Score</label>
                      <input type="number" className="form-input" value={form.total_score} onChange={(e) => setForm({ ...form, total_score: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Papers Completed</label>
                      <input type="number" className="form-input" value={form.papers_completed} onChange={(e) => setForm({ ...form, papers_completed: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Videos Watched</label>
                      <input type="number" className="form-input" value={form.videos_watched} onChange={(e) => setForm({ ...form, videos_watched: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hours Studied</label>
                      <input type="number" className="form-input" value={form.hours_studied} onChange={(e) => setForm({ ...form, hours_studied: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Study Streak</label>
                      <input type="number" className="form-input" value={form.study_streak} onChange={(e) => setForm({ ...form, study_streak: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                </>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewing && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="view-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7c4dff, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {(viewing.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', margin: 0 }}>{viewing.full_name || 'Unknown Name'}</h2>
                  <span className={`badge ${roleColor[viewing.role] || 'badge-blue'}`} style={{ marginTop: '4px', display: 'inline-block' }}>{viewing.role}</span>
                </div>
              </div>
              
              <div className="form-grid">
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                  <p>{viewing.email || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</label>
                  <p>{viewing.phone || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>School</label>
                  <p>{viewing.school || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>District</label>
                  <p>{viewing.district || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>School Type</label>
                  <p>{viewing.school_type || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Stream</label>
                  <p>{viewing.stream || '—'}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined Date</label>
                  <p>{new Date(viewing.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{viewing.id}</p>
                </div>
              </div>
              
              {viewing.role === 'student' && (
                <>
                  <h4 style={{ margin: '8px 0', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Academic Progress</h4>
                  <div className="form-grid">
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Grade</label>
                      <p>{viewing.grade || '—'}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>GPA</label>
                      <p>{viewing.gpa || 0}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Score</label>
                      <p>{viewing.total_score || 0}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Papers Completed</label>
                      <p>{viewing.papers_completed || 0}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Videos Watched</label>
                      <p>{viewing.videos_watched || 0}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Hours Studied</label>
                      <p>{viewing.hours_studied || 0}</p>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Study Streak</label>
                      <p>{viewing.study_streak || 0} days</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.message}</div>}
    </>
  );
}
