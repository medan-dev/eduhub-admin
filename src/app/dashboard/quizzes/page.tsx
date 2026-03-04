'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Quiz, QuizQuestion } from '@/types';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({ title: '', subject: '', questions: '[]' });

  useEffect(() => { fetchQuizzes(); }, []);

  async function fetchQuizzes() {
    const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (!error) setQuizzes(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    const template: QuizQuestion[] = [
      { question: 'Sample question?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0 },
    ];
    setForm({ title: '', subject: '', questions: JSON.stringify(template, null, 2) });
    setShowModal(true);
  }

  function openEdit(quiz: Quiz) {
    setEditing(quiz);
    setForm({
      title: quiz.title,
      subject: quiz.subject,
      questions: JSON.stringify(quiz.questions, null, 2),
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(form.questions);
    } catch {
      showToast('Invalid JSON in questions', 'error');
      return;
    }

    const payload = { title: form.title, subject: form.subject, questions: parsedQuestions };

    if (editing) {
      const { error } = await supabase.from('quizzes').update(payload).eq('id', editing.id);
      if (error) { showToast('Error updating', 'error'); return; }
      showToast('Quiz updated!', 'success');
    } else {
      const { error } = await supabase.from('quizzes').insert([payload]);
      if (error) { showToast('Error creating', 'error'); return; }
      showToast('Quiz created!', 'success');
    }
    setShowModal(false);
    fetchQuizzes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this quiz?')) return;
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) { showToast('Error', 'error'); return; }
    showToast('Quiz deleted!', 'success');
    fetchQuizzes();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'];

  return (
    <>
      <header className="content-header">
        <div>
          <h2>❓ Quizzes</h2>
          <p>Create and manage quizzes for students</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Quiz</button>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {quizzes.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id}>
                    <td>{q.title}</td>
                    <td><span className="badge badge-purple">{q.subject}</span></td>
                    <td>{Array.isArray(q.questions) ? q.questions.length : 0} questions</td>
                    <td>{new Date(q.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">❓</div>
              <h3>No quizzes yet</h3>
              <p>Create quizzes for students to practice</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Quiz' : 'Create Quiz'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Quiz Title</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Questions (JSON format)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 250, fontFamily: 'monospace', fontSize: 13 }}
                  value={form.questions}
                  onChange={(e) => setForm({ ...form, questions: e.target.value })}
                  placeholder={`[{"question":"...","options":["A","B","C","D"],"correct":0}]`}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Each question: {`{"question":"...","options":["A","B","C","D"],"correct":0}`} (correct = 0-based index)
                </p>
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
