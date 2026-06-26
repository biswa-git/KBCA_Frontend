import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

type View = 'login' | 'register' | 'otp' | 'forgot' | 'forgot-sent' | 'reset';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: View;
  resetToken?: string;
}


/* Reusable inline link-style button */
function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--gold)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--gold-dim)',
        paddingBottom: '4px',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)';
        (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'var(--gold)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
        (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'var(--gold-dim)';
      }}
    >
      {children}
    </button>
  );
}

/* Section label divider shared across all views */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
      <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }} />
      {label}
      <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }} />
    </div>
  );
}

export default function LoginModal({
  isOpen,
  onClose,
  initialView = 'login',
  resetToken = '',
}: LoginModalProps) {
  const { refs, isVisible } = useScrollReveal(4);

  const [view, setView] = useState<View>(initialView);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If the modal was opened with a reset token, the login/register elements
  // aren't mounted initially, so useScrollReveal won't observe them. We bypass the animation.
  const bypassReveal = !!resetToken;

  // When the modal opens with a reset token, jump straight to the reset view
  useEffect(() => {
    if (isOpen && resetToken) {
      setView('reset');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, resetToken]);

  // When modal opens fresh (no reset token), start at the initialView
  useEffect(() => {
    if (isOpen && !resetToken) {
      setView(initialView);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialView]);

  const apiUrl = import.meta.env.VITE_API_URL;

  const clearMessages = () => { setError(null); setSuccess(null); };

  // Auto-clear messages after 2 seconds (unless it's the special register nudge)
  useEffect(() => {
    if (error === 'Email not verified. Please register to get an OTP.') return;

    let timer: ReturnType<typeof setTimeout>;
    if (error || success) {
      timer = setTimeout(() => {
        clearMessages();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [error, success]);

  /* ─── LOGIN ─────────────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: formData.get('email') as string,
          password: formData.get('password') as string,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setSuccess('Successfully logged in!');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── REGISTER ───────────────────────────────────────────────────── */
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: formData.get('password') as string,
          full_name: formData.get('name') as string,
          phone: formData.get('phone') || null,
          address: formData.get('address') || null,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Registration failed');
      }
      setSuccess('OTP sent to your email. Please verify.');
      setRegistrationEmail(email);
      setView('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── OTP ────────────────────────────────────────────────────────── */
  const handleOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const otp = (new FormData(e.currentTarget).get('otp') as string);
    try {
      const response = await fetch(`${apiUrl}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationEmail, otp }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'OTP verification failed');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setSuccess('Verification successful! Logging you in…');
      setTimeout(() => { setView('login'); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── FORGOT PASSWORD ────────────────────────────────────────────── */
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const email = new FormData(e.currentTarget).get('email') as string;
    try {
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Request failed. Please try again.');
      }
      setView('forgot-sent');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── RESET PASSWORD ─────────────────────────────────────────────── */
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const tokenValue = formData.get('token') as string || resetToken;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!tokenValue) {
      setError('Please enter the reset token from your email.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue, new_password: newPassword }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Reset failed. The token may be invalid or expired.');
      }
      setSuccess('Password updated! Redirecting to login…');
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setView('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── SHARED FEEDBACK ────────────────────────────────────────────── */
  const renderMessages = () => {
    if (!error && !success) return null;

    const isSpecialError = error === 'Email not verified. Please register to get an OTP.';

    return (
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        minWidth: '280px',
        maxWidth: '90%',
        padding: '16px 24px',
        borderRadius: '8px',
        background: 'var(--bg-dark, #0a0a0a)',
        border: `1px solid ${error ? 'var(--red-bindi)' : 'var(--gold)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        animation: 'toastFadeIn 0.3s ease-out forwards',
      }}>
        <style>{`
          @keyframes toastFadeIn {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
        <div style={{
          color: error ? 'var(--red-bindi)' : 'var(--gold)',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 500,
          lineHeight: '1.5',
        }}>
          {error || success}
        </div>

        {isSpecialError && (
          <button
            type="button"
            onClick={() => { clearMessages(); setView('register'); }}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '8px 20px', borderColor: 'var(--gold-dim)', color: 'var(--cream)' }}
          >
            Switch to Register
          </button>
        )}
      </div>
    );
  };

  /* ─── SUBMIT BUTTON ──────────────────────────────────────────────── */
  const SubmitBtn = ({ label }: { label: string }) => (
    <button
      type="submit"
      className="btn-primary"
      disabled={isLoading}
      style={{ marginTop: '32px', width: '100%', opacity: isLoading ? 0.7 : 1 }}
    >
      {isLoading ? 'Please wait…' : label}
    </button>
  );

  /* ─── RENDER ─────────────────────────────────────────────────────── */
  return (
    <section className={`become-member ${isOpen ? 'open' : ''}`}>
      <div className="become-member-content">
        <button className="close-btn" onClick={onClose} aria-label="Close form">✕</button>

        <div className="become-member-inner">

          {renderMessages()}

          {/* ── OTP ── */}
          {view === 'otp' && (
            <>
              <SectionDivider label="যাচাই · Verify" />
              <h2 className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Enter OTP<br /><em>Code.</em>
              </h2>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                We've sent a 6-digit code to <strong style={{ color: 'var(--gold)' }}>{registrationEmail}</strong>.
              </p>
              <form onSubmit={handleOtp} className="membership-form reveal visible" style={{ transform: 'none', opacity: 1 }}>
                <div className="form-group">
                  <label htmlFor="otp">Verification Code *</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    required
                    placeholder="123456"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                  />
                </div>
                <SubmitBtn label="Verify & Login" />
              </form>
              <div className="form-note reveal visible" style={{ marginTop: '24px', textAlign: 'center', transform: 'none', opacity: 1 }}>
                <LinkButton onClick={() => { setView('register'); clearMessages(); }}>
                  Back to Registration
                </LinkButton>
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD — email entry ── */}
          {view === 'forgot' && (
            <>
              <SectionDivider label="পুনরুদ্ধার · Recover" />
              <h2 className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Forgot Your<br /><em>Password?</em>
              </h2>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1, marginBottom: '8px' }}>
                Enter your registered email address and we'll send you a secure reset link, valid for 15 minutes.
              </p>
              <form onSubmit={handleForgotPassword} className="membership-form reveal visible" style={{ transform: 'none', opacity: 1 }}>
                <div className="form-group">
                  <label htmlFor="forgot-email">Email *</label>
                  <input
                    type="email"
                    id="forgot-email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
                <SubmitBtn label="Send Reset Link" />
              </form>
              <div className="form-note reveal visible" style={{ marginTop: '24px', textAlign: 'center', transform: 'none', opacity: 1 }}>
                <LinkButton onClick={() => { setView('login'); clearMessages(); }}>
                  Back to Login
                </LinkButton>
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD — check email confirmation ── */}
          {view === 'forgot-sent' && (
            <>
              <SectionDivider label="পরীক্ষা করুন · Check Email" />
              {/* Envelope icon */}
              <div style={{
                width: '64px', height: '64px',
                border: '1px solid var(--border-strong)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem',
                margin: '0 auto 28px',
                background: 'rgba(201,168,76,0.06)',
              }}>
                ✉
              </div>
              <h2 className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Check Your<br /><em>Inbox.</em>
              </h2>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1, marginBottom: '8px' }}>
                If your email is registered with KBCA, you'll receive a password reset link shortly.
                The link expires in <strong style={{ color: 'var(--gold)' }}>15 minutes</strong>.
              </p>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Don't see it? Check your spam or promotions folder.
              </p>
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <LinkButton onClick={() => { setView('forgot'); clearMessages(); }}>
                  Try a different email
                </LinkButton>
                <span style={{ color: 'var(--muted)', margin: '0 16px', fontSize: '0.8rem' }}>or</span>
                <LinkButton onClick={() => { setView('login'); clearMessages(); }}>
                  Back to Login
                </LinkButton>
              </div>
            </>
          )}

          {/* ── RESET PASSWORD — set new password ── */}
          {view === 'reset' && (
            <>
              <SectionDivider label="পুনর্নির্ধারণ · Reset" />
              <h2 className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Set New<br /><em>Password.</em>
              </h2>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1, marginBottom: '8px' }}>
                Choose a strong new password for your KBCA account.
              </p>
              <form onSubmit={handleResetPassword} className="membership-form reveal visible" style={{ transform: 'none', opacity: 1 }}>
                <div className="form-group">
                  <label htmlFor="token">Reset Token *</label>
                  <input
                    type="text"
                    id="token"
                    name="token"
                    required={!resetToken}
                    placeholder="Enter token from email"
                    defaultValue={resetToken}
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new_password">New Password *</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    required
                    minLength={8}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                  />
                </div>
                <SubmitBtn label="Update Password" />
              </form>
            </>
          )}

          {/* ── LOGIN / REGISTER ── */}
          {(view === 'login' || view === 'register') && (
            <>
              <SectionDivider label={view === 'login' ? 'প্রবেশ · Login' : 'নিবন্ধন · Register'} />

              <h2 className={`reveal ${isVisible[0] || bypassReveal ? 'visible' : ''}`} ref={refs[0]} style={bypassReveal ? { transform: 'none', opacity: 1 } : undefined}>
                {view === 'login' ? <><>Welcome</><br /><em>Back.</em></> : <><>Join Our</><br /><em>Family.</em></>}
              </h2>

              <p className={`reveal reveal-delay-1 ${isVisible[1] || bypassReveal ? 'visible' : ''}`} ref={refs[1]} style={bypassReveal ? { transform: 'none', opacity: 1 } : undefined}>
                {view === 'login'
                  ? 'Please log in to access your KBCA account.'
                  : 'Create an account to become a member of KBCA.'}
              </p>

              <form
                onSubmit={view === 'login' ? handleLogin : handleRegister}
                className={`membership-form reveal reveal-delay-2 ${isVisible[2] || bypassReveal ? 'visible' : ''}`}
                ref={refs[2]}
                style={bypassReveal ? { transform: 'none', opacity: 1 } : undefined}
              >
                {view === 'register' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input type="text" id="name" name="name" required placeholder="Your full name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                        placeholder="Your 10-digit phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address (Optional)</label>
                      <input type="text" id="address" name="address" placeholder="City, State/Country" />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" required placeholder="your@email.com" />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input type="password" id="password" name="password" required placeholder="••••••••" />
                </div>

                {/* Forgot password link — only in login view */}
                {view === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '-12px' }}>
                    <LinkButton onClick={() => { setView('forgot'); clearMessages(); }}>
                      Forgot password?
                    </LinkButton>
                  </div>
                )}

                <SubmitBtn label={view === 'login' ? 'Login' : 'Register'} />
              </form>

              <div
                className={`form-note reveal reveal-delay-3 ${isVisible[3] || bypassReveal ? 'visible' : ''}`}
                ref={refs[3]}
                style={{ marginTop: '24px', textAlign: 'center', ...(bypassReveal ? { transform: 'none', opacity: 1 } : {}) }}
              >
                <LinkButton onClick={() => { setView(view === 'login' ? 'register' : 'login'); clearMessages(); }}>
                  {view === 'login'
                    ? 'First time user? Click here to register.'
                    : 'Already have an account? Click here to login.'}
                </LinkButton>
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
}
