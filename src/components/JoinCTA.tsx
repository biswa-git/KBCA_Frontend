import useScrollReveal from '../hooks/useScrollReveal';

interface JoinCTAProps {
  isLoggedIn?: boolean;
  onOpenMembership?: () => void;
  onOpenProfile?: () => void;
}

export default function JoinCTA({ isLoggedIn, onOpenMembership }: JoinCTAProps) {
  const { refs, isVisible } = useScrollReveal(4);

  return (
    <section className="join-cta" id="join">
      <div className="join-cta-inner">
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
          যোগ দিন · Join Us
          <span style={{ width: '40px', height: '1px', background: 'var(--gold-dim)' }}></span>
        </div>
        <h2
          className={`reveal ${isVisible[0] ? 'visible' : ''}`}
          ref={refs[0]}
        >
          Carry Bengal
          <br />
          with <em>Pride.</em>
        </h2>
        <div
          className={`join-bengali reveal reveal-delay-1 ${
            isVisible[1] ? 'visible' : ''
          }`}
          ref={refs[1]}
        >
          আমাদের পরিবারের অংশ হন
        </div>
        <p
          className={`reveal reveal-delay-2 ${
            isVisible[2] ? 'visible' : ''
          }`}
          ref={refs[2]}
        >
          Whether you were born in Bengal or have simply fallen in love with her
          culture — you belong here. Join our family and become part of something
          that endures.
        </p>
        <div
          className={`reveal reveal-delay-3 ${
            isVisible[3] ? 'visible' : ''
          }`}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          ref={refs[3]}
        >
          <button
            onClick={(event) => {
              event.preventDefault();
              alert('Coming soon');
            }}
            className="btn-primary"
          >
            Become a Member
          </button>
          <a
            href="#"
            className="btn-ghost"
            onClick={(event) => {
              event.preventDefault();
              alert('Coming soon');
            }}
          >
            Volunteer With Us
          </a>
        </div>
      </div>
    </section>
  );
}
