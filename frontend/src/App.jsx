import { useEffect, useState } from 'react';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
} from './auth/authStorage.js';

import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RoleLoginPage from './pages/RoleLoginPage.jsx';
import RolePortal from './pages/RolePortal.jsx';

import './App.css';

const App = () => {
  const [activeUser, setActiveUser] = useState(() =>
    getAuthToken() ? getAuthUser() : null,
  );

  const [publicView, setPublicView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');

  const [pathname, setPathname] = useState(() => window.location.pathname);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  };

  useEffect(() => {
    const refreshSession = () => {
      setActiveUser(getAuthToken() ? getAuthUser() : null);
    };

    window.addEventListener('alfi-auth-change', refreshSession);
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('alfi-auth-change', refreshSession);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setActiveUser(null);
    setPublicView('landing');
    navigate('/');
  };

  const openLogin = (mode = 'login') => {
    setAuthMode(mode);
    setPublicView('auth');
  };

  const handleLogin = (user) => {
    setActiveUser(user);
    const destination = {
      administrador: '/admin',
      auditor: '/auditor',
      usuario: '/app',
    }[user.role] || '/';
    navigate(destination);
  };

  // Si no hay usuario autenticado
  if (!activeUser) {
    if (pathname === '/admin/login') {
      return (
        <RoleLoginPage
          role="administrador"
          onLogin={handleLogin}
          onBack={() => navigate('/')}
        />
      );
    }

    if (pathname === '/auditor/login') {
      return (
        <RoleLoginPage
          role="auditor"
          onLogin={handleLogin}
          onBack={() => navigate('/')}
        />
      );
    }

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

  if (activeUser.role === 'administrador') {
    if (!pathname.startsWith('/admin')) {
      navigate('/admin');
      return null;
    }

    return (
      <RolePortal
        user={activeUser}
        onLogout={handleLogout}
      />
    );
  }

  if (activeUser.role === 'auditor') {
    if (!pathname.startsWith('/auditor')) {
      navigate('/auditor');
      return null;
    }

    return (
      <RolePortal
        user={activeUser}
        onLogout={handleLogout}
      />
    );
  }

  if (activeUser.role !== 'usuario') {
    clearAuthSession();
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          La sesión no contiene un rol autorizado.
        </div>
      </main>
    );
  }

  if (pathname !== '/app') {
    navigate('/app');
    return null;
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
};

export default App;
