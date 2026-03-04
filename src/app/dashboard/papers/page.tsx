'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Paper } from '@/lib/types';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Paper | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({
    title: '', subject: '', year: '', duration: '3 hours',
    total_marks: 100, pass_mark: 40, difficulty: 3.0, pdf_url: '',
  });

  useEffect(() => { fetchPapers(); }, []);

  async function fetchPapers() {
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPapers(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', subject: '', year: '', duration: '3 hours', total_marks: 100, pass_mark: 40, difficulty: 3.0, pdf_url: '' });
    setShowModal(true);
  }

  function openEdit(paper: Paper) {
    setEditing(paper);
    setForm({
      title: paper.title, subject: paper.subject, year: paper.year,
      duration: paper.duration, total_marks: paper.total_marks,
      pass_mark: paper.pass_mark, difficulty: paper.difficulty,
      pdf_url: paper.pdf_url || '',
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('papers').update(form).eq('id', editing.id);
      if (error) { showToast('Error updating paper', 'error'); return; }
      showToast('Paper updated successfully!', 'success');
    } else {
      const { error } = await supabase.from('papers').insert([form]);
      if (error) { showToast('Error creating paper', 'error'); return; }
      showToast('Paper created successfully!', 'success');
    }
    setShowModal(false);
    fetchPapers();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    const { error } = await supabase.from('papers').delete().eq('id', id);
    if (error) { showToast('Error deleting paper', 'error'); return; }
    showToast('Paper deleted!', 'success');
    fetchPapers();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'];

  return (
    <>
      <header className="content-header">
        <div>
          <h2>📄 Past Papers</h2>
          <p>Manage UNEB past papers for students</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Paper</button>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {papers.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Year</th>
                  <th>Duration</th>
                  <th>Marks</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => (
                  <tr key={paper.id}>
                    <td>{paper.title}</td>
                    <td><span className="badge badge-purple">{paper.subject}</span></td>
                    <td>{paper.year}</td>
                    <td>{paper.duration}</td>
                    <td>{paper.total_marks}</td>
                    <td>
                      <span className="difficulty-stars">
                        {'★'.repeat(Math.round(paper.difficulty))}
                        {'☆'.repeat(5 - Math.round(paper.difficulty))}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(paper)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(paper.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">📄</div>
              <h3>No papers yet</h3>
              <p>Click &quot;Add Paper&quot; to create your first past paper</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Paper' : 'Add New Paper'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. UCE Mathematics 2023" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2023" required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 hours" />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty (1-5)</label>
                  <input className="form-input" type="number" min="1" max="5" step="0.1" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input className="form-input" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pass Mark</label>
                  <input className="form-input" type="number" value={form.pass_mark} onChange={(e) => setForm({ ...form, pass_mark: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PDF URL (optional)</label>
                <input className="form-input" value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </>
  );
}
