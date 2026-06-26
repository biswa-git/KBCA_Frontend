import { useState, useEffect } from 'react';

interface MeetupRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADULT_RATE = 250;
const CHILD_RATE = 150; // age 6–12
// under 6 is free

export default function MeetupRegistrationModal({ isOpen, onClose }: MeetupRegistrationModalProps) {
  const [adults, setAdults] = useState(1);
  const [kidsOlder, setKidsOlder] = useState(0); // 6–12
  const [kidsUnder, setKidsUnder] = useState(0); // under 6
  const [submitted, setSubmitted] = useState(false);

  const total = adults * ADULT_RATE + kidsOlder * CHILD_RATE;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAdults(1);
      setKidsOlder(0);
      setKidsUnder(0);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // System notification as requested — backend integration pending
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('KBCA Meetup', {
        body: "Registration will begin soon. We'll notify you when it opens!",
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('KBCA Meetup', {
            body: "Registration will begin soon. We'll notify you when it opens!",
          });
        }
      });
    }
    setSubmitted(true);
  };

  const CounterField = ({
    label,
    subLabel,
    value,
    setValue,
    rate,
    id,
    min = 0,
  }: {
    label: string;
    subLabel: string;
    value: number;
    setValue: (v: number) => void;
    rate: string;
    id: string;
    min?: number;
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '0.82rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            color: 'var(--gold)',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
        <span style={{ fontSize: '0.75rem', color: 'rgba(250,247,242,0.45)', fontStyle: 'italic' }}>
          {rate}
        </span>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(250,247,242,0.4)', marginTop: '-4px' }}>
        {subLabel}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => setValue(Math.max(min, value - 1))}
          style={{
            width: '42px',
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid var(--border)',
            borderRight: 'none',
            color: 'var(--cream)',
            fontSize: '1.4rem',
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.05)')}
        >
          −
        </button>
        <input
          type="number"
          id={id}
          name={id}
          value={value}
          min={min}
          readOnly
          style={{
            width: '64px',
            textAlign: 'center',
            background: 'rgba(201,168,76,0.03)',
            border: '1px solid var(--border)',
            color: 'var(--cream)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '1rem',
            fontWeight: 500,
            padding: '10px 0',
          }}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => setValue(value + 1)}
          style={{
            width: '42px',
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid var(--border)',
            borderLeft: 'none',
            color: 'var(--cream)',
            fontSize: '1.4rem',
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.05)')}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <section
      className={`become-member ${isOpen ? 'open' : ''}`}
      aria-modal="true"
      role="dialog"
      aria-label="Meetup Registration"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="become-member-content">
        <button className="close-btn" onClick={onClose} aria-label="Close registration form">✕</button>

        <div className="become-member-inner">

          {/* Header */}
          <div className="section-label" style={{ justifyContent: 'flex-start', marginBottom: '20px' }}>
            <span style={{ width: '32px', height: '1px', background: 'var(--gold-dim)' }} />
            নিবন্ধন · Registration
            <span style={{ width: '32px', height: '1px', background: 'var(--gold-dim)' }} />
          </div>

          <h2 style={{ transform: 'none', opacity: 1 }}>
            Meetup<br /><em>Registration.</em>
          </h2>

          <p style={{ marginBottom: '8px' }}>
            Join us for the auspicious{' '}
            <strong style={{ color: 'var(--cream)' }}>Muhurat (Khuti Puja)</strong> on{' '}
            <strong style={{ color: 'var(--gold)' }}>19th July 2026</strong> at Axon Business Hotel, 6:00 PM onwards.
          </p>

          {/* Pricing legend */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            margin: '0 0 36px',
          }}>
            {[
              { label: 'Adults', price: '₹250', sub: 'per person' },
              { label: 'Kids 6–12', price: '₹150', sub: 'per child' },
              { label: 'Under 6', price: 'Free', sub: 'no charge' },
            ].map(({ label, price, sub }) => (
              <div key={label} style={{
                border: '1px solid var(--border)',
                padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--gold-dim)',
                  marginBottom: '6px',
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.2rem',
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}>
                  {price}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'rgba(250,247,242,0.35)', marginTop: '3px' }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>

              <CounterField
                id="adults"
                label="Adults"
                subLabel="Age 13 and above"
                value={adults}
                setValue={setAdults}
                rate="₹250 each"
                min={1}
              />
              <CounterField
                id="kids-older"
                label="Children (6–12 yrs)"
                subLabel="Age 6 to 12 years"
                value={kidsOlder}
                setValue={setKidsOlder}
                rate="₹150 each"
              />
              <CounterField
                id="kids-under"
                label="Children (Under 6)"
                subLabel="Below 6 years — complimentary"
                value={kidsUnder}
                setValue={setKidsUnder}
                rate="Free"
              />

              {/* Live total */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--gold-dim)',
                    marginBottom: '4px',
                  }}>
                    Total Payable
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(250,247,242,0.35)' }}>
                    {adults} adult{adults !== 1 ? 's' : ''}
                    {kidsOlder > 0 ? ` · ${kidsOlder} child (6–12)` : ''}
                    {kidsUnder > 0 ? ` · ${kidsUnder} child (under 6)` : ''}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  letterSpacing: '-0.01em',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}>
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="submit"
                id="meetup-register-submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '4px' }}
              >
                Register Now
              </button>

              <p style={{ marginBottom: 0, textAlign: 'center', fontSize: '0.78rem' }}>
                Payment details will be shared after registration opens.
              </p>
            </form>
          ) : (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '1px solid var(--border-strong)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 28px',
                background: 'rgba(201,168,76,0.06)',
              }}>
                🎉
              </div>
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                transform: 'none',
                opacity: 1,
                marginBottom: '16px',
              }}>
                You're on the<br /><em>List!</em>
              </h2>
              <p style={{ marginBottom: '32px' }}>
                Registration will begin soon. We'll notify you when it opens — keep an eye on your inbox and our announcements!
              </p>
              <button
                className="btn-ghost"
                onClick={onClose}
                style={{ fontSize: '0.82rem', padding: '12px 32px' }}
              >
                Back to Events
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
