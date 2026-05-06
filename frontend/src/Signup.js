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

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, email, password, confirm } = form;

    if (!username || !email || !password || !confirm) {
      setModal({ icon: '⚠️', title: 'MISSING FIELDS', message: 'Please fill in all fields.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModal({ icon: '📧', title: 'INVALID EMAIL', message: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setModal({ icon: '🔒', title: 'WEAK PASSWORD', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirm) {
      setModal({ icon: '❌', title: 'MISMATCH', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        setModal({ icon: '🎉', title: 'ACCOUNT CREATED', message: 'You can now sign in with your credentials.' });
        setTimeout(() => navigate('/login'), 1800);
        setForm({ username: '', email: '', password: '', confirm: '' });
      } else {
        const msg = data.username?.[0] || data.email?.[0] || data.error || 'Registration failed.';
        setModal({ icon: '❌', title: 'SIGNUP FAILED', message: msg });
      }
    } catch {
      setModal({ icon: '🔌', title: 'CONNECTION ERROR', message: 'Could not reach server. Is the backend running?' });
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
          Already registered?{' '}
          <a onClick={() => navigate('/login')}>Sign in</a>
        </span>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          <span className="auth-badge">CREATE ACCOUNT</span>
          <h2>Get Started Now</h2>
          <p className="auth-subtitle">Enter your credentials to create your account.</p>

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={update('username')}
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={update('email')}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={update('password')}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={update('confirm')}
              />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP →'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-footer-note">
            Already have an account?{' '}
            <a onClick={() => navigate('/login')}>Sign in</a>
          </p>
        </div>
      </div>

      <footer className="page-footer">
        <span>Privacy Policy</span>
        <span>© 2025 Annonate. All rights reserved.</span>
        <span>Copyright@www</span>
      </footer>
    </div>
  );
}

export default Signup;