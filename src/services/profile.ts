import { supabase } from './supabase';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  currency: string;
  location: string;
  avatar_url?: string;
  created_at?: string;
}


export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, currency, location, avatar_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, currency, location, avatar_url, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, currency, location, avatar_url, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, currency, location, avatar_url, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}



export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
