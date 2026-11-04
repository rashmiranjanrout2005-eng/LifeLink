import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

export const authorizeRoles = (...roles) => async (req, res, next) => {
  if (req.user?.demoMode && roles.includes('admin')) return next();
  if (!isSupabaseConfigured) {
    return res.status(503).json({ success: false, message: 'Role authorization requires a configured Supabase database.' });
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(503).json({ success: false, message: error.message });
  if (!profile || !roles.includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }

  req.profile = profile;
  next();
};
