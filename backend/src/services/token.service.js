import crypto from 'crypto';
import { authTokenConfig } from '../config/auth.config.js';

const encode = (value) => {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
};

const decode = (value) => {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
};

const signPayload = (encodedPayload) => {
  return crypto
    .createHmac('sha256', authTokenConfig.secret)
    .update(encodedPayload)
    .digest('base64url');
};

export const createAuthToken = (user) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + authTokenConfig.expiresInSeconds,
  };

  const encodedPayload = encode(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  if (typeof token !== 'string' || !token.includes('.')) {
    throw new Error('Token inválido.');
  }

  const [encodedPayload, receivedSignature] = token.split('.');
  const expectedSignature = signPayload(encodedPayload);
  const receivedBuffer = Buffer.from(receivedSignature || '', 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error('Firma de token inválida.');
  }

  const payload = decode(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) {
    throw new Error('Token expirado.');
  }

  return payload;
};
