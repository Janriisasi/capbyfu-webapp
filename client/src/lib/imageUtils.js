// Image compression utility - converts uploads to WebP to save storage
export async function compressToWebP(file, maxWidthPx = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width);
          width = maxWidthPx;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas conversion failed'));
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export async function uploadFile(supabase, bucket, path, file, isImage = true) {
  let fileToUpload = file;
  if (isImage && file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressToWebP(file);
    } catch {
      // fallback to original if compression fails
      fileToUpload = file;
    }
  }
  const { data, error } = await supabase.storage.from(bucket).upload(path, fileToUpload, {
    upsert: true,
    contentType: fileToUpload.type,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}