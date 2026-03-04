'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Video } from '@/types';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({
    title: '', channel: '', duration: '', views: '',
    published_date: '', description: '', youtube_id: '', subject: '',
  });

  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchVideos();
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('name').order('name');
    if (data) setSubjects(data.map(s => s.name));
  }

  async function fetchVideos() {
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (!error) setVideos(data || []);
    setLoading(false);
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', channel: '', duration: '', views: '', published_date: '', description: '', youtube_id: '', subject: '' });
    setShowModal(true);
  }

  function openEdit(video: Video) {
    setEditing(video);
    setForm({
      title: video.title, channel: video.channel, duration: video.duration,
      views: video.views, published_date: video.published_date,
      description: video.description, youtube_id: video.youtube_id, subject: video.subject,
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('videos').update(form).eq('id', editing.id);
      if (error) { showToast('Error updating video', 'error'); return; }
      showToast('Video updated!', 'success');
    } else {
      const { error } = await supabase.from('videos').insert([form]);
      if (error) { showToast('Error creating video', 'error'); return; }
      showToast('Video created!', 'success');
    }
    setShowModal(false);
    fetchVideos();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video?')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) { showToast('Error deleting', 'error'); return; }
    showToast('Video deleted!', 'success');
    fetchVideos();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <header className="content-header">
        <div>
          <h2>🎬 Education Videos</h2>
          <p>Manage YouTube educational videos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Video</button>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {videos.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Channel</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        className="yt-thumb"
                      />
                    </td>
                    <td>{video.title}</td>
                    <td>{video.channel}</td>
                    <td><span className="badge badge-green">{video.subject}</span></td>
                    <td>{video.duration}</td>
                    <td>{video.views}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(video)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(video.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">🎬</div>
              <h3>No videos yet</h3>
              <p>Add YouTube education videos for students</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Video' : 'Add New Video'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">YouTube Video ID</label>
                  <input className="form-input" value={form.youtube_id} onChange={(e) => setForm({ ...form, youtube_id: e.target.value })} placeholder="e.g. dQw4w9WgXcQ" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Channel</label>
                  <input className="form-input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} required />
                </div>
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
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45min" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Views</label>
                  <input className="form-input" value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} placeholder="2.5M" />
                </div>
                <div className="form-group">
                  <label className="form-label">Published Date</label>
                  <input className="form-input" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} placeholder="Jan 2024" />
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
