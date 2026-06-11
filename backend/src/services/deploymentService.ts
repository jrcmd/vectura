export function getDeploymentConfig() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const domain = process.env.DOMAIN ?? null;
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL ?? process.env.VITE_API_URL?.replace(/\/api$/, '') ?? null;
  const apiBaseUrl = process.env.API_BASE_URL ?? process.env.VITE_API_URL ?? null;

  return {
    nodeEnv,
    domain,
    sslMode: process.env.SSL_MODE ?? 'external',
    frontendBaseUrl,
    apiBaseUrl,
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.FROM_EMAIL),
    backupEnabled: process.env.BACKUP_ENABLED !== 'false',
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 10),
    jwtExpirationConfigured: Boolean(process.env.JWT_SECRET && process.env.JWT_ACCESS_EXPIRATION),
  };
}

export function getProductionReadiness() {
  const config = getDeploymentConfig();
  const checks = [
    { name: 'NODE_ENV', ok: config.nodeEnv === 'production', value: config.nodeEnv },
    { name: 'DOMAIN', ok: Boolean(config.domain), value: config.domain },
    { name: 'SSL_MODE', ok: config.sslMode === 'external' || config.sslMode === 'managed', value: config.sslMode },
    { name: 'DATABASE_URL', ok: config.databaseUrlConfigured, value: config.databaseUrlConfigured ? 'configured' : 'missing' },
    { name: 'JWT', ok: config.jwtExpirationConfigured, value: config.jwtExpirationConfigured ? 'configured' : 'missing' },
    { name: 'SMTP', ok: config.smtpConfigured, value: config.smtpConfigured ? 'configured' : 'missing' },
    { name: 'BACKUP', ok: config.backupEnabled, value: config.backupEnabled ? 'enabled' : 'disabled' },
  ];

  return {
    ok: checks.every((check) => check.ok),
    checks,
  };
}
