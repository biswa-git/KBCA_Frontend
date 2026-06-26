import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import Programs from './components/Programs';
import JoinCTA from './components/JoinCTA';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
import { apiFetch } from './api';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Password-reset token extracted from the URL (?reset_token=...)
  const [resetToken, setResetToken] = useState('');

  // On mount: detect reset-password route or token query param and open the reset modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const isResetPath = window.location.pathname.endsWith('/reset-password');

    if (token || isResetPath) {
      if (token) {
        setResetToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setShowLoginModal(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (token) {
      const apiUrl = import.meta.env.VITE_API_URL;
      apiFetch(`${apiUrl}/me`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user');
        })
        .then(data => {
          if (data.full_name) setUserName(data.full_name);
        })
        .catch(err => console.error(err));
    } else {
      setUserName(null);
    }
  }, [showLoginModal, showProfileModal]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setShowProfileModal(false);
    window.location.reload();
  };

  useEffect(() => {
    const handleAuthExpired = () => handleLogout();
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    // If it was a reset flow, clean the token from state (URL already cleaned by the modal)
    setResetToken('');
  };

  return (
    <div className={`app-wrapper ${showLoginModal || showProfileModal ? 'member-panel-open' : ''}`}>
      <CustomCursor />
      <Navigation
        isLoggedIn={isLoggedIn}
        userName={userName}
        onOpenMembership={() => setShowLoginModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <div className="app-main">
        <Hero />
        <About />
        <Events isLoggedIn={isLoggedIn} onOpenMembership={() => setShowLoginModal(true)} />
        <Programs />
        <JoinCTA isLoggedIn={isLoggedIn} onOpenMembership={() => setShowLoginModal(true)} onOpenProfile={() => setShowProfileModal(true)} />
        <Footer isLoggedIn={isLoggedIn} onOpenMembership={() => setShowLoginModal(true)} onOpenProfile={() => setShowProfileModal(true)} />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        resetToken={resetToken}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
