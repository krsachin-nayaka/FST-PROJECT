import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app.ts';
import { initDatabase, dbState } from './server/services/db.service.ts';
import { env } from './server/config/env.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApp();

  // Initialize Database (MongoDB with embedded fallback)
  await initDatabase();

  const isProduction = env.NODE_ENV === 'production';
  const port = env.PORT || 3000;

  if (!isProduction) {
    // In development, attach Vite development middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(port),
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('⚡ Vite dev server middleware mounted');
  } else {
    // In production, serve the compiled client from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🛡️ PhishGuard server running at http://0.0.0.0:${port}`);
    console.log(`📊 Storage engine: ${dbState.provider} (${dbState.connected ? 'connected' : 'active'})`);
    console.log(`🎓 Developed by: K R SACHIN (USN: 1NH23CS106)`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Gracefully shutting down PhishGuard server...');
    server.close(() => {
      console.log('Server terminated. Goodbye.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal error starting PhishGuard server:', err);
  process.exit(1);
});
