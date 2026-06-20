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

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetch('http://localhost:8000/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch user');
      })
      .then(data => {
        if (data.full_name) {
          setUserName(data.full_name);
        }
      })
      .catch(err => console.error(err));
    } else {
      setUserName(null);
    }
  }, [showLoginModal, showProfileModal]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setShowProfileModal(false);
    window.location.reload();
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
        onClose={() => setShowLoginModal(false)}
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
