import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [tab, setTab] = useState('login');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successDesc, setSuccessDesc] = useState('');

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

  const pwStrength = getPasswordStrength(signupPassword);

  function handleLoginSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!isValidEmail(loginEmail.trim())) errors.email = true;
    if (!loginPassword) errors.password = true;
    setLoginErrors(errors);
    if (Object.keys(errors).length) return;

    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setSuccessTitle('Welcome back');
      setSuccessDesc('Redirecting to your dashboard...');
      setShowSuccess(true);
    }, 1500);
  }

  function handleSignupSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!signupName.trim()) errors.name = true;
    if (!isValidEmail(signupEmail.trim())) errors.email = true;
    if (!signupBrokerage.trim()) errors.brokerage = true;
    if (signupPassword.length < 8) errors.password = true;
    setSignupErrors(errors);
    if (Object.keys(errors).length) return;

    setSignupLoading(true);
    setTimeout(() => {
      setSignupLoading(false);
      setSuccessTitle('Account created');
      setSuccessDesc('Welcome to Signal! Check your email to verify your account.');
      setShowSuccess(true);
    }, 1500);
  }

  function switchTab(target) {
    setTab(target);
    setShowSuccess(false);
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
          {!showSuccess && (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Log in</button>
                <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Create account</button>
              </div>

              {/* Login Form */}
              {tab === 'login' && (
                <form className="auth-form active" onSubmit={handleLoginSubmit} noValidate>
                  <div className="form-title">Welcome back</div>
                  <div className="form-sub">Log in to your Signal dashboard.</div>

                  <div className="social-btn">
                    <svg className="social-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </div>

                  <div className="auth-divider">
                    <div className="auth-divider-line"></div>
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line"></div>
                  </div>

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

                  <div className="social-btn">
                    <svg className="social-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </div>

                  <div className="auth-divider">
                    <div className="auth-divider-line"></div>
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line"></div>
                  </div>

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
            </>
          )}

          {/* Success state */}
          {showSuccess && (
            <div className="auth-success visible">
              <div className="success-dot"><span className="success-check">&#10003;</span></div>
              <div className="success-title">{successTitle}</div>
              <div className="success-desc">{successDesc}</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
