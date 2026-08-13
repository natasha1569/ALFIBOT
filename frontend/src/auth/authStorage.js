const AUTH_TOKEN_KEY = 'alfiAuthToken';
const AUTH_USER_KEY = 'alfiAuthUser';
const REMEMBERED_EMAIL_KEY = 'alfiRememberedEmail';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getAuthUser = () => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const getRememberedEmail = () => (
  localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''
);

export const saveRememberedEmail = (email) => {
  const normalizedEmail = typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';

  if (!normalizedEmail) {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    return;
  }

  localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
};

export const clearRememberedEmail = () => {
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
};

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('alfi-auth-change'));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event('alfi-auth-change'));
};
