import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  await supabase.from('app_settings').update({ camp_date: '2026-05-01T12:00:00+08:00' }).eq('id', 1);
  const { data, error } = await supabase.from('app_settings').select('camp_date').single();
  console.log("AFTER UPDATE 12:00+08:00 =>", data.camp_date);

  // Reverting
  await supabase.from('app_settings').update({ camp_date: '2026-05-01' }).eq('id', 1);
  const { data: d2 } = await supabase.from('app_settings').select('camp_date').single();
  console.log("AFTER UPDATE '2026-05-01' =>", d2.camp_date);
}
run();
