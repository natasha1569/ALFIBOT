import 'dotenv/config';

const resolveTokenSecret = () => {
  const configuredSecret = String(process.env.AUTH_TOKEN_SECRET || "").trim();

  if (!configuredSecret) {
    throw new Error(
      "AUTH_TOKEN_SECRET es obligatorio para iniciar ALFI BOT."
    );
  }

  if (configuredSecret.length < 32) {
    throw new Error(
      "AUTH_TOKEN_SECRET debe contener al menos 32 caracteres."
    );
  }

  return configuredSecret;
};

export const authTokenConfig = {
  secret: resolveTokenSecret(),
  expiresInSeconds: Number(process.env.AUTH_TOKEN_EXPIRES_SECONDS || 7200),
};
