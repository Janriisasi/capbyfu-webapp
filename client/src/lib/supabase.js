import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'capbyfu-web',
    },
  },
});

// ─── Sanitize input to prevent XSS ───────────────────────────────────────────
export const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ─── Compress image to WebP before upload ────────────────────────────────────
// Aggressively reduces file size: typical phone photos (3–8 MB) → 100–300 KB.
// Strategy:
//   • Resize longest side to MAX_DIM (800px — enough for proof/ID viewing)
//   • Quality scales down further if the source file is very large:
//       < 1 MB  → 0.70
//       1–3 MB  → 0.60
//       3–6 MB  → 0.50
//       > 6 MB  → 0.40
export const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const MAX_DIM = 800;
        let { width, height } = img;

        // Resize keeping aspect ratio
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality based on original file size
        const mb = file.size / (1024 * 1024);
        const quality = mb < 1 ? 0.70 : mb < 3 ? 0.60 : mb < 6 ? 0.50 : 0.40;

        canvas.toBlob(
          (blob) => {
            const safeName = file.name.replace(/\.[^.]+$/, '.webp');
            const compressed = new File([blob], safeName, { type: 'image/webp' });
            resolve(compressed);
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};

// ─── Upload file to Supabase Storage ─────────────────────────────────────────
// Returns the public URL of the uploaded file.
// Set compress=true (default) to run compressImage() on image files first.
export const uploadFile = async (bucket, path, file, compress = true) => {
  let fileToUpload = file;

  if (compress && file.type.startsWith('image/')) {
    fileToUpload = await compressImage(file);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileToUpload, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
};