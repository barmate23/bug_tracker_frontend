import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL, api } from '../api/client.js';
import { PriorityChip, StatusChip } from '../components/Chips.jsx';
import Navbar from '../components/Navbar.jsx';
import VoiceInput from '../components/VoiceInput.jsx';

export default function BugDetailPage() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    const [bugRes, usersRes, commentsRes, attachmentRes] = await Promise.all([
      api.get(`/bugs/${id}`),
      api.get('/users'),
      api.get(`/bugs/${id}/comments`),
      api.get(`/bugs/${id}/attachments`)
    ]);
    setBug(bugRes.data);
    setDraft({
      title: bugRes.data.title,
      description: bugRes.data.description,
      status: bugRes.data.status,
      priority: bugRes.data.priority,
      assignedTo: bugRes.data.assignedTo?.userId || ''
    });
    setUsers(usersRes.data);
    setComments(commentsRes.data);
    setAttachments(attachmentRes.data);
  }

  useEffect(() => { load(); }, [id]);

  async function save() {
    await api.put(`/bugs/${id}`, { ...draft, assignedTo: draft.assignedTo ? Number(draft.assignedTo) : null });
    load();
  }

  async function addComment(event) {
    event.preventDefault();
    if (!message.trim()) return;
    await api.post(`/bugs/${id}/comments`, { message });
    setMessage('');
    load();
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files || []);
    await Promise.all(files.map((file) => {
      const data = new FormData();
      data.append('file', file);
      return api.post(`/bugs/${id}/attachments`, data);
    }));
    event.target.value = '';
    load();
  }

  if (!bug || !draft) return <><Navbar /><div className="screen-center">Loading bug...</div></>;

  return (
    <>
      <Navbar />
      <main className="page">
        <p className="breadcrumb"><Link to="/projects">Projects</Link> / <Link to={`/projects/${bug.projectId}/bugs`}>{bug.projectName}</Link> / #{bug.id}</p>
        <div className="detail-layout">
          <section className="detail-main">
            <input className="title-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <label>Description<VoiceInput value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} rows={8} /></label>
            <div className="form-grid three">
              <label>Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option>OPEN</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>CLOSED</option></select></label>
              <label>Priority<select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label>
              <label>Assigned to<select value={draft.assignedTo} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })}><option value="">Unassigned</option>{users.map((u) => <option key={u.userId} value={u.userId}>{u.fullName}</option>)}</select></label>
            </div>
            <button className="primary-button" onClick={save}><Save size={16} /> Save Changes</button>
          </section>
          <aside className="sidebar">
            <h2>Bug #{bug.id}</h2>
            <div className="meta-row"><span>Status</span><StatusChip value={bug.status} /></div>
            <div className="meta-row"><span>Priority</span><PriorityChip value={bug.priority} /></div>
            <div className="meta-row"><span>Reporter</span><strong>{bug.createdBy.fullName}</strong></div>
            <div className="meta-row"><span>Created</span><strong>{new Date(bug.createdAt).toLocaleString()}</strong></div>
            <div className="meta-row"><span>Updated</span><strong>{new Date(bug.updatedAt).toLocaleString()}</strong></div>
            <Link className="table-link" to={`/projects/${bug.projectId}/bugs`}>{bug.projectName}</Link>
          </aside>
        </div>
        <section className="comments">
          <div className="section-title-row">
            <h2>Images</h2>
            <label className="file-action">Upload images<input type="file" accept="image/*" multiple onChange={uploadImages} /></label>
          </div>
          {attachments.length > 0 ? (
            <div className="attachment-grid">
              {attachments.map((attachment) => (
                <a className="attachment-tile" key={attachment.id} href={`${API_BASE_URL}${attachment.url}`} target="_blank" rel="noreferrer">
                  <img src={`${API_BASE_URL}${attachment.url}`} alt={attachment.fileName} />
                  <span>{attachment.fileName}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-inline">No images uploaded for this bug.</div>
          )}
        </section>
        <section className="comments">
          <h2>Developer / Tester Chat</h2>
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <span className="avatar">{comment.user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
              <div><strong>{comment.user.fullName}</strong><time>{new Date(comment.createdAt).toLocaleString()}</time><p>{comment.message}</p></div>
            </article>
          ))}
          <form className="comment-form" onSubmit={addComment}>
            <textarea rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a comment..." />
            <button className="primary-button">Submit</button>
          </form>
        </section>
      </main>
    </>
  );
}
