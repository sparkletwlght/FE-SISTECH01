import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#E53E3E' };
  if (score <= 3) return { score, label: 'Fair', color: '#D97706' };
  return { score, label: 'Strong', color: '#38A169' };
}

function validatePassword(pw, forRegister = false) {
  if (!pw || pw.length < 8) return 'Password minimal 8 karakter.';
  if (forRegister) {
    if (!/[A-Z]/.test(pw)) return 'Password harus ada huruf kapital.';
    if (!/[0-9]/.test(pw)) return 'Password harus ada angka.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Password harus ada karakter spesial (!, @, #, dll).';
  }
  return null;
}

export default function Login() {
  const location = useLocation();
  const [mode, setMode] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [username, setUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setError('');
  }, [mode]);

  const strength = getPasswordStrength(regPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const pwErr = validatePassword(loginPassword);
    if (pwErr) { setError(pwErr); return; }
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'Login gagal. Periksa email & password.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || username.length < 3)
      { setError('Username minimal 3 karakter.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      { setError('Username hanya boleh huruf, angka, dan underscore.'); return; }
    const pwErr = validatePassword(regPassword, true);
    if (pwErr) { setError(pwErr); return; }
    if (regPassword !== confirmPassword)
      { setError('Password dan konfirmasi tidak cocok.'); return; }
    setLoading(true);
    const result = await register(username, regEmail, regPassword);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'Registrasi gagal. Coba lagi.');
  };

  return (
    <div className="auth-container">
      {/* Animated orb blobs */}
      <div className="orb-amber" style={{ top: '8%', left: '10%' }} />
      <div className="orb-blue"  style={{ bottom: '10%', right: '10%' }} />
      <div className="orb-amber" style={{ bottom: '20%', left: '33%', opacity: 0.5 }} />

      {/* Card */}
      <div className="auth-card">
        {/* Branding */}
        <div className="auth-brand">
          <span className="auth-brand-icon">📚</span>
          <h2 className="auth-brand-name">Bibliotheca</h2>
          <p className="auth-brand-sub">Welcome back, Bi-readers!</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >Login</button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >Register</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form" autoComplete="on">
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email" type="email" value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required placeholder="Enter your email"
                disabled={loading} autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="pw-wrapper">
                <input
                  id="login-password"
                  type={showLoginPw ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required placeholder="Enter your password"
                  disabled={loading} autoComplete="current-password"
                />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowLoginPw(v => !v)} tabIndex={-1}>
                  {showLoginPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form" autoComplete="on">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                required placeholder="Min 3 karakter (huruf, angka, _)"
                disabled={loading} minLength={3} maxLength={30}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email" type="email" value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required placeholder="Enter your email"
                disabled={loading} autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="pw-wrapper">
                <input
                  id="reg-password"
                  type={showRegPw ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required placeholder="Min 8 karakter, kapital, angka, simbol"
                  disabled={loading} autoComplete="new-password"
                />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowRegPw(v => !v)} tabIndex={-1}>
                  {showRegPw ? '🙈' : '👁️'}
                </button>
              </div>
              {regPassword && (
                <div className="pw-strength">
                  <div className="pw-strength-bar"
                    style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                  <span style={{ color: strength.color, fontSize: '12px' }}>{strength.label}</span>
                </div>
              )}
              <ul className="pw-rules">
                <li className={regPassword.length >= 8 ? 'ok' : ''}>✓ Min 8 karakter</li>
                <li className={/[A-Z]/.test(regPassword) ? 'ok' : ''}>✓ Huruf kapital (A-Z)</li>
                <li className={/[0-9]/.test(regPassword) ? 'ok' : ''}>✓ Angka (0-9)</li>
                <li className={/[^A-Za-z0-9]/.test(regPassword) ? 'ok' : ''}>✓ Karakter spesial (!@#$...)</li>
              </ul>
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Konfirmasi Password</label>
              <div className="pw-wrapper">
                <input
                  id="reg-confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required placeholder="Ulangi password"
                  disabled={loading} autoComplete="new-password"
                />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}>
                  {showConfirmPw ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword && regPassword !== confirmPassword &&
                <span className="pw-mismatch">Password tidak cocok!</span>}
              {confirmPassword && regPassword === confirmPassword &&
                <span className="pw-match">✓ Password cocok</span>}
            </div>
            <button type="submit" className="auth-button" disabled={loading || (!!regPassword && strength.score < 3)}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
