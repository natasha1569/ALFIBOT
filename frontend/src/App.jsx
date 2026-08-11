import { useEffect, useState } from 'react';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
} from './auth/authStorage.js';

import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

import './App.css';

export default function App() {
  const [activeUser, setActiveUser] = useState(() =>
    getAuthToken() ? getAuthUser() : null,
  );

  const [publicView, setPublicView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    function refreshSession() {
      setActiveUser(getAuthToken() ? getAuthUser() : null);
    }

    window.addEventListener('alfi-auth-change', refreshSession);

    return () => {
      window.removeEventListener('alfi-auth-change', refreshSession);
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    setActiveUser(null);
    setPublicView('landing');
  }

  function openLogin(mode = 'login') {
    setAuthMode(mode);
    setPublicView('auth');
  }

  function handleLogin(user) {
    setActiveUser(user);
  }

  // Si no hay usuario autenticado
  if (!activeUser) {
    // Mostrar login o registro
    if (publicView === 'auth') {
      return (
        <LoginPage
          initialMode={authMode}
          onLogin={handleLogin}
          onBack={() => setPublicView('landing')}
        />
      );
    }

    // Mostrar primero la Landing Page
    return (
      <LandingPage
        onStart={() => openLogin('register')}
        onLogin={() => openLogin('login')}
      />
    );
  }

  // Usuario autenticado: mostrar ALFI BOT
  return (
    <>
      <div className="alfi-session-bar">
        <span>
          <i className="bi bi-person-circle"></i>
          {activeUser.name}
        </span>

        <button type="button" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          Cerrar sesión
        </button>
      </div>

      <Home />
    </>
  );
}