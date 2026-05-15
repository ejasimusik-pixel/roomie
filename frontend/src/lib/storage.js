import { supabase } from "./supabase";

export const BUCKETS = Object.freeze({
  SALON_LOGOS: "salon-logos",
  SERVICES: "service-images",
  PRODUCTS: "product-images",
  CLIENT_UPLOADS: "client-uploads",
});

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (matches bucket limit for the public ones)

export function validateImageFile(file) {
  if (!file) return "Selecciona una imagen";
  if (!ALLOWED_MIME.includes(file.type))
    return "Formato no soportado. Usa PNG, JPG o WebP.";
  if (file.size > MAX_BYTES) return "La imagen pesa más de 5 MB.";
  return null;
}

function extOf(file) {
  const fromName = (file.name || "").split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Uploads `file` to `bucket` under `<scopeId>/<random>.<ext>`.
 * For public buckets we return a CDN URL; for private buckets a signed URL
 * (1h TTL by default).
 *
 * Returns { error } on failure or { url, path } on success.
 */
export async function uploadImage({ bucket, scopeId, file, signedUrlTTL = 3600 }) {
  const err = validateImageFile(file);
  if (err) return { error: { message: err } };
  if (!scopeId) return { error: { message: "Falta el identificador del salón." } };

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extOf(file)}`;
  const path = `${scopeId}/${filename}`;

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (uploadErr) return { error: uploadErr };

  if (bucket === BUCKETS.CLIENT_UPLOADS) {
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, signedUrlTTL);
    if (signErr) return { error: signErr };
    return { url: data?.signedUrl, path, bucket };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data?.publicUrl, path, bucket };
}

export async function deleteImage({ bucket, path }) {
  if (!bucket || !path) return { error: null };
  return supabase.storage.from(bucket).remove([path]);
}

/**
 * Extracts the storage path (everything after `<bucket>/`) from a Supabase
 * public URL. Useful for deleting a previous logo when replacing it.
 */
export function pathFromPublicUrl(url, bucket) {
  if (!url || !bucket) return null;
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length).split("?")[0];
}
