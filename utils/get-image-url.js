import { supabaseAdmin } from '../supabaseAdmin';

export function getImageUrl(folder, path) {
  if (!path) return '';

  // Always use 'temples' bucket but maintain folder structure
  const { data } = supabaseAdmin.storage.from('temples').getPublicUrl(path);

  return data?.publicUrl || '';
}
