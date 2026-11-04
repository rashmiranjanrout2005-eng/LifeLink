import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

export const getNotifications = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Notifications require a configured database.' });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('id').eq('auth_user_id', req.user.id).maybeSingle();
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const { data, error } = await supabaseAdmin.from('notifications')
    .select('*').eq('recipient_id', profile.id).order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const markNotificationRead = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Notifications require a configured database.' });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('id').eq('auth_user_id', req.user.id).maybeSingle();
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const { data, error } = await supabaseAdmin.from('notifications').update({ is_read: true })
    .eq('id', req.params.id).eq('recipient_id', profile.id).select().maybeSingle();
  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Notification not found.' });
  return res.status(200).json({ success: true, data });
};
