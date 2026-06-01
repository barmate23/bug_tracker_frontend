import { Check, Edit2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectUsers, setProjectUsers] = useState([]);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', role: 'DEV' });
  const [assignUserId, setAssignUserId] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUser, setEditUser] = useState({ fullName: '', username: '', password: '', role: 'DEV' });

  async function load() {
    const [usersRes, projectsRes] = await Promise.all([api.get('/users'), api.get('/projects')]);
    setUsers(usersRes.data);
    setProjects(projectsRes.data);
    setSelectedProject((current) => current || String(projectsRes.data[0]?.id || ''));
  }

  async function loadProjectUsers(projectId = selectedProject) {
    if (!projectId) return;
    const res = await api.get(`/projects/${projectId}/users`);
    setProjectUsers(res.data);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { loadProjectUsers(); }, [selectedProject]);

  async function createUser(event) {
    event.preventDefault();
    await api.post('/users', newUser);
    setNewUser({ fullName: '', username: '', password: '', role: 'DEV' });
    load();
  }

  async function assignUser(event) {
    event.preventDefault();
    if (!assignUserId) return;
    await api.post(`/projects/${selectedProject}/users`, { userId: Number(assignUserId) });
    setAssignUserId('');
    loadProjectUsers();
  }

  async function removeUser(userId) {
    await api.delete(`/projects/${selectedProject}/users/${userId}`);
    loadProjectUsers();
  }

  function startEdit(user) {
    setEditingUserId(user.userId);
    setEditUser({
      fullName: user.fullName,
      username: user.username,
      password: user.password,
      role: user.role
    });
  }

  async function saveUser(userId) {
    await api.put(`/users/${userId}`, editUser);
    setEditingUserId(null);
    await load();
    await loadProjectUsers();
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="page-head">
          <div>
            <p className="breadcrumb">Admin</p>
            <h1>User management</h1>
          </div>
        </section>
        <div className="tabs">
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'access' ? 'active' : ''} onClick={() => setTab('access')}>Project Access</button>
        </div>
        {tab === 'users' ? (
          <section className="admin-grid">
            <div className="table-card">
              <table>
                <thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      {editingUserId === user.userId ? (
                        <>
                          <td><input className="table-input" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} /></td>
                          <td><input className="table-input" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} /></td>
                          <td><input className="table-input" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} /></td>
                          <td><select className="table-input" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}><option>ADMIN</option><option>DEV</option><option>TESTER</option></select></td>
                          <td><div className="row-actions"><button className="mini-button primary-mini" onClick={() => saveUser(user.userId)} type="button"><Check size={13} /> Save</button><button className="mini-button" onClick={() => setEditingUserId(null)} type="button"><X size={13} /> Cancel</button></div></td>
                        </>
                      ) : (
                        <>
                          <td>{user.fullName}</td>
                          <td>{user.username}</td>
                          <td><code className="password-cell">{user.password}</code></td>
                          <td>{user.role}</td>
                          <td><button className="mini-button" onClick={() => startEdit(user)} type="button"><Edit2 size={13} /> Edit</button></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form className="side-form" onSubmit={createUser}>
              <h2>Add User</h2>
              <label>Name<input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} /></label>
              <label>Username<input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} /></label>
              <label>Password<input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></label>
              <label>Role<select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option>ADMIN</option><option>DEV</option><option>TESTER</option></select></label>
              <button className="primary-button"><Plus size={16} /> Add User</button>
            </form>
          </section>
        ) : (
          <section className="admin-grid">
            <div className="table-card padded">
              <label>Project<select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <div className="assigned-list">
                {projectUsers.map((user) => (
                  <div className="assigned-row" key={user.userId}><span>{user.fullName}<small>{user.role}</small></span><button className="mini-button danger-mini" onClick={() => removeUser(user.userId)} type="button"><X size={13} /> Remove Access</button></div>
                ))}
              </div>
            </div>
            <form className="side-form" onSubmit={assignUser}>
              <h2>Assign User</h2>
              <label>User<select value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}><option value="">Choose user</option>{users.map((user) => <option key={user.userId} value={user.userId}>{user.fullName}</option>)}</select></label>
              <button className="primary-button">Assign</button>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
