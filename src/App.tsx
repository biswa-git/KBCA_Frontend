import { useCallback, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import Programs from './components/Programs';
import JoinCTA from './components/JoinCTA';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
import MeetupRegistrationModal from './components/MeetupRegistrationModal';
import { apiFetch } from './api';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasMuhuratRegistration, setHasMuhuratRegistration] = useState(false);

  // Password-reset token extracted from the URL (?token=...)
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
      apiFetch('/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user');
        })
        .then(data => {
          if (data.full_name) setUserName(data.full_name);
          if (data.email) setUserEmail(data.email);
          setHasMuhuratRegistration(Boolean(data.registration_status));
        })
        .catch(err => console.error(err));
    } else {
      setUserName(null);
      setUserEmail(null);
      setHasMuhuratRegistration(false);
    }
  }, [showLoginModal, showProfileModal]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserName(null);
    setHasMuhuratRegistration(false);
    setShowProfileModal(false);
    setShowLoginModal(false);
    setResetToken(''); // clear any stale reset token so re-opening login shows the login view
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => handleLogout();
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [handleLogout]);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    // If it was a reset flow, clean the token from state (URL already cleaned by the modal)
    setResetToken('');
  };

  return (
    <div className={`app-wrapper ${showLoginModal || showProfileModal ? 'member-panel-open' : ''}`}>
      <Navigation
        isLoggedIn={isLoggedIn}
        userName={userName}
        onOpenMembership={() => setShowLoginModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <div className="app-main">
        <Hero />
        <About />
        <Events
          isLoggedIn={isLoggedIn}
          hasMuhuratRegistration={hasMuhuratRegistration}
          onOpenMembership={() => setShowLoginModal(true)}
          onOpenMeetup={() => setShowMeetupModal(true)}
        />
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

      <MeetupRegistrationModal
        isOpen={showMeetupModal}
        onClose={() => setShowMeetupModal(false)}
        userEmail={userEmail}
      />
    </div>
  );
}

export default App;
