export default () => ({
  port: parseInt(process.env.PORT || '8101', 10),
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'auth_service_dev',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
    encryption: process.env.DB_ENCRYPTION === 'true',
  },
  jwt: {
    symmetricEncryption: process.env.JWT_SYMMETRIC_ENCRYPTION !== 'true',
    secret: process.env.JWT_SECRET_KEY || 'dev_jwt_secret_key',
    publicKey: process.env.JWT_PUBLIC_KEY || './keys/public.key',
    privateKey: process.env.JWT_PRIVATE_KEY || './keys/private.key',
    symmetricKey: process.env.JWT_SYMMETRIC_KEY || './keys/symmetric.key',
    expiresIn: process.env.JWT_EXPIRATION_TIME || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    audience: process.env.JWT_AUDIENCE || 'auth-service',
    issuer: process.env.JWT_ISSUER || 'auth-server',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
    minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH || '12', 10),
    passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    passwordRequireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    loginLockoutTime: process.env.LOGIN_LOCKOUT_TIME || '15m',
  },
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',') 
      : ['http://localhost:3000'],
  },
}); 