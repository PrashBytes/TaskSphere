const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  throw dotenvResult.error;
}

const requiredEnvVars = ['PORT', 'JWT_SECRET'];

const parseMongoUri = (mongoUri) => {
  try {
    const parsed = new URL(mongoUri);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      database: parsed.pathname.replace(/^\//, '') || '(default)'
    };
  } catch (_error) {
    const protocolMatch = mongoUri.match(/^(mongodb(?:\+srv)?):\/\//i);
    const hostnameMatch = mongoUri.match(/@([^/?]+)/);
    const databaseMatch = mongoUri.match(/\/([^/?]+)(?:\?|$)/);

    return {
      protocol: protocolMatch?.[1] || 'unknown',
      hostname: hostnameMatch?.[1] || 'unknown',
      database: databaseMatch?.[1] || '(default)'
    };
  }
};

const maskMongoUri = (mongoUri) =>
  mongoUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.*)/i, '$1***$3');

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const mongoUri = process.env.MONGO_URI?.trim() || '';
const mongoInfo = mongoUri ? parseMongoUri(mongoUri) : null;

console.log(`[env] Loaded environment from ${envPath}`);
if (mongoUri && mongoInfo) {
  console.log(`[env] MongoDB protocol: ${mongoInfo.protocol}`);
  console.log(`[env] MongoDB host: ${mongoInfo.hostname}`);
  console.log(`[env] MongoDB database: ${mongoInfo.database}`);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri,
  maskedMongoUri: mongoUri ? maskMongoUri(mongoUri) : '',
  mongoHostname: mongoInfo ? mongoInfo.hostname : '',
  mongoProtocol: mongoInfo ? mongoInfo.protocol : '',
  mongoDatabase: mongoInfo ? mongoInfo.database : '',
  jwtSecret: process.env.JWT_SECRET,
  jwtSecretLoaded: Boolean(process.env.JWT_SECRET),
  frontendUrl: process.env.FRONTEND_URL || '',
  demoMode: true
};
