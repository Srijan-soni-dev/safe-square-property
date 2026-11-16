import { supabase } from "@/lib/supabaseClient";
import { IMAGE_BUCKET } from "@/lib/constants";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Uploads files to property-images/<userId>/<propertyId>/<random>.ext and returns public URLs. */
export async function uploadImages({ userId, propertyId, files }) {
  if (!files?.length) return [];
  const uploadedPaths = [];
  try {
    return await Promise.all(
      files.map(async (file) => {
        const path = `${userId}/${propertyId}/${crypto.randomUUID()}.${EXT[file.type] || "jpg"}`;
        const { error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
        if (error) throw error;
        uploadedPaths.push(path);
        return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
      })
    );
  } catch (err) {
    // Roll back anything that already uploaded so we don't leave orphan files
    if (uploadedPaths.length) await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
    throw err;
  }
}

export function pathFromUrl(url) {
  const marker = `/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

export async function deleteImagesByUrls(urls) {
  const paths = (urls || []).map(pathFromUrl).filter(Boolean);
  if (!paths.length) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  if (error) console.error("Could not delete some images:", error.message);
}
