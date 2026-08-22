import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { runBootstrap } from './services/bootstrap.service';
import { requireAuthViaHeaderOrQuery } from './middleware/authViaQuery';

import authRoutes from './routes/auth.routes';
import doctorsRoutes from './routes/doctors.routes';
import appointmentsRoutes from './routes/appointments.routes';
import slotsRoutes from './routes/slots.routes';
import chatRoutes from './routes/chat.routes';
import notificationsRoutes from './routes/notifications.routes';
import patientProfileRoutes from './routes/patientProfile.routes';
import reviewsRoutes from './routes/reviews.routes';
import adminRoutes from './routes/admin.routes';
import contentRoutes from './routes/content.routes';
import servicesRoutes from './routes/services.routes';
import uploadRoutes from './routes/upload.routes';
import eventsRoutes from './routes/events.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' })); // generous limit: attachments arrive as base64 JSON

// Serve uploaded files (attachments, avatars, medical documents) - gated
// behind a valid login. Attachments can include patient reports and
// prescriptions, so these must never be publicly reachable by URL alone.
// The frontend should append "?token=<jwt>" when linking directly to a
// file (e.g. in an <img>/<a> tag), since those can't send an Authorization
// header.
app.use('/uploads', requireAuthViaHeaderOrQuery, express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/patient-profile', patientProfileRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/ai', aiRoutes);

// 404 for anything under /api that didn't match a route above.
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

app.use(errorHandler);

async function start() {
  await runBootstrap();

  app.listen(env.port, () => {
    console.log(`DocPulse backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
