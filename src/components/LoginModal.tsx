import { useState } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { refs, isVisible } = useScrollReveal(4);
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsOtpStep(false);
    setError(null);
    setSuccess(null);
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const otp = formData.get('otp') as string;

    try {
      const response = await fetch('http://localhost:8000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationEmail,
          otp,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'OTP verification failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      setSuccess('Verification successful! Logging you in...');
      setTimeout(() => {
        setIsOtpStep(false);
        setIsLogin(true);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        // Login flow
        const response = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Login failed');
        }

        const data = await response.json();
        // Store token (in a real app, you'd use context or a store)
        localStorage.setItem('access_token', data.access_token);
        setSuccess('Successfully logged in!');
        setTimeout(() => onClose(), 1500);
      } else {
        // Register flow
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;

        const response = await fetch('http://localhost:8000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            full_name: name,
            phone: phone || null,
            address: address || null,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed');
        }

        setSuccess('OTP sent to your email. Please verify.');
        setRegistrationEmail(email);
        setIsOtpStep(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <section className={`become-member ${isOpen ? 'open' : ''}`}>
      <div className="become-member-content">
        <button className="close-btn" onClick={onClose} aria-label="Close form">
          ✕
        </button>

        <div className="become-member-inner">
          {isOtpStep ? (
            <>
              <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
                <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
                যাচাই · Verify
                <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
              </div>
              <h2 className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                Enter OTP
                <br />
                <em>Code.</em>
              </h2>
              <p className="reveal visible" style={{ transform: 'none', opacity: 1 }}>
                We've sent a 6-digit verification code to {registrationEmail}.
              </p>
              <form onSubmit={handleOtpSubmit} className="membership-form reveal visible" style={{ transform: 'none', opacity: 1 }}>
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
                {error && <div style={{ color: 'var(--red-bindi)', marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>}
                {success && <div style={{ color: 'var(--gold)', marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{success}</div>}
                <button type="submit" className="btn-primary" style={{ marginTop: '32px', width: '100%' }}>
                  Verify & Login
                </button>
              </form>
              <div className="form-note reveal visible" style={{ marginTop: '24px', textAlign: 'center', transform: 'none', opacity: 1 }}>
                <button
                  type="button"
                  onClick={() => { setIsOtpStep(false); setError(null); setSuccess(null); }}
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
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = 'var(--cream)';
                    (e.target as HTMLButtonElement).style.borderBottomColor = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = 'var(--gold)';
                    (e.target as HTMLButtonElement).style.borderBottomColor = 'var(--gold-dim)';
                  }}
                >
                  Back to Registration
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
                <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
                {isLogin ? 'প্রবেশ · Login' : 'নিবন্ধন · Register'}
                <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
              </div>

              <h2
                className={`reveal ${isVisible[0] ? 'visible' : ''}`}
                ref={refs[0]}
              >
                {isLogin ? (
                  <>
                    Welcome
                    <br />
                    <em>Back.</em>
                  </>
                ) : (
                  <>
                    Join Our
                    <br />
                    <em>Family.</em>
                  </>
                )}
              </h2>

              <p
                className={`reveal reveal-delay-1 ${isVisible[1] ? 'visible' : ''}`}
                ref={refs[1]}
              >
                {isLogin
                  ? 'Please log in to access your KBCA account.'
                  : 'Create an account to become a member of KBCA.'}
              </p>

              <form onSubmit={handleSubmit} className={`membership-form reveal reveal-delay-2 ${isVisible[2] ? 'visible' : ''}`} ref={refs[2] as any}>
                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address (Optional)</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="City, State/Country"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                  />
                </div>

                {error === 'Email not verified. Please register to get an OTP.' ? (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    border: '1px solid var(--gold-dim)',
                    background: 'rgba(201,168,76,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      Email not verified. Please register to get an OTP.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '8px 20px' }}
                    >
                      Switch to Register
                    </button>
                  </div>
                ) : error ? (
                  <div style={{ color: 'var(--red-bindi)', marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>
                ) : null}
                {success && <div style={{ color: 'var(--gold)', marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>{success}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: '32px', width: '100%' }}
                >
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>

              <div
                className={`form-note reveal reveal-delay-3 ${isVisible[3] ? 'visible' : ''}`}
                ref={refs[3]}
                style={{ marginTop: '24px', textAlign: 'center' }}
              >
                <button
                  type="button"
                  onClick={toggleMode}
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
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = 'var(--cream)';
                    (e.target as HTMLButtonElement).style.borderBottomColor = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = 'var(--gold)';
                    (e.target as HTMLButtonElement).style.borderBottomColor = 'var(--gold-dim)';
                  }}
                >
                  {isLogin
                    ? "First time user? Click here to register."
                    : "Already have an account? Click here to login."}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
