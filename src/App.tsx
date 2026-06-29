import { useCallback, useEffect, useState } from 'react';

import sponsorTitleLogo from './assets/sponsor_title.jpg';
import sponsorOtherLogo from './assets/sponsor_others.jpg';

const REGISTRATION_STATE_KEY = 'kbca_has_muhurat_registration';
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
  const [hasMuhuratRegistration, setHasMuhuratRegistration] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem(REGISTRATION_STATE_KEY) === 'true';
  });

  // Password-reset token extracted from the URL (?token=...)
  const [resetToken, setResetToken] = useState('');
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeSponsorIndex, setActiveSponsorIndex] = useState(0);
  const [sponsorsReady, setSponsorsReady] = useState(false);

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
    const intervalId = window.setInterval(() => {
      setLoadProgress(prev => Math.min(100, prev + Math.floor(Math.random() * 10) + 4));
    }, 75);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const firstSponsorTimer = window.setTimeout(() => {
      setActiveSponsorIndex(1);
    }, 3000);

    return () => window.clearTimeout(firstSponsorTimer);
  }, []);

  useEffect(() => {
    if (activeSponsorIndex !== 1) {
      return undefined;
    }

    const secondSponsorTimer = window.setTimeout(() => {
      setSponsorsReady(true);
    }, 3000);

    return () => window.clearTimeout(secondSponsorTimer);
  }, [activeSponsorIndex]);

  useEffect(() => {
    if (loadProgress >= 100 && sponsorsReady) {
      const readyTimeout = window.setTimeout(() => setLoadingDone(true), 450);
      return () => window.clearTimeout(readyTimeout);
    }

    return undefined;
  }, [loadProgress, sponsorsReady]);

  useEffect(() => {
    document.body.style.overflow = !loadingDone ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [loadingDone]);

  const syncRegistrationState = useCallback((registered: boolean) => {
    setHasMuhuratRegistration(registered);
    localStorage.setItem(REGISTRATION_STATE_KEY, registered ? 'true' : 'false');
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
          syncRegistrationState(Boolean(data.registration_status));
        })
        .catch(err => console.error(err));
    } else {
      setUserName(null);
      setUserEmail(null);
      syncRegistrationState(false);
    }
  }, [showLoginModal, showProfileModal, syncRegistrationState]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUserName(null);
    syncRegistrationState(false);
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
    <>
      {!loadingDone && (
        <div className="page-loader">
          <div className="loader-shell">
            <div className="loader-headline">Preparing sponsor showcase</div>
            <div className="loader-logo-grid">
              {activeSponsorIndex === 0 && (
                <div className="loader-logo-card active">
                  <img src={sponsorTitleLogo} alt="Title sponsor logo" />
                  <span>Title Sponsor</span>
                </div>
              )}
              {activeSponsorIndex === 1 && (
                <div className="loader-logo-card active">
                  <img src={sponsorOtherLogo} alt="Supporting sponsor logo" />
                  <span>Supporting Sponsor</span>
                </div>
              )}
            </div>
            <div className="loader-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${loadProgress}%` }} />
              </div>
              <div className="progress-copy">
                <span>{loadProgress}%</span>
                <span>{loadProgress < 100 ? 'Syncing visuals' : 'Ready to explore'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`app-wrapper ${showLoginModal || showProfileModal ? 'member-panel-open' : ''} ${!loadingDone ? 'app-blur' : ''}`}>
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
        onRegistrationChange={syncRegistrationState}
      />
    </>
  );
}

export default App;
