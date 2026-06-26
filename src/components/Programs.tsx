import useScrollReveal from '../hooks/useScrollReveal';

export default function Programs() {
  const { refs, isVisible } = useScrollReveal(2);

  return (
    <section className="programs" id="programs">
      <div className="container">
        <div className={`reveal ${isVisible[0] ? 'visible' : ''}`} ref={refs[0]}>
          <div className="section-label">কার্যক্রম · Programs</div>
          <h2>Cultural Programs</h2>
          <p className="programs-sub">
            Year-round initiatives that keep the Bengali spirit alive, connect
            generations, and nurture our arts.
          </p>
        </div>

        <div
          className={`reveal reveal-delay-1 ${isVisible[1] ? 'visible' : ''}`}
          ref={refs[1]}
          style={{
            textAlign: 'left',
            marginTop: '24px',
            marginBottom: '40px',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'var(--gold)',
            fontStyle: 'italic',
            lineHeight: 1.2,
          }}
        >
          Coming Soon...
        </div>
      </div>
    </section>
  );
}
