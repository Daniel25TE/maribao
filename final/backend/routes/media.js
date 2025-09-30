import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();


router.get('/media', async (req, res) => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    console.log('data:', data, 'error:', error);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
