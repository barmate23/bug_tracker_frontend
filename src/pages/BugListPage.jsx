import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BugModal from '../components/BugModal.jsx';
import { PriorityChip, BugTypeChip } from '../components/Chips.jsx';
import Navbar from '../components/Navbar.jsx';

const STATUS_OPTIONS = [
  ['OPEN', 'Open'],
  ['IN_PROGRESS', 'In Progress'],
  ['HOLD', 'Hold'],
  ['RESOLVED', 'Resolved'],
  ['CLOSED', 'Closed']
];

export default function BugListPage() {
  const { id } = useParams();
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', bugType: '', assignee: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const project = useMemo(() => projects.find((item) => String(item.id) === id), [projects, id]);

  async function load() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const [bugsRes, usersRes, projectsRes] = await Promise.all([
      api.get(`/projects/${id}/bugs`, { params }),
      api.get('/users'),
      api.get('/projects')
    ]);
    setBugs(bugsRes.data);
    setUsers(usersRes.data);
    setProjects(projectsRes.data);
  }

  useEffect(() => { load(); }, [id, filters.status, filters.priority, filters.bugType, filters.assignee]);

  async function createBug(payload) {
    const res = await api.post(`/projects/${id}/bugs`, payload.bug);
    await Promise.all(payload.images.map((file) => {
      const data = new FormData();
      data.append('file', file);
      return api.post(`/bugs/${res.data.id}/attachments`, data);
    }));
    setModalOpen(false);
    await load();
  }

  async function updateStatus(bug, status) {
    setBugs((current) => current.map((item) => item.id === bug.id ? { ...item, status } : item));
    try {
      await api.put(`/bugs/${bug.id}`, {
        title: bug.title,
        description: bug.description,
        status,
        priority: bug.priority,
        assignedTo: bug.assignedTo?.userId || null
      });
    } catch (error) {
      setBugs((current) => current.map((item) => item.id === bug.id ? bug : item));
      alert(error.message);
    }
  }

  async function deleteBug(bug) {
    if (!window.confirm(`Delete bug #${bug.id} "${bug.title}"?`)) return;
    const previous = bugs;
    setBugs((current) => current.filter((item) => item.id !== bug.id));
    try {
      await api.delete(`/bugs/${bug.id}`);
    } catch (error) {
      setBugs(previous);
      alert(error.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="page-head">
          <div>
            <p className="breadcrumb"><Link to="/projects">Projects</Link> / {project?.name || 'Project'}</p>
            <h1>{project?.name || 'Project'} bugs</h1>
          </div>
          <button className="primary-button" onClick={() => setModalOpen(true)}><Plus size={15} /> Report Bug</button>
        </section>
        <div className="filter-bar">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select>
          <select value={filters.bugType} onChange={(e) => setFilters({ ...filters, bugType: e.target.value })}><option value="">All types</option><option value="FRONTEND">Frontend</option><option value="BACKEND">Backend</option></select>
          <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}><option value="">All assignees</option>{users.map((u) => <option key={u.userId} value={u.userId}>{u.fullName}</option>)}</select>
        </div>
        <div className="table-card">
          <table>
            <thead><tr><th>#ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Status</th><th>Assigned to</th><th>Created at</th><th>Actions</th></tr></thead>
            <tbody>
              {bugs.map((bug) => (
                <tr key={bug.id}>
                  <td>#{bug.id}</td>
                  <td className="title-cell">{bug.title}</td>
                  <td><BugTypeChip value={bug.bugType} /></td>
                  <td><PriorityChip value={bug.priority} /></td>
                  <td>
                    <div className="status-edit">
                      <select
                        className={`inline-status status-${bug.status.toLowerCase()}`}
                        title="Update status"
                        value={bug.status}
                        onChange={(e) => updateStatus(bug, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                      </select>
                      <span>Update</span>
                    </div>
                  </td>
                  <td>{bug.assignedTo?.fullName || 'Unassigned'}</td>
                  <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="mini-button" to={`/bugs/${bug.id}`}>Edit</Link>
                      <button className="mini-button danger-mini" type="button" onClick={() => deleteBug(bug)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bugs.length && <div className="empty-state">No bugs match these filters.</div>}
        </div>
      </main>
      {modalOpen && <BugModal users={users} onClose={() => setModalOpen(false)} onSubmit={createBug} />}
    </>
  );
}
