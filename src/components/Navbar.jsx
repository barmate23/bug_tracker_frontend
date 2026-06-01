import { Grid2X2, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAdmin, useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/projects">
        <span className="brand-mark">B</span>
        Bug Tracker
      </Link>
      <nav className="nav-actions">
        <Link className="ghost-button" to="/projects"><Grid2X2 size={15} /> Projects</Link>
        {isAdmin(user) && <Link className="ghost-button" to="/admin">Admin</Link>}
        <span className="user-chip">
          <ShieldCheck size={16} />
          {user?.fullName} {isAdmin(user) && <strong>{user?.role}</strong>}
        </span>
        <button className="ghost-button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
      </nav>
    </header>
  );
}
