import useScrollReveal from '../hooks/useScrollReveal';

interface EventsProps {
  isLoggedIn?: boolean;
  onOpenMembership?: () => void;
}

export default function Events({ isLoggedIn, onOpenMembership }: EventsProps) {
  const { refs, isVisible } = useScrollReveal(5);

  return (
    <section className="events" id="events">
      <div className="container">
        <div className={`events-header reveal ${isVisible[0] ? 'visible' : ''}`} ref={refs[0]}>
          <div>
            <div className="section-label">আসন্ন অনুষ্ঠান · Upcoming</div>
            <h2>Events & Celebrations</h2>
          </div>
          <a href="#" className="btn-ghost" style={{ fontSize: '0.78rem', padding: '11px 28px' }}>
            View Calendar
          </a>
        </div>
        <div className="events-grid">
          <div
            className={`event-card reveal ${isVisible[1] ? 'visible' : ''}`}
            ref={refs[1]}
          >
            <div className="event-date-block">
              <span className="event-month">July 2026</span>
              <div className="event-day">19</div>
            </div>
            <div className="event-bengali-title">খুঁটি পূজা</div>
            <h3 className="event-title">Muhurat (Khuti Puja)</h3>
            <p className="event-desc">
              The auspicious beginning of our Durga Puja journey. Join us for the traditional ceremony to mark the start of the celebrations.
            </p>
            <div style={{ marginTop: '48px' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (isLoggedIn) {
                    alert('Successfully registered for Muhurat (Khuti Puja)!');
                  } else if (onOpenMembership) {
                    onOpenMembership();
                  }
                }}
                className="btn-ghost"
                style={{ fontSize: '0.78rem', padding: '11px 28px' }}
              >
                Register Now
              </button>
              {!isLoggedIn && (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'rgba(250,247,242,0.5)', fontStyle: 'italic' }}>
                  * You need to be logged in to register.
                </div>
              )}
            </div>
            <div className="event-meta" style={{ marginTop: '48px' }}>
              <span>📍 Axon Business Hotel</span>
              <span className="dot"></span>
              <span>₹250 Entry</span>
              <span className="dot"></span>
              <span>6:00 PM Onwards</span>
            </div>
          </div>

          <div
            className={`event-card featured reveal reveal-delay-1 ${isVisible[2] ? 'visible' : ''}`}
            ref={refs[2]}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div className="event-date-block">
                <span className="event-month">October 2026</span>
                <div className="event-day">17-21</div>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  border: '1px solid var(--border-strong)',
                  padding: '5px 14px',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start',
                }}
              >
                Planning Underway
              </span>
            </div>
            <div className="event-bengali-title">দুর্গাপূজা ২০২৬</div>
            <h3 className="event-title">Durga Puja Mahotsav 2026</h3>
            <p className="event-desc" style={{ marginBottom: '28px' }}>
              Our most ambitious celebration yet — five days of devotion, art,
              and community in the heart of Kondapur. Here's what we're planning:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px',
              }}
            >
              <div style={{ border: '1px solid var(--border)', padding: '16px 18px' }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dim)',
                    marginBottom: '8px',
                  }}
                >
                  Saptami · Day 1-2
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--cream)', lineHeight: '1.6' }}>
                  Grand Pandal inauguration, Dhakis from West Bengal, Bodhon ceremony & evening
                  Rabindra Sangeet concert
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '16px 18px' }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dim)',
                    marginBottom: '8px',
                  }}
                >
                  Ashtami · Day 3
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--cream)', lineHeight: '1.6' }}>
                  Pushpanjali, classical dance recital, children's cultural programme & Kumari
                  Puja
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '16px 18px' }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dim)',
                    marginBottom: '8px',
                  }}
                >
                  Navami · Day 4
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--cream)', lineHeight: '1.6' }}>
                  Sandhi Puja, folk music night, adda, authentic Bengali food stalls & cultural
                  quiz
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '16px 18px' }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dim)',
                    marginBottom: '8px',
                  }}
                >
                  Dashami · Day 5
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--cream)', lineHeight: '1.6' }}>
                  Sindoor Khela, Bhashan procession, farewell programme & prize distribution
                </div>
              </div>
            </div>

            <div className="event-meta">
              <span>📍 Kondapur · Venue TBA</span>
              <span className="dot"></span>
              <span>5 Days</span>
              <span className="dot"></span>
              <span>All Welcome</span>
              <span className="dot"></span>
              <span>Free Entry</span>
            </div>
          </div>

          {/*
          <div
            className={`event-card reveal reveal-delay-1 ${isVisible[3] ? 'visible' : ''}`}
            ref={refs[3]}
          >
            <div className="event-date-block">
              <span className="event-month">May 2025</span>
              <div className="event-day">09</div>
            </div>
            <div className="event-bengali-title">রবীন্দ্র জয়ন্তী</div>
            <h3 className="event-title">Rabindra Jayanti</h3>
            <p className="event-desc">
              An evening celebrating the birth of the Bard — music, poetry, dance, and spoken
              word in the master's honour.
            </p>
            <div className="event-meta">
              <span>🎵 Musical Evening</span>
            </div>
          </div>

          <div
            className={`event-card reveal reveal-delay-2 ${isVisible[3] ? 'visible' : ''}`}
            ref={refs[3]}
          >
            <div className="event-date-block">
              <span className="event-month">January 2026</span>
              <div className="event-day">14</div>
            </div>
            <div className="event-bengali-title">পৌষ পার্বণ</div>
            <h3 className="event-title">Poush Parbon</h3>
            <p className="event-desc">
              Winter harvest festival with authentic Bengali sweets, pitha-making, folk music,
              and the warmth of community.
            </p>
            <div className="event-meta">
              <span>🍮 Food & Culture</span>
            </div>
          </div>

          <div
            className={`event-card reveal reveal-delay-3 ${isVisible[4] ? 'visible' : ''}`}
            ref={refs[4]}
          >
            <div className="event-date-block">
              <span className="event-month">April 2026</span>
              <div className="event-day">15</div>
            </div>
            <div className="event-bengali-title">নববর্ষ</div>
            <h3 className="event-title">Pohela Boishakh</h3>
            <p className="event-desc">
              Bengali New Year celebrations — shubho nababarsha! Processions, art, and a new
              beginning for the community.
            </p>
            <div className="event-meta">
              <span>🎊 New Year Celebration</span>
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
}
