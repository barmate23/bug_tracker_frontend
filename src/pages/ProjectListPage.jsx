import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProjectListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  async function load() {
    const res = await api.get('/projects');
    setProjects(res.data);
  }

  useEffect(() => { load(); }, []);

  async function createProject(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await api.post('/projects', form);
    setForm({ name: '', description: '' });
    load();
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="page-head">
          <div>
            <p className="breadcrumb">Projects</p>
            <h1>Project workspace</h1>
          </div>
        </section>
        {user.role === 'ADMIN' && (
          <form className="inline-create" onSubmit={createProject}>
            <input placeholder="New project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="primary-button" type="submit"><Plus size={15} /> New Project</button>
          </form>
        )}
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
              </div>
              <div className="project-card-foot">
                <span className="bug-count">{project.bugCount} bugs</span>
                <Link className="primary-button" to={`/projects/${project.id}/bugs`}>Open</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
