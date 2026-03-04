'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tutorial } from '@/types';

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({
    title: '', instructor: '', difficulty: 'Beginner', lessons_count: 0,
    duration: '', description: '', enrolled_count: 0, subject: '',
  });

  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchTutorials();
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('name').order('name');
    if (data) setSubjects(data.map(s => s.name));
  }

  async function fetchTutorials() {
    const { data, error } = await supabase.from('tutorials').select('*').order('created_at', { ascending: false });
    if (!error) setTutorials(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', instructor: '', difficulty: 'Beginner', lessons_count: 0, duration: '', description: '', enrolled_count: 0, subject: '' });
    setShowModal(true);
  }

  function openEdit(tutorial: Tutorial) {
    setEditing(tutorial);
    setForm({
      title: tutorial.title, instructor: tutorial.instructor, difficulty: tutorial.difficulty,
      lessons_count: tutorial.lessons_count, duration: tutorial.duration,
      description: tutorial.description, enrolled_count: tutorial.enrolled_count, subject: tutorial.subject,
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('tutorials').update(form).eq('id', editing.id);
      if (error) { showToast('Error updating', 'error'); return; }
      showToast('Tutorial updated!', 'success');
    } else {
      const { error } = await supabase.from('tutorials').insert([form]);
      if (error) { showToast('Error creating', 'error'); return; }
      showToast('Tutorial created!', 'success');
    }
    setShowModal(false);
    fetchTutorials();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tutorial?')) return;
    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) { showToast('Error deleting', 'error'); return; }
    showToast('Tutorial deleted!', 'success');
    fetchTutorials();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const difficultyColor: Record<string, string> = { Beginner: 'badge-green', Intermediate: 'badge-orange', Advanced: 'badge-pink' };

  return (
    <>
      <header className="content-header">
        <div>
          <h2>🎓 Tutorials</h2>
          <p>Manage tutorial courses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Tutorial</button>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {tutorials.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Lessons</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tutorials.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.instructor}</td>
                    <td><span className="badge badge-purple">{t.subject}</span></td>
                    <td><span className={`badge ${difficultyColor[t.difficulty] || 'badge-blue'}`}>{t.difficulty}</span></td>
                    <td>{t.lessons_count}</td>
                    <td>{t.enrolled_count}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">🎓</div>
              <h3>No tutorials yet</h3>
              <p>Create courses for students</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Tutorial' : 'Add Tutorial'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Instructor</label>
                  <input className="form-input" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="8 hours" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Lessons Count</label>
                  <input className="form-input" type="number" value={form.lessons_count} onChange={(e) => setForm({ ...form, lessons_count: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Enrolled Count</label>
                  <input className="form-input" type="number" value={form.enrolled_count} onChange={(e) => setForm({ ...form, enrolled_count: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
