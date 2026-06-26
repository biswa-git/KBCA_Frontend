import { useState, useEffect } from 'react';

interface MeetupRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADULT_RATE = 250;
const CHILD_RATE = 150;

export default function MeetupRegistrationModal({ isOpen, onClose }: MeetupRegistrationModalProps) {
  const [adults, setAdults] = useState(1);
  const [kidsOlder, setKidsOlder] = useState(0);
  const [kidsUnder, setKidsUnder] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const total = adults * ADULT_RATE + kidsOlder * CHILD_RATE;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAdults(1);
        setKidsOlder(0);
        setKidsUnder(0);
        setSubmitted(false);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="meetup-counter-field">
      <div className="meetup-counter-header">
        <div>
          <label htmlFor={id} className="meetup-counter-label">{label}</label>
          <div className="meetup-counter-sub">{subLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <button
            type="button"
            className="meetup-counter-btn"
            aria-label={`Decrease ${label}`}
            onClick={() => setValue(Math.max(min, value - 1))}
          >−</button>
          <input
            type="number"
            id={id}
            name={id}
            value={value}
            min={min}
            readOnly
            className="meetup-counter-input"
          />
          <button
            type="button"
            className="meetup-counter-btn"
            aria-label={`Increase ${label}`}
            onClick={() => setValue(value + 1)}
          >+</button>
        </div>
      </div>
      <div className="meetup-counter-rate-tag">{rate}</div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`meetup-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-screen right-slide drawer */}
      <div
        className={`meetup-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Meetup Registration"
      >
        <button className="meetup-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="meetup-page">

          {!submitted ? (
            <>
              {/* ── Header ── */}
              <div className="meetup-header">
                <div className="meetup-eyebrow">নিবন্ধন · Registration</div>
                <h1 className="meetup-title">Meetup <em>Registration.</em></h1>
                <p className="meetup-desc">
                  Join us for the auspicious <strong>Muhurat (Khuti Puja)</strong> — the ceremonial start of our Durga Puja journey.
                </p>

                {/* Event meta strip */}
                <div className="meetup-meta-strip">
                  <span>📅 19th July 2026</span>
                  <span className="meetup-meta-dot" />
                  <span>📍 Axon Business Hotel</span>
                  <span className="meetup-meta-dot" />
                  <span>🕕 6:00 PM Onwards</span>
                </div>
              </div>

              {/* ── Pricing info ── */}
              <div className="meetup-section">
                <div className="meetup-section-label">Entry Charges</div>
                <div className="meetup-pricing-strip">
                  {[
                    { label: 'Adults', age: 'Age 13+', price: '₹250' },
                    { label: 'Children', age: 'Age 6–12', price: '₹150' },
                    { label: 'Under 6', age: 'Below 6 yrs', price: 'Free' },
                  ].map(({ label, age, price }) => (
                    <div key={label} className="meetup-price-card">
                      <div className="meetup-price-label">{label}</div>
                      <div className="meetup-price-age">{age}</div>
                      <div className="meetup-price-amount">{price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="meetup-section meetup-form">
                <div className="meetup-section-label">Select Attendees</div>

                <CounterField
                  id="adults"
                  label="Adults"
                  subLabel="Age 13 and above"
                  value={adults}
                  setValue={setAdults}
                  rate="₹250 per person"
                  min={1}
                />
                <CounterField
                  id="kids-older"
                  label="Children (6–12 yrs)"
                  subLabel="Age 6 to 12 years"
                  value={kidsOlder}
                  setValue={setKidsOlder}
                  rate="₹150 per child"
                />
                <CounterField
                  id="kids-under"
                  label="Children (Under 6)"
                  subLabel="Below 6 years — complimentary"
                  value={kidsUnder}
                  setValue={setKidsUnder}
                  rate="Free entry"
                />

                {/* Live total */}
                <div className="meetup-total">
                  <div className="meetup-total-left">
                    <div className="meetup-total-label">Total Payable</div>
                    <div className="meetup-total-breakdown">
                      {adults} adult{adults !== 1 ? 's' : ''}
                      {kidsOlder > 0 ? ` · ${kidsOlder} child (6–12)` : ''}
                      {kidsUnder > 0 ? ` · ${kidsUnder} (under 6)` : ''}
                    </div>
                  </div>
                  <div className="meetup-total-amount">₹{total.toLocaleString('en-IN')}</div>
                </div>

                <button type="submit" id="meetup-register-submit" className="btn-primary meetup-submit">
                  Register Now
                </button>

                <p className="meetup-footnote">
                  Payment details will be shared once registration opens.
                </p>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="meetup-success">
              <div className="meetup-success-icon">🎉</div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>সফল · Success</div>
              <h2 className="meetup-success-title">You're on the <em>List!</em></h2>
              <p className="meetup-success-desc">
                Registration will begin soon. We'll notify you when it opens — keep an eye on your inbox and our announcements!
              </p>
              <button className="btn-ghost" onClick={onClose} style={{ fontSize: '0.82rem', padding: '12px 40px' }}>
                Back to Events
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
