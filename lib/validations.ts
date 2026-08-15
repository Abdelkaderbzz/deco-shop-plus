import { z } from 'zod'
import { GOVERNORATE_SLUGS } from '@/lib/tunisia-governorates'

const governorateSchema = z.enum(GOVERNORATE_SLUGS as [string, ...string[]])

export const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(6, 'Mot de passe trop court (6 caracteres minimum)'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const productSchema = z
  .object({
    name: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
    brand: z.string().min(1, 'Marque requise').max(100, 'Marque trop longue'),
    description: z.string().max(2000, 'Description trop longue'),
    price: z
      .string()
      .min(1, 'Prix requis')
      .refine((value) => !Number.isNaN(parseFloat(value)) && parseFloat(value) > 0, {
        message: 'Prix invalide',
      }),
    compareAtPrice: z
      .string()
      .refine(
        (value) =>
          value === '' || (!Number.isNaN(parseFloat(value)) && parseFloat(value) > 0),
        { message: 'Ancien prix invalide' },
      ),
    category: z.string().min(1, 'Categorie requise'),
    images: z.array(z.string().url('URL invalide')).max(5, 'Maximum 5 images par produit'),
    sizes: z.string(),
    relatedProductIds: z
      .array(z.number().int().positive())
      .max(8, 'Maximum 8 produits associes'),
    inStock: z.boolean(),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.compareAtPrice || data.compareAtPrice === '') return
    const price = parseFloat(data.price)
    const compareAt = parseFloat(data.compareAtPrice)
    if (Number.isNaN(price) || Number.isNaN(compareAt)) return
    if (compareAt <= price) {
      ctx.addIssue({
        code: 'custom',
        message: "L'ancien prix doit etre superieur au prix actuel",
        path: ['compareAtPrice'],
      })
    }
  })

export type ProductFormValues = z.infer<typeof productSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  slug: z
    .string()
    .max(100, 'Slug trop long')
    .refine((value) => value === '' || /^[a-z0-9-]+$/.test(value), {
      message: 'Slug invalide (lettres minuscules, chiffres et tirets uniquement)',
    }),
  bannerUrl: z.string().url('URL invalide').or(z.literal('')).optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const deliveryFeeSchema = z.object({
  deliveryFee: z
    .string()
    .min(1, 'Tarif requis')
    .refine((value) => !Number.isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
      message: 'Montant invalide',
    }),
})

export type DeliveryFeeFormValues = z.infer<typeof deliveryFeeSchema>

export const BANNER_VARIANTS = ['offer', 'news', 'discount'] as const
export type BannerVariant = (typeof BANNER_VARIANTS)[number]

export const BANNER_FONT_SIZE_MIN = 10
export const BANNER_FONT_SIZE_MAX = 22

const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format #rrggbb)')

const linkHrefSchema = z
  .string()
  .max(300, 'Lien trop long')
  .refine((value) => value === '' || value.startsWith('/') || /^https?:\/\//.test(value), {
    message: 'Utilisez un chemin interne (/products) ou une URL complete (https://...)',
  })

export const bannerSchema = z
  .object({
    name: z.string().max(60, 'Nom trop long'),
    message: z
      .string()
      .min(1, 'Message requis')
      .max(160, 'Message trop long (160 caracteres maximum)'),
    variant: z.enum(BANNER_VARIANTS),
    backgroundColor: hexColorSchema,
    textColor: hexColorSchema,
    fontSize: z
      .number()
      .int()
      .min(BANNER_FONT_SIZE_MIN, `Taille minimum ${BANNER_FONT_SIZE_MIN}px`)
      .max(BANNER_FONT_SIZE_MAX, `Taille maximum ${BANNER_FONT_SIZE_MAX}px`),
    linkLabel: z.string().max(40, 'Libelle trop long'),
    linkHref: linkHrefSchema,
    dismissible: z.boolean(),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.linkLabel.trim() !== '' && data.linkHref.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Ajoutez le lien correspondant au bouton',
        path: ['linkHref'],
      })
    }
  })

export type BannerFormValues = z.infer<typeof bannerSchema>

export const boutiqueSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(120, 'Nom trop long'),
  slug: z
    .string()
    .max(120, 'Slug trop long')
    .refine((value) => value === '' || /^[a-z0-9-]+$/.test(value), {
      message: 'Slug invalide (lettres minuscules, chiffres et tirets uniquement)',
    }),
  city: z.string().min(1, 'Ville requise').max(80, 'Ville trop longue'),
  region: z.string().max(80, 'Region trop longue'),
  description: z.string().max(400, 'Description trop longue'),
  imageUrl: z.string(),
  imageAlt: z.string().max(200, 'Texte alternatif trop long'),
  address: z.string().max(200, 'Adresse trop longue'),
  phone: z.string().max(30, 'Telephone trop long'),
  rating: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (!Number.isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 5),
      { message: 'Note invalide (entre 0 et 5)' },
    ),
  reviewCount: z
    .string()
    .refine(
      (value) => value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0),
      { message: "Nombre d'avis invalide" },
    ),
  ratingSource: z.string().max(60, 'Source trop longue'),
  directionsUrl: linkHrefSchema,
  pickupEnabled: z.boolean(),
  published: z.boolean(),
})

export type BoutiqueFormValues = z.infer<typeof boutiqueSchema>

/** Shared delivery-vs-pickup rules for the admin order forms. */
function refineOrderLogistics(
  data: {
    orderType: 'delivery' | 'boutique'
    customerGovernorate: string
    customerAddress: string
    pickupBoutiqueId: number | null
  },
  ctx: z.RefinementCtx,
) {
  if (data.orderType === 'boutique') {
    if (data.pickupBoutiqueId == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choisissez la boutique de retrait',
        path: ['pickupBoutiqueId'],
      })
    }
    return
  }

  if (!data.customerGovernorate) {
    ctx.addIssue({
      code: 'custom',
      message: 'Gouvernorat requis pour la livraison',
      path: ['customerGovernorate'],
    })
  } else if (!GOVERNORATE_SLUGS.includes(data.customerGovernorate)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Gouvernorat invalide',
      path: ['customerGovernorate'],
    })
  }

  if (!data.customerAddress.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Adresse requise pour la livraison',
      path: ['customerAddress'],
    })
  }
}

export const orderEditSchema = z
  .object({
    customerName: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
    customerPhone: z
      .string()
      .min(1, 'Telephone requis')
      .min(8, 'Telephone invalide (8 chiffres minimum)'),
    customerGovernorate: z.string(),
    customerAddress: z.string(),
    orderType: z.enum(['delivery', 'boutique']),
    pickupBoutiqueId: z.number().int().positive().nullable(),
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine(refineOrderLogistics)

export type OrderEditFormValues = z.infer<typeof orderEditSchema>

export const orderCreateItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  size: z.string().min(1, 'Taille requise'),
  quantity: z.number().int().min(1, 'Quantite invalide').max(99, 'Quantite trop elevee'),
  price: z.number().positive('Prix invalide'),
})

export const orderCreateSchema = z
  .object({
    customerName: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
    customerPhone: z
      .string()
      .min(1, 'Telephone requis')
      .min(8, 'Telephone invalide (8 chiffres minimum)'),
    customerGovernorate: z.string(),
    customerAddress: z.string(),
    orderType: z.enum(['delivery', 'boutique']),
    pickupBoutiqueId: z.number().int().positive().nullable(),
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
    items: z.array(orderCreateItemSchema).min(1, 'Ajoutez au moins un article'),
  })
  .superRefine(refineOrderLogistics)

export type OrderCreateFormValues = z.infer<typeof orderCreateSchema>

export const checkoutSchema = z
  .object({
    orderType: z.enum(['delivery', 'boutique']),
    customerName: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
    customerPhone: z
      .string()
      .min(1, 'Telephone requis')
      .min(8, 'Telephone invalide (8 chiffres minimum)'),
    customerGovernorate: z.string(),
    customerAddress: z.string(),
    pickupBoutiqueId: z.number().int().positive().nullable(),
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'boutique') {
      if (data.pickupBoutiqueId == null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choisissez la boutique de retrait',
          path: ['pickupBoutiqueId'],
        })
      }
      return
    }

    if (!data.customerGovernorate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Gouvernorat requis',
        path: ['customerGovernorate'],
      })
    } else if (!GOVERNORATE_SLUGS.includes(data.customerGovernorate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Gouvernorat invalide',
        path: ['customerGovernorate'],
      })
    }

    if (!data.customerAddress.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Adresse de livraison requise',
        path: ['customerAddress'],
      })
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
