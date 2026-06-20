import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Modal({ icon, title, message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <button className="modal-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setModal({ icon: 'âš ï¸', title: 'MISSING FIELDS', message: 'Please enter both username and password.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate('/dashboard');
      } else {
        setModal({ icon: 'âŒ', title: 'LOGIN FAILED', message: data.error || 'Invalid credentials.' });
      }
    } catch {
      setModal({ icon: 'ðŸ”Œ', title: 'CONNECTION ERROR', message: 'Could not reach server. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {modal && <Modal {...modal} onClose={() => setModal(null)} />}

      <div className="auth-topbar">
        <span className="auth-topbar-brand" onClick={() => navigate('/')}>Annonate</span>
        <span className="auth-topbar-link">
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')}>Sign up</a>
        </span>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          <span className="auth-badge">WELCOME BACK</span>
          <h2>Login to Your Account</h2>
          <p className="auth-subtitle">Your data. Your labels. Your context.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Email / Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-footer-note">
            Don't have an account?{' '}
            <a onClick={() => navigate('/signup')}>Register here</a>
          </p>
          <p className="auth-footer-note" style={{ marginTop: 10 }}>
            <a href="#">Forgot Password?</a>
          </p>
        </div>
      </div>

      <footer className="page-footer">
        <span>Privacy Policy</span>
        <span>Â© 2025 Annonate. All rights reserved.</span>
        <span>Copyright@www</span>
      </footer>
    </div>
  );
}

export default Login;