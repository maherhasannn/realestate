import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function getPasswordStrength(v) {
  let strength = 0;
  if (v.length >= 8) strength++;
  if (/[A-Z]/.test(v)) strength++;
  if (/[0-9]/.test(v)) strength++;
  if (/[^A-Za-z0-9]/.test(v)) strength++;
  return strength;
}

const STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');
  const [authError, setAuthError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupBrokerage, setSignupBrokerage] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState({});
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const pwStrength = getPasswordStrength(signupPassword);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!isValidEmail(loginEmail.trim())) errors.email = true;
    if (!loginPassword) errors.password = true;
    setLoginErrors(errors);
    setAuthError('');
    if (Object.keys(errors).length) return;

    setLoginLoading(true);
    try {
      await signIn(loginEmail.trim(), loginPassword);
      navigate('/app');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!signupName.trim()) errors.name = true;
    if (!isValidEmail(signupEmail.trim())) errors.email = true;
    if (!signupBrokerage.trim()) errors.brokerage = true;
    if (signupPassword.length < 8) errors.password = true;
    setSignupErrors(errors);
    setAuthError('');
    if (Object.keys(errors).length) return;

    setSignupLoading(true);
    try {
      await signUp(signupEmail.trim(), signupPassword, {
        fullName: signupName.trim(),
        brokerage: signupBrokerage.trim(),
      });
      navigate('/app');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setSignupLoading(false);
    }
  }

  function switchTab(target) {
    setTab(target);
    setAuthError('');
    setLoginErrors({});
    setSignupErrors({});
  }

  return (
    <>
      <nav className="nav login-nav">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="nav-logo-dot"></div>
          <span className="nav-logo-text">Signal</span>
        </Link>
        <Link to="/" className="nav-back">&larr; Back to home</Link>
      </nav>

      <main className="login-page">
        <div className="auth-container">
          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Log in</button>
            <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Create account</button>
          </div>

          {authError && <div className="auth-error-banner">{authError}</div>}

          {/* Login Form */}
          {tab === 'login' && (
            <form className="auth-form active" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-title">Welcome back</div>
              <div className="form-sub">Log in to your Signal dashboard.</div>

              <div className="field">
                <label className="field-label" htmlFor="login-email">Email</label>
                <input className={`field-input${loginErrors.email ? ' error' : ''}`} id="login-email" type="email" placeholder="you@brokerage.com" autoComplete="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                {loginErrors.email && <div className="field-error visible">Please enter a valid email address.</div>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="login-password">Password</label>
                <input className={`field-input${loginErrors.password ? ' error' : ''}`} id="login-password" type="password" placeholder="Enter your password" autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                {loginErrors.password && <div className="field-error visible">Password is required.</div>}
              </div>

              <div className="field-row">
                <label className="field-check"><input type="checkbox" defaultChecked /> Remember me</label>
                <a href="#" className="field-forgot">Forgot password?</a>
              </div>

              <button type="submit" className={`submit-btn${loginLoading ? ' loading' : ''}`} disabled={loginLoading}>Log in <span className="spinner"></span></button>

              <div className="form-footer">
                Don't have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('signup'); }}>Start free trial</a>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {tab === 'signup' && (
            <form className="auth-form active" onSubmit={handleSignupSubmit} noValidate>
              <div className="form-title">Start your free trial</div>
              <div className="form-sub">14 days of full Pro access. No credit card required.</div>

              <div className="field">
                <label className="field-label" htmlFor="signup-name">Full name</label>
                <input className={`field-input${signupErrors.name ? ' error' : ''}`} id="signup-name" type="text" placeholder="Jane Smith" autoComplete="name" value={signupName} onChange={e => setSignupName(e.target.value)} />
                {signupErrors.name && <div className="field-error visible">Name is required.</div>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="signup-email">Work email</label>
                <input className={`field-input${signupErrors.email ? ' error' : ''}`} id="signup-email" type="email" placeholder="jane@brokerage.com" autoComplete="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                {signupErrors.email && <div className="field-error visible">Please enter a valid work email address.</div>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="signup-brokerage">Brokerage name</label>
                <input className={`field-input${signupErrors.brokerage ? ' error' : ''}`} id="signup-brokerage" type="text" placeholder="Acme Realty" value={signupBrokerage} onChange={e => setSignupBrokerage(e.target.value)} />
                {signupErrors.brokerage && <div className="field-error visible">Brokerage name is required.</div>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="signup-password">Password</label>
                <input className={`field-input${signupErrors.password ? ' error' : ''}`} id="signup-password" type="password" placeholder="At least 8 characters" autoComplete="new-password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                <div className="pw-strength">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="pw-bar" style={{background: i < pwStrength ? STRENGTH_COLORS[Math.min(pwStrength - 1, 3)] : 'var(--gray-100)'}}></div>
                  ))}
                </div>
                {signupErrors.password && <div className="field-error visible">Password must be at least 8 characters.</div>}
              </div>

              <button type="submit" className={`submit-btn${signupLoading ? ' loading' : ''}`} disabled={signupLoading}>Create account <span className="spinner"></span></button>

              <div className="form-footer">
                Already have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('login'); }}>Log in</a>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
