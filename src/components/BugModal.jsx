import { X } from 'lucide-react';
import { useState } from 'react';
import VoiceInput from './VoiceInput.jsx';

export default function BugModal({ users, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', assignedTo: '' });
  const [images, setImages] = useState([]);
  const canSubmit = form.title.trim() && form.description.trim();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="overlay">
      <form className="drawer" onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit({ bug: { ...form, assignedTo: form.assignedTo ? Number(form.assignedTo) : null }, images }); }}>
        <div className="drawer-head">
          <div>
            <h2>Report Bug</h2>
            <p>Create a concise issue for the selected project.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <label>Title<input value={form.title} onChange={(e) => update('title', e.target.value)} autoFocus /></label>
        <label>Description<VoiceInput value={form.description} onChange={(value) => update('description', value)} /></label>
        <label>Images
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
        </label>
        {images.length > 0 && (
          <div className="upload-list">
            {images.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
          </div>
        )}
        <div className="form-grid">
          <label>Priority<select value={form.priority} onChange={(e) => update('priority', e.target.value)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label>
          <label>Assign To<select value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)}><option value="">Unassigned</option>{users.map((u) => <option key={u.userId} value={u.userId}>{u.fullName}</option>)}</select></label>
        </div>
        <button className="primary-button" disabled={!canSubmit}>Submit Bug</button>
      </form>
    </div>
  );
}
