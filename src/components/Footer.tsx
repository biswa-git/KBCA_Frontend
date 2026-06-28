interface FooterProps {
  isLoggedIn?: boolean;
  onOpenMembership?: () => void;
  onOpenProfile?: () => void;
}

export default function Footer({ isLoggedIn, onOpenMembership, onOpenProfile }: FooterProps) {
  const FacebookIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.558 1.587-1.558l1.684-.001V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );

  const EmailIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">KBCA</div>
            <div className="footer-brand-bengali">কোন্ডাপুর বাঙালি সাংস্কৃতিক সংঘ</div>
            <p className="footer-tagline">
              Preserving the luminous heritage of Bengal in the heart of
              Hyderabad, one celebration at a time.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li>
                <a href="#about">Our Story</a>
              </li>
              <li>
                <a href="#events">Events</a>
              </li>
              <li>
                <a href="#programs">Programs</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Community</div>
            <ul className="footer-links">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn && onOpenProfile) onOpenProfile();
                    else if (onOpenMembership) onOpenMembership();
                  }}
                >
                  {isLoggedIn ? 'Your Profile' : 'Login/Register'}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn) {
                      alert('Coming soon');
                    }
                  }}
                >
                  Gallery
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn) {
                      alert('Coming soon');
                    }
                  }}
                >
                  Newsletter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn) {
                      alert('Coming soon');
                    }
                  }}
                >
                  Volunteer
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61589405496972"
                target="_blank"
                rel="noopener"
                className="social-icon"
                aria-label="Facebook"
              >
                <FacebookIcon />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/officialkbca/"
                target="_blank"
                rel="noopener"
                className="social-icon"
                aria-label="Instagram"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a
                href="mailto:support@kbcahyd.co.in"
                className="social-icon"
                aria-label="Email"
              >
                <EmailIcon />
                <span>support@kbcahyd.co.in</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 Kondapur Bengali Cultural Association ·
            <a
              href="mailto:support@kbcahyd.co.in"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.3s',
                marginLeft: '4px',
              }}
              onMouseOver={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#C9A84C';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLAnchorElement).style.color = 'inherit';
              }}
            >
              support@kbcahyd.co.in
            </a>
          </div>
          <div className="footer-kondapur">
            Kondapur · Hyderabad · Telangana
          </div>
        </div>
      </div>
    </footer>
  );
}
