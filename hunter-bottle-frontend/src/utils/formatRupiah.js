export function formatRupiah(value) {
  const n = Number(value);
  if (!n && n !== 0) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_BACKEND_URL}/storage/${path}`;
}
