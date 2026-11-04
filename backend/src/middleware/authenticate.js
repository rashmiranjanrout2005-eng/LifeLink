import { isSupabaseConfigured, supabase } from '../config/supabase.js';

const useDemoMode = process.env.USE_DEMO_MODE === 'true' &&
  process.env.NODE_ENV !== 'production' &&
  !isSupabaseConfigured;

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

  if (!isSupabaseConfigured) {
    return res.status(503).json({
      success: false,
      message: 'Authentication is not configured. Add the Supabase environment variables to the backend.'
    });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    return res.status(503).json({ success: false, message: 'Authentication service is unavailable.' });
  }
};
