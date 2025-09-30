import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();


router.get('/media', async (req, res) => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
