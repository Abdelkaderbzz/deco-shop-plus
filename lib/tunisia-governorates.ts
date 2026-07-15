export type TunisiaGovernorate = {
  slug: string
  name: string
  nameAr: string
}

export const TUNISIA_GOVERNORATES: TunisiaGovernorate[] = [
  { slug: 'ariana', name: 'Ariana', nameAr: 'أريانة' },
  { slug: 'beja', name: 'Béja', nameAr: 'باجة' },
  { slug: 'ben-arous', name: 'Ben Arous', nameAr: 'بن عروس' },
  { slug: 'bizerte', name: 'Bizerte', nameAr: 'بنزرت' },
  { slug: 'gabes', name: 'Gabès', nameAr: 'قابس' },
  { slug: 'gafsa', name: 'Gafsa', nameAr: 'قفصة' },
  { slug: 'jendouba', name: 'Jendouba', nameAr: 'جندوبة' },
  { slug: 'kairouan', name: 'Kairouan', nameAr: 'القيروان' },
  { slug: 'kasserine', name: 'Kasserine', nameAr: 'القصرين' },
  { slug: 'kebili', name: 'Kebili', nameAr: 'قبلي' },
  { slug: 'kef', name: 'Kef', nameAr: 'الكاف' },
  { slug: 'mahdia', name: 'Mahdia', nameAr: 'المهدية' },
  { slug: 'manouba', name: 'Manouba', nameAr: 'منوبة' },
  { slug: 'medenine', name: 'Medenine', nameAr: 'مدنين' },
  { slug: 'monastir', name: 'Monastir', nameAr: 'المنستير' },
  { slug: 'nabeul', name: 'Nabeul', nameAr: 'نابل' },
  { slug: 'sfax', name: 'Sfax', nameAr: 'صفاقس' },
  { slug: 'sidi-bouzid', name: 'Sidi Bouzid', nameAr: 'سيدي بوزيد' },
  { slug: 'siliana', name: 'Siliana', nameAr: 'سليانة' },
  { slug: 'sousse', name: 'Sousse', nameAr: 'سوسة' },
  { slug: 'tataouine', name: 'Tataouine', nameAr: 'تطاوين' },
  { slug: 'tozeur', name: 'Tozeur', nameAr: 'توزر' },
  { slug: 'tunis', name: 'Tunis', nameAr: 'تونس' },
  { slug: 'zaghouan', name: 'Zaghouan', nameAr: 'زغوان' },
]

export const GOVERNORATE_SLUGS = TUNISIA_GOVERNORATES.map((g) => g.slug)

export const GOVERNORATE_SELECT_OPTIONS = TUNISIA_GOVERNORATES.map((g) => ({
  value: g.slug,
  label: `${g.name} (${g.nameAr})`,
}))

export function getGovernorateLabel(slug: string | null | undefined) {
  if (!slug) return null
  const governorate = TUNISIA_GOVERNORATES.find((g) => g.slug === slug)
  if (!governorate) return slug
  return `${governorate.name} (${governorate.nameAr})`
}
