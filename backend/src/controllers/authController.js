import { isSupabaseConfigured, supabase } from '../config/supabase.js';

export const register = async (req, res) => {
  const { email, password, full_name, role = 'donor' } = req.body;
  if (!isSupabaseConfigured) {
    return res.status(503).json({ success: false, message: 'Authentication requires a configured Supabase project.' });
  }
  if (!email || !password || !full_name || !['donor', 'hospital', 'patient'].includes(role)) {
    return res.status(400).json({ success: false, message: 'A valid email, password, full name, and account role are required.' });
  }
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name, role } } });
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(201).json({ success: true, data });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!isSupabaseConfigured) {
    return res.status(503).json({ success: false, message: 'Authentication requires a configured Supabase project.' });
  }
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, data });
};

export const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, message: 'Logged out' });
};

export const me = async (req, res) => {
  res.status(200).json({ success: true, user: req.user || null });
};
