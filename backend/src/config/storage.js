import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
}

export const BUCKET_NAME = 'cv-uploads';

/**
 * Upload file buffer ke Supabase Storage
 * @returns Public URL of uploaded file, atau null jika gagal
 */
export async function uploadCV(buffer, filename, contentType) {
  if (!supabase) {
    console.warn('Supabase storage not configured. Falling back to local storage.');
    return null;
  }

  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${filename}`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueName, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueName);
  return data.publicUrl;
}

export default supabase;
