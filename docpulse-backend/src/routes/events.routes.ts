import { Router, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { addClient, removeClient } from '../services/sse.service';

const router = Router();

/**
 * The frontend opens this with the browser's native EventSource API, which
 * cannot set custom headers - so the auth token travels as a query param
 * instead of an Authorization header (see services/api.ts -> subscribeEvents).
 */
router.get('/', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const token = req.query.token as string;

  if (!userId || !token) {
    return res.status(401).json({ success: false, message: 'userId and token are required.' });
  }

  try {
    const payload = verifyToken(token);
    if (payload.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Token does not match userId.' });
    }
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (nginx) so events flush immediately
  });
  res.write('\n');

  addClient(userId, res);

  // Keep the connection alive through proxies/load balancers that time out
  // idle connections (e.g. after ~30-60s of silence).
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});

export default router;
