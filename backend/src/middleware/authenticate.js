import { firebaseAuth, isFirebaseConfigured } from '../config/firebase.js';

const useDemoMode = process.env.USE_DEMO_MODE === 'true' &&
  process.env.NODE_ENV !== 'production' &&
  !isFirebaseConfigured;

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (useDemoMode && (!authHeader || token === 'demo-token' || token === 'demo')) {
    req.user = {
      id: 'demo-user',
      email: 'demo@bbms.local',
      role: 'admin',
      demoMode: true
    };
    return next();
  }

  if (!isFirebaseConfigured) {
    return res.status(503).json({
      success: false,
      message: 'Authentication is not configured. Add Firebase Admin credentials to the backend.'
    });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
  }

  try {
    req.user = await firebaseAuth.verifyIdToken(token);
    next();
  } catch (error) {
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' ||
      error.code === 'auth/invalid-id-token' || error.code === 'auth/invalid-argument') {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
    return res.status(503).json({ success: false, message: 'Authentication service is unavailable.' });
  }
};
