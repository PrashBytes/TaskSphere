const env = require('./config/env');
const app = require('./app');
const { seedDemoData } = require('./utils/demoStore');

const startServer = async () => {
  console.log('[startup] Bootstrapping TaskSphere backend');
  console.log('[startup] Running in demo mode without MongoDB');
  console.log(`[startup] JWT secret present: ${env.jwtSecretLoaded ? 'yes' : 'no'}`);

  await seedDemoData();

  const server = app.listen(env.port, () => {
    console.log(`[startup] API server listening on port ${env.port}`);
  });

  server.on('error', (error) => {
    console.error('[startup] HTTP server failed to start:', error.message);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error('[startup] Failed to start backend:', error.message);
  process.exit(1);
});
