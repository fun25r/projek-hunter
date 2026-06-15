export function formatRupiah(value) {
  const n = Number(value);
  if (!n && n !== 0) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
