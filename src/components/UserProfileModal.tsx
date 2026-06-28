import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import closeCircleIcon from '../assets/close-circle.svg';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface UserProfile {
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
}

export default function UserProfileModal({ isOpen, onClose, onLogout }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fetch user data when opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');

      apiFetch('/me')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile data');
        return res.json();
      })
      .then(data => {
        setProfile(data);
      })
      .catch(err => {
        setError(err.message || 'Error fetching profile data');
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen && !profile) return null;

  return (
    <section className={`become-member ${isOpen ? 'open' : ''}`}>
      <div className="become-member-content">
        <button className="close-btn" onClick={onClose} aria-label="Close profile">
          <img src={closeCircleIcon} alt="Close" style={{ width: '18px', height: '18px' }} />
        </button>

        <div className="become-member-inner">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 300, color: "var(--cream)", marginBottom: "24px", textAlign: "center" }}>
            User <em>Profile</em>
          </h2>

        {loading && <p style={{ color: 'var(--gold)', textAlign: 'center' }}>Loading...</p>}
        {error && <p style={{ color: 'var(--red-bindi)', textAlign: 'center' }}>{error}</p>}

        {!loading && !error && profile && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dim)', display: 'block', marginBottom: '4px' }}>Name</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--cream)' }}>{profile.full_name}</span>
            </div>
            
            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dim)', display: 'block', marginBottom: '4px' }}>Email</span>
              <span style={{ fontSize: '1.05rem', color: 'var(--cream)' }}>{profile.email}</span>
            </div>

            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dim)', display: 'block', marginBottom: '4px' }}>Phone</span>
              <span style={{ fontSize: '1.05rem', color: 'var(--cream)' }}>{profile.phone || 'Not provided'}</span>
            </div>


          </div>
        )}

        <button 
          className="btn-primary" 
          onClick={onLogout} 
          style={{ width: '100%', marginTop: '12px' }}
        >
          Logout
        </button>
        </div>
      </div>
    </section>
  );
}
