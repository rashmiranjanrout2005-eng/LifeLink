import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { corsOptions } from './config/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const frontendDist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BBMS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) return next();
  return res.sendFile(`${frontendDist}index.html`);
});

app.use(errorHandler);

export default app;
