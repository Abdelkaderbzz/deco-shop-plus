/** URL slug from a French product or category name. */
export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
  return slug
}

export function isNumericProductParam(value: string) {
  return /^\d+$/.test(value)
}
