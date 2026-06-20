export default function Hero() {

  return (
    <section className="hero" id="hero">
      <div className="hero-bg"></div>

      <p className="hero-tagline-pre">Kondapur · Hyderabad · Est. 2026</p>
      <div className="hero-bengali">কোন্ডাপুর বাঙালি সাংস্কৃতিক সংঘ</div>
      <h1 className="hero-title">
        Where <em>Culture</em>
        <br />
        Finds Its Home
      </h1>
      <p className="hero-subtitle">
        A gathering of Bengali hearts in the heart of Hyderabad — celebrating
        language, art, music, and the living legacy of our ancestors.
      </p>
      <div className="hero-ctas">
        <a href="#events" className="btn-primary">
          Upcoming Events
        </a>
        <a href="#about" className="btn-ghost">
          Our Story
        </a>
      </div>
    </section>
  );
}
