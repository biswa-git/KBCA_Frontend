import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';
import checkCircleIcon from '../assets/check-circle.svg';
import searchCircleIcon from '../assets/search-circle.svg';
import celebrationBurstIcon from '../assets/celebration-burst.svg';
import calendarIcon from '../assets/calendar.svg';
import locationPinIcon from '../assets/location-pin.svg';
import clockIcon from '../assets/clock.svg';

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => any;
  }
}

const CASHFREE_SDK_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js';
// We will use import.meta.env.VITE_API_URL for the backend URL directly in the function

const loadCashfreeSdk = (): Promise<void> => {
  if (window.Cashfree) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cashfree-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Cashfree SDK failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src = CASHFREE_SDK_SRC;
    script.async = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cashfree SDK failed to load'));
    document.body.appendChild(script);
  });
};

interface MeetupRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onRegistrationChange?: (registered: boolean) => void;
}

interface MeetupRegistrationDetails {
  adults: number;
  children_6_12: number;
  children_under_6: number;
  amount_paid: number;
  venue: string;
  date: string;
  time: string;
}

const ADULT_RATE = 250;
const CHILD_RATE = 150;

const buildQrCodeUrl = (value: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(value)}&margin=2&ecc=M&format=png&bgcolor=ffffff&color=000000`;

function RegistrationDetails({ registration, muhuratCode }: { registration: MeetupRegistrationDetails; muhuratCode?: string | null }) {
  return (
    <div style={{ marginTop: '24px', width: 'min(100%, 560px)', marginLeft: 'auto', marginRight: 'auto', padding: '20px 22px', borderRadius: '18px', border: '1px solid var(--border-strong)', background: 'linear-gradient(135deg, rgba(255,215,130,0.12), rgba(250,247,242,0.03))', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px', fontWeight: 700 }}>
        Registration details
      </div>
      <div style={{ display: 'grid', gap: '10px', textAlign: 'left', color: 'var(--cream)', fontSize: '0.95rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-dim)' }}><img src={locationPinIcon} alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />Venue</span><strong style={{ textAlign: 'right' }}>{registration.venue}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-dim)' }}><img src={calendarIcon} alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />Date</span><strong style={{ textAlign: 'right' }}>{registration.date}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-dim)' }}><img src={clockIcon} alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />Time</span><strong style={{ textAlign: 'right' }}>{registration.time}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ color: 'var(--gold-dim)' }}>Total persons</span><strong style={{ textAlign: 'right' }}>{registration.adults + registration.children_6_12 + registration.children_under_6}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ color: 'var(--gold-dim)' }}>Adults</span><strong style={{ textAlign: 'right' }}>{registration.adults}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ color: 'var(--gold-dim)' }}>Children (6–12)</span><strong style={{ textAlign: 'right' }}>{registration.children_6_12}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,215,130,0.14)' }}><span style={{ color: 'var(--gold-dim)' }}>Children (Under 6)</span><strong style={{ textAlign: 'right' }}>{registration.children_under_6}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--gold-dim)' }}>Amount paid</span><strong style={{ color: 'var(--gold)', textAlign: 'right' }}>₹{registration.amount_paid.toLocaleString('en-IN')}</strong></div>
        {muhuratCode && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,215,130,0.14)', display: 'flex', justifyContent: 'center' }}>
            <div className="meetup-qr-card">
              <img
                src={buildQrCodeUrl(muhuratCode)}
                alt="Muhurat QR"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeetupRegistrationModal({ isOpen, onClose, userEmail, onRegistrationChange }: MeetupRegistrationModalProps) {
  const [adults, setAdults] = useState(1);
  const [kidsOlder, setKidsOlder] = useState(0);
  const [kidsUnder, setKidsUnder] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<MeetupRegistrationDetails | null>(null);
  const [successfulRegistration, setSuccessfulRegistration] = useState<MeetupRegistrationDetails | null>(null);
  const [muhuratCode, setMuhuratCode] = useState<string | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [registrationCheckError, setRegistrationCheckError] = useState('');
  const [cashfreeClient, setCashfreeClient] = useState<any>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pendingPaymentSessionId, setPendingPaymentSessionId] = useState<string | null>(null);
  const [pendingCashfreeOrderId, setPendingCashfreeOrderId] = useState<string | null>(null);
  const checkoutMountRef = useRef<HTMLDivElement | null>(null);

  const total = adults * ADULT_RATE + kidsOlder * CHILD_RATE;
  const successfulRegistrationSummary = successfulRegistration
    ? `${successfulRegistration.venue} · ${successfulRegistration.date} · ${successfulRegistration.adults + successfulRegistration.children_6_12 + successfulRegistration.children_under_6} persons · ₹${successfulRegistration.amount_paid.toLocaleString('en-IN')}`
    : null;

  useEffect(() => {
    if (successfulRegistration) {
      onRegistrationChange?.(true);
    }
  }, [successfulRegistration, onRegistrationChange]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAdults(1);
        setKidsOlder(0);
        setKidsUnder(0);
        setSubmitted(false);
        setExistingRegistration(null);
        setSuccessfulRegistration(null);
        setRegistrationCheckError('');
        setUserPhone(null);
        setIsCheckingRegistration(false);
        setPendingCashfreeOrderId(null);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    if (isOpen || checkoutOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen, checkoutOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let active = true;

    const checkExistingRegistration = async () => {
      if (!userEmail) {
        setExistingRegistration(null);
        setUserPhone(null);
        setRegistrationCheckError('');
        setIsCheckingRegistration(false);
        return;
      }

      setIsCheckingRegistration(true);
      setRegistrationCheckError('');

      try {
        const response = await apiFetch('/me');

        if (!active) return;

        if (!response.ok) {
          if (response.status === 401) {
            setExistingRegistration(null);
            return;
          }
          throw new Error('Unable to verify your registration right now.');
        }

        const data = await response.json();
        if (!active) return;

        const phoneFromProfile = typeof data.phone === 'string' ? data.phone.trim() : '';
        setUserPhone(phoneFromProfile || null);

        if (data.registration_status) {
          onRegistrationChange?.(true);
          setExistingRegistration({
            adults: Number(data.registered_adults || 0),
            children_6_12: Number(data.registered_children_6_12 || 0),
            children_under_6: Number(data.registered_children_under_6 || 0),
            amount_paid: Number(data.amount_paid || 0),
            venue: 'Axon Business Hotel',
            date: '19th July 2026',
            time: '6:00 PM Onwards',
          });
          setMuhuratCode(data.muhurat_code || null);
        } else {
          onRegistrationChange?.(false);
          setExistingRegistration(null);
          setMuhuratCode(null);
        }
      } catch (error) {
        if (!active) return;
        setExistingRegistration(null);
        setUserPhone(null);
        setRegistrationCheckError((error as Error)?.message || 'Unable to verify your registration right now.');
      } finally {
        if (active) {
          setIsCheckingRegistration(false);
        }
      }
    };

    checkExistingRegistration();

    loadCashfreeSdk()
      .then(() => {
        if (!active) return;
        if (window.Cashfree) {
          setCashfreeClient(window.Cashfree({ mode: 'sandbox' }));
        } else {
          setPaymentError('Cashfree SDK loaded but the client is unavailable.');
        }
      })
      .catch((error) => {
        if (active) setPaymentError((error as Error).message);
      });

    return () => {
      active = false;
    };
  }, [isOpen, userEmail]);

  useEffect(() => {
    if (!pendingPaymentSessionId || !cashfreeClient || !checkoutOpen || !checkoutMountRef.current) {
      return;
    }

    const paymentSessionId = pendingPaymentSessionId;

    cashfreeClient.checkout({
      paymentSessionId,
      redirectTarget: checkoutMountRef.current,
      appearance: {
        width: '100%',
        height: '100%',
      },
    }).then(async (result: any) => {
      const orderIdForRegistration = pendingCashfreeOrderId;
      setCheckoutOpen(false);
      setPendingPaymentSessionId(null);
      setPendingCashfreeOrderId(null);

      if (result.error) {
        setPaymentError(result.error.message || 'Payment failed in checkout');
        setIsProcessing(false);
        return;
      }

      if (result.paymentDetails) {
        if (!userEmail) {
          setPaymentError('Please log in before completing registration.');
          setIsProcessing(false);
          return;
        }

        const registrationResponse = await apiFetch('/meetup-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adults,
            children_6_12: kidsOlder,
            children_under_6: kidsUnder,
            cashfree_order_id: orderIdForRegistration,
          }),
        });

        if (!registrationResponse.ok) {
          const errorText = await registrationResponse.text();
          throw new Error(errorText || 'Failed to record registration after payment');
        }

        let regData: any = {};
        try {
          regData = await registrationResponse.json();
        } catch {
          regData = {};
        }

        onRegistrationChange?.(true);
        setSuccessfulRegistration({
          adults,
          children_6_12: kidsOlder,
          children_under_6: kidsUnder,
          amount_paid: total,
          venue: 'Axon Business Hotel',
          date: '19th July 2026',
          time: '6:00 PM Onwards',
        });
        setMuhuratCode(regData.muhurat_code || null);
        setSubmitted(true);
        setIsProcessing(false);
      }
    }).catch((error: any) => {
      setCheckoutOpen(false);
      setPendingPaymentSessionId(null);
      setPendingCashfreeOrderId(null);
      setPaymentError(error?.message || 'Payment failed in checkout');
      setIsProcessing(false);
    });
  }, [pendingPaymentSessionId, pendingCashfreeOrderId, cashfreeClient, checkoutOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!cashfreeClient) {
      setPaymentError('Payment system is loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);
    setPendingCashfreeOrderId(null);

    try {
      if (!userEmail) {
        throw new Error('Please log in before making a payment.');
      }

      const normalizedPhone = userPhone?.replace(/\D/g, '').trim();
      if (!normalizedPhone) {
        throw new Error('Please add a phone number to your profile before paying.');
      }

      const response = await apiFetch('/cashfree-orders', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adults,
          children_6_12: kidsOlder,
          children_under_6: kidsUnder,
          return_url: window.location.href,
        }),
      });

      const text = await response.text();
      let data: any = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const backendMessage = data?.message || data?.error;
        throw new Error(backendMessage || response.statusText || 'Failed to create payment order');
      }

      const paymentSessionId = data.payment_session_id ?? data.paymentSessionId;
      if (!paymentSessionId) {
        throw new Error('Payment session ID not provided by Cashfree');
      }

      const orderId = data.order_id ?? null;
      setPendingCashfreeOrderId(orderId);
      setCheckoutOpen(true);
      setPendingPaymentSessionId(paymentSessionId);
    } catch (error) {
      setPaymentError((error as Error)?.message || 'Payment failed, please try again.');
      setIsProcessing(false);
    }
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
        <button className="meetup-close" onClick={onClose} aria-label="Close">
        </button>

        <div className="meetup-page">

          {isCheckingRegistration ? (
            <div className="meetup-success">
              <div className="meetup-success-icon">
                <img src={searchCircleIcon} alt="Searching" style={{ width: '40px', height: '40px' }} />
              </div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>Checking registration</div>
              <h2 className="meetup-success-title">Looking up your Muhurat booking…</h2>
              <p className="meetup-success-desc">
                We’re confirming whether you already have a registration on record.
              </p>
            </div>
          ) : existingRegistration ? (
            <div className="meetup-success">
              <div className="meetup-success-icon">
                <img src={checkCircleIcon} alt="Success" style={{ width: '40px', height: '40px' }} />
              </div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>Already registered</div>
              <h2 className="meetup-success-title">You’re already on the <em>list!</em></h2>
              <p className="meetup-success-desc">
                We found your Muhurat registration. Here are the details:
              </p>

              <RegistrationDetails registration={existingRegistration} muhuratCode={muhuratCode} />
              {registrationCheckError && <p className="meetup-error" style={{ marginTop: '16px' }}>{registrationCheckError}</p>}

              <button className="btn-ghost" onClick={onClose} style={{ fontSize: '0.82rem', padding: '12px 40px', marginTop: '24px' }}>
                Close
              </button>
            </div>
          ) : !submitted ? (
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <img src={calendarIcon} alt="" style={{ width: '20px', height: '20px' }} />
                    19th July 2026
                  </span>
                  <span className="meetup-meta-dot" />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <img src={locationPinIcon} alt="" style={{ width: '20px', height: '20px' }} />
                    Axon Business Hotel
                  </span>
                  <span className="meetup-meta-dot" />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <img src={clockIcon} alt="" style={{ width: '20px', height: '20px' }} />
                    6:00 PM Onwards
                  </span>
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

                <button type="submit" id="meetup-register-submit" className="btn-primary meetup-submit" disabled={isProcessing || checkoutOpen}>
                  {isProcessing ? `Opening payment...` : `Pay ₹${total.toLocaleString('en-IN')}`}
                </button>

                {paymentError && <p className="meetup-error">{paymentError}</p>}

                <p className="meetup-footnote">
                  Payment will open in a popup overlay. Once completed, the overlay closes and the registration is confirmed.
                </p>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="meetup-success">
              <div className="meetup-success-icon">
                <img src={celebrationBurstIcon} alt="Success" style={{ width: '40px', height: '40px' }} />
              </div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>সফল · Success</div>
              <h2 className="meetup-success-title">You're on the <em>List!</em></h2>
              <p className="meetup-success-desc">
                {successfulRegistrationSummary || 'Your Muhurat registration has been confirmed.'}
              </p>

              {successfulRegistration && (
                <RegistrationDetails registration={successfulRegistration} muhuratCode={muhuratCode} />
              )}

              <button className="btn-ghost" onClick={onClose} style={{ fontSize: '0.82rem', padding: '12px 40px', marginTop: '24px' }}>
                Back to Events
              </button>
            </div>
          )}

        </div>
      </div>

      {checkoutOpen && (
        <div className="meetup-payment-overlay open">
          <div className="meetup-payment-modal" role="dialog" aria-modal="true" aria-label="Payment checkout">
            <button
              type="button"
              className="meetup-payment-close"
              aria-label="Close payment"
              onClick={() => {
                setCheckoutOpen(false);
                setPendingPaymentSessionId(null);
                setIsProcessing(false);
              }}
            >
              ✕
            </button>
            <div className="meetup-checkout-container" ref={checkoutMountRef} />
          </div>
        </div>
      )}
    </>
  );
}
