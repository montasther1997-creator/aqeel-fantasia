import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iixuvhjhhtfsioqhmqkx.supabase.co';
const BUCKET = 'fantasia-media';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_KEY missing');
  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

export async function uploadToStorage(file: File, folder = 'uploads'): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const safeExt = /^[a-z0-9]{1,6}$/.test(ext) ? ext : 'bin';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const client = getClient();
  const { error } = await client.storage
    .from(BUCKET)
    .upload(filename, buf, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(`storage-upload-failed: ${error.message}`);
  const { data } = client.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteFromStorage(url: string): Promise<void> {
  try {
    const m = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    if (!m) return;
    const client = getClient();
    await client.storage.from(BUCKET).remove([m[1]]);
  } catch (e) {
    console.error('[storage] delete failed:', e);
  }
}
