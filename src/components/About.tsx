import useScrollReveal from '../hooks/useScrollReveal';

export default function About() {
  const { refs, isVisible } = useScrollReveal(2);

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-grid">
          <div
            className={`about-text reveal ${
              isVisible[0] ? 'visible' : ''
            }`}
            ref={refs[0]}
          >
            <div className="section-label">আমাদের কথা · Our Story</div>
            <h2>
              Born of <em>Nostalgia,</em>
              <br />
              Built on Belonging
            </h2>
            <div className="divider-motif">
              <div className="divider-motif-inner">✦</div>
            </div>
            <p>
              In the sprawling tech corridors of Kondapur, a small flame of
              Bengal refused to go out. Kondapur Bengali Cultural Association
              was born from the longing of families who carried within them the
              fragrance of Durga Puja pandals, the melody of Rabindra Sangeet,
              and the magic of adda over chai.
            </p>
            <p>
              We are a community — over 400 families strong — who believe that
              culture is not something you leave behind when you move cities. It
              is something you carry forward, celebrate, and share with the next
              generation.
            </p>
            <div style={{ marginTop: '36px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <a href="#programs" className="btn-ghost" style={{ fontSize: '0.78rem', padding: '11px 28px' }}>
                Explore Programs
              </a>
            </div>
          </div>
          <div
            className={`about-visual reveal reveal-delay-2 ${
              isVisible[1] ? 'visible' : ''
            }`}
            ref={refs[1]}
          >
            <div className="tagore-quote-block">
              <div className="gold-accent-line"></div>
              <div className="tagore-bengali-quote">
                যদি তোর ডাক শুনে কেউ না আসে
              </div>
              <div className="tagore-quote-text">
                "If no one responds to your call, then walk alone, O my soul."
              </div>
              <div className="tagore-attr">
                — রবীন্দ্রনাথ ঠাকুর · Rabindranath Tagore
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
