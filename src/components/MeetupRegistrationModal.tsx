import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => any;
  }
}

const CASHFREE_SDK_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js';
const CASHFREE_BACKEND_ORDER_URL = '/api/cashfree-orders';

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

export default function MeetupRegistrationModal({ isOpen, onClose, userEmail }: MeetupRegistrationModalProps) {
  const [adults, setAdults] = useState(1);
  const [kidsOlder, setKidsOlder] = useState(0);
  const [kidsUnder, setKidsUnder] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<MeetupRegistrationDetails | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [registrationCheckError, setRegistrationCheckError] = useState('');
  const [cashfreeClient, setCashfreeClient] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pendingPaymentSessionId, setPendingPaymentSessionId] = useState<string | null>(null);
  const checkoutMountRef = useRef<HTMLDivElement | null>(null);

  const total = adults * ADULT_RATE + kidsOlder * CHILD_RATE;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAdults(1);
        setKidsOlder(0);
        setKidsUnder(0);
        setSubmitted(false);
        setExistingRegistration(null);
        setRegistrationCheckError('');
        setIsCheckingRegistration(false);
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
        setRegistrationCheckError('');
        setIsCheckingRegistration(false);
        return;
      }

      setIsCheckingRegistration(true);
      setRegistrationCheckError('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await apiFetch(`${apiUrl}/me`);

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

        if (data.registration_status) {
          setExistingRegistration({
            adults: Number(data.registered_adults || 0),
            children_6_12: Number(data.registered_children_6_12 || 0),
            children_under_6: Number(data.registered_children_under_6 || 0),
            amount_paid: Number(data.amount_paid || 0),
            venue: 'Axon Business Hotel',
            date: '19th July 2026',
            time: '6:00 PM Onwards',
          });
        } else {
          setExistingRegistration(null);
        }
      } catch (error) {
        if (!active) return;
        setExistingRegistration(null);
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
      setCheckoutOpen(false);
      setPendingPaymentSessionId(null);

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

        const apiUrl = import.meta.env.VITE_API_URL;
        const registrationResponse = await apiFetch(`${apiUrl}/meetup-registration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adults,
            children_6_12: kidsOlder,
            children_under_6: kidsUnder,
            amount_paid: total,
          }),
        });

        if (!registrationResponse.ok) {
          const errorText = await registrationResponse.text();
          throw new Error(errorText || 'Failed to record registration after payment');
        }

        setSubmitted(true);
        setIsProcessing(false);
      }
    }).catch((error: any) => {
      setCheckoutOpen(false);
      setPendingPaymentSessionId(null);
      setPaymentError(error?.message || 'Payment failed in checkout');
      setIsProcessing(false);
    });
  }, [pendingPaymentSessionId, cashfreeClient, checkoutOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!cashfreeClient) {
      setPaymentError('Payment system is loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = `kbca_meetup_${Date.now()}`;
      if (!userEmail) {
        throw new Error('Please log in before making a payment.');
      }

      const response = await fetch(CASHFREE_BACKEND_ORDER_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_amount: Number(total.toFixed(2)),
          order_currency: 'INR',
          order_id: orderId,
          customer_details: {
            customer_id: orderId,
            customer_phone: '9999999999',
          },
          order_meta: {
            return_url: window.location.href,
          },
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
        <button className="meetup-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="meetup-page">

          {isCheckingRegistration ? (
            <div className="meetup-success">
              <div className="meetup-success-icon">🔎</div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>Checking registration</div>
              <h2 className="meetup-success-title">Looking up your Muhurat booking…</h2>
              <p className="meetup-success-desc">
                We’re confirming whether you already have a registration on record.
              </p>
            </div>
          ) : existingRegistration ? (
            <div className="meetup-success">
              <div className="meetup-success-icon">✅</div>
              <div className="meetup-eyebrow" style={{ justifyContent: 'center' }}>Already registered</div>
              <h2 className="meetup-success-title">You’re already on the <em>list!</em></h2>
              <p className="meetup-success-desc">
                We found your Muhurat registration. Here are the details we have on file.
              </p>

              <div style={{ marginTop: '24px', width: '100%', padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(255, 215, 130, 0.18)', background: 'rgba(250, 247, 242, 0.03)' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-dim)', marginBottom: '12px' }}>
                  Registration details
                </div>
                <div style={{ display: 'grid', gap: '10px', textAlign: 'left', color: 'var(--cream)' }}>
                  <div><strong>Venue:</strong> {existingRegistration.venue}</div>
                  <div><strong>Date:</strong> {existingRegistration.date}</div>
                  <div><strong>Time:</strong> {existingRegistration.time}</div>
                  <div><strong>Total persons:</strong> {existingRegistration.adults + existingRegistration.children_6_12 + existingRegistration.children_under_6}</div>
                  <div><strong>Adults:</strong> {existingRegistration.adults}</div>
                  <div><strong>Children (6–12):</strong> {existingRegistration.children_6_12}</div>
                  <div><strong>Children (Under 6):</strong> {existingRegistration.children_under_6}</div>
                  <div><strong>Amount paid:</strong> ₹{existingRegistration.amount_paid.toLocaleString('en-IN')}</div>
                </div>
              </div>

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
