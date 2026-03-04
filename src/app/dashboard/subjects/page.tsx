'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/lib/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({
    name: '', stream: 'Sciences', overview: '', syllabus: '[]', icon_name: 'ic_subject',
  });

  useEffect(() => { fetchSubjects(); }, []);

  async function fetchSubjects() {
    const { data, error } = await supabase.from('subjects').select('*').order('name');
    if (!error) setSubjects(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', stream: 'Sciences', overview: '', syllabus: '[]', icon_name: 'ic_subject' });
    setShowModal(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setForm({
      name: subject.name, stream: subject.stream,
      overview: subject.overview || '',
      syllabus: JSON.stringify(subject.syllabus || []),
      icon_name: subject.icon_name || 'ic_subject',
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, syllabus: JSON.parse(form.syllabus || '[]') };
    if (editing) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editing.id);
      if (error) { showToast('Error: ' + error.message, 'error'); return; }
      showToast('Subject updated!', 'success');
    } else {
      const { error } = await supabase.from('subjects').insert([payload]);
      if (error) { showToast('Error: ' + error.message, 'error'); return; }
      showToast('Subject created!', 'success');
    }
    setShowModal(false);
    fetchSubjects();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subject?')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) { showToast('Error deleting', 'error'); return; }
    showToast('Subject deleted!', 'success');
    fetchSubjects();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const streamColor: Record<string, string> = { Sciences: 'badge-blue', Arts: 'badge-orange', Technical: 'badge-green' };

  return (
    <>
      <header className="content-header">
        <div>
          <h2>📚 Subjects</h2>
          <p>Manage UNEB subject streams and syllabi</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Subject</button>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {subjects.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stream</th>
                  <th>Overview</th>
                  <th>Syllabus Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td><span className={`badge ${streamColor[s.stream] || 'badge-purple'}`}>{s.stream}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.overview}</td>
                    <td>{Array.isArray(s.syllabus) ? s.syllabus.length : 0}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">📚</div>
              <h3>No subjects</h3>
              <p>Add subjects to organize content</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stream</label>
                  <select className="form-select" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Overview</label>
                <textarea className="form-textarea" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Syllabus (JSON array of strings)</label>
                <textarea className="form-textarea" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} placeholder='["Topic 1", "Topic 2"]' />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.message}</div>}
    </>
  );
}
