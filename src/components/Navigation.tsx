import { useEffect, useState } from 'react';
import stampBengali from '../assets/stamp_bengali_golden.svg';

interface NavigationProps {
  onOpenMembership?: () => void;
  onOpenProfile?: () => void;
  isLoggedIn?: boolean;
  userName?: string | null;
}

export default function Navigation({ onOpenMembership, onOpenProfile, isLoggedIn, userName }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={isScrolled ? 'scrolled' : ''}>
      <a className="nav-logo" href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src={stampBengali}
          alt="KBCA Stamp"
          style={{
            width: '52px',
            height: '52px',
            objectFit: 'contain',
          }}
        />
        KBCA <span>·</span> কোন্ডাপুর
      </a>
      <ul className="nav-links">
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#events">Events</a>
        </li>
        <li>
          <a href="#programs">Programs</a>
        </li>
      </ul>
      {isLoggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userName && (
            <span style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
              {userName}
            </span>
          )}
          <button
            className="nav-cta profile-btn"
            onClick={onOpenProfile}
            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            title="User Profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      ) : (
        <button className="nav-cta" onClick={onOpenMembership}>Login/Register</button>
      )}
    </nav>
  );
}
