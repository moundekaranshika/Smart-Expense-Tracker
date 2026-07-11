import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db';
import authRoutes from './server/routes/authRoutes';
import transactionRoutes from './server/routes/transactionRoutes';
import budgetRoutes from './server/routes/budgetRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Parse incoming requests as JSON
  app.use(express.json());

  // 2. Connect database (Mongoose or Local fallback)
  await connectDB();

  // 3. API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/budgets', budgetRoutes);

  // Simple health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
  });

  // 4. Vite Dev Middleware / Production Static serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔄 Running in DEVELOPMENT mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('🚀 Running in PRODUCTION mode. Serving static files from dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve client router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Smart Expense Tracker server booting up on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal Server Boot Error:', error);
});
