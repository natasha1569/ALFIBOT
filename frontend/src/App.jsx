import { useEffect, useState } from 'react';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
} from './auth/authStorage.js';
import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import './App.css';

export default function App() {
  const [activeUser, setActiveUser] = useState(() =>
    getAuthToken() ? getAuthUser() : null,
  );

  useEffect(() => {
    function refreshSession() {
      setActiveUser(getAuthToken() ? getAuthUser() : null);
    }

    window.addEventListener('alfi-auth-change', refreshSession);
    return () => window.removeEventListener('alfi-auth-change', refreshSession);
  }, []);

  function handleLogout() {
    clearAuthSession();
    setActiveUser(null);
  }

  if (!activeUser) {
    return <LoginPage onLogin={setActiveUser} />;
  }

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
