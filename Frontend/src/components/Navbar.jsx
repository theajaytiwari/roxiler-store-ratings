import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homePath } from '../context/AuthContext';

const ROLE_LABEL = { ADMIN: 'System Administrator', USER: 'Normal User', OWNER: 'Store Owner' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to={homePath(user.role)} className="brand">
        ★ StoreRatings
      </Link>
      <nav>
        <span className="role-badge">{ROLE_LABEL[user.role]}</span>
        <Link to="/password">Change password</Link>
        <button className="btn btn-outline" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
}
