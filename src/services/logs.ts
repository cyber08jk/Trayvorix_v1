import { supabase } from '../services/supabase';

export interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

export async function addLog(userId: string, action: string, details: string) {
  await supabase.from('logs').insert([{ user_id: userId, action, details }]);
}

export async function fetchLogs(userId: string) {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as LogEntry[];
}
