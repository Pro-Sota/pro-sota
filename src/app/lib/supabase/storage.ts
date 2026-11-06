const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getStorageImageUrl(
  path: string | null | undefined,
  bucket = "portfolio"
): string {
  if (!path || !SUPABASE_URL) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, "");

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}