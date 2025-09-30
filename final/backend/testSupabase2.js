import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL_2, process.env.SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('media').select('*');
  console.log('data:', data, 'error:', error);
}

test();
