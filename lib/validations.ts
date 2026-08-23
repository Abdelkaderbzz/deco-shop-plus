import { z } from 'zod'
import { HERO_CTA_TARGETS } from '@/lib/hero-slides'
import { MAX_PRODUCT_COLORS } from '@/lib/product-colors'
import { GOVERNORATE_SLUGS } from '@/lib/tunisia-governorates'

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
    images: z.array(z.string().url('URL invalide')).max(6, 'Maximum 6 images par produit'),
    sizes: z
      .array(
        z.object({
          name: z.string().min(1, 'Taille requise').max(40, 'Nom trop long'),
          price: z
            .string()
            .min(1, 'Prix requis')
            .refine((value) => !Number.isNaN(parseFloat(value)) && parseFloat(value) > 0, {
              message: 'Prix invalide',
            }),
        }),
      )
      .max(12, 'Maximum 12 tailles'),
    colors: z
      .array(
        z.object({
          name: z.string().min(1, 'Nom de couleur requis').max(40, 'Nom trop long'),
          hex: z
            .string()
            .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format #rrggbb)'),
        }),
      )
      .max(MAX_PRODUCT_COLORS, `Maximum ${MAX_PRODUCT_COLORS} couleurs`),
    relatedProductIds: z
      .array(z.number().int().positive())
      .max(8, 'Maximum 8 produits associes'),
    stock: z
      .string()
      .min(1, 'Stock requis')
      .refine(
        (value) =>
          Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 9999,
        {
          message: 'Stock invalide (0 a 9999)',
        },
      ),
    featured: z.boolean(),
    published: z.boolean(),
    promoEnabled: z.boolean(),
    promoLabel: z.string().max(24, 'Libelle trop long'),
    promoBgColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format #rrggbb)'),
    promoTextColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format #rrggbb)'),
  })
  .superRefine((data, ctx) => {
    if (data.compareAtPrice && data.compareAtPrice !== '') {
      const price = parseFloat(data.price)
      const compareAt = parseFloat(data.compareAtPrice)
      if (!Number.isNaN(price) && !Number.isNaN(compareAt) && compareAt <= price) {
        ctx.addIssue({
          code: 'custom',
          message: "L'ancien prix doit etre superieur au prix actuel",
          path: ['compareAtPrice'],
        })
      }
    }

    const names = data.sizes.map((size) => size.name.trim().toLowerCase()).filter(Boolean)
    if (new Set(names).size !== names.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Chaque taille doit avoir un nom unique',
        path: ['sizes'],
      })
    }
  })

export type ProductFormValues = z.infer<typeof productSchema>

const heroCtaTargetSchema = z.enum(
  HERO_CTA_TARGETS.map((target) => target.value) as [
    (typeof HERO_CTA_TARGETS)[number]['value'],
    ...(typeof HERO_CTA_TARGETS)[number]['value'][],
  ],
)

const sectionHrefSchema = z
  .string()
  .max(300, 'Lien trop long')
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('/') ||
      value.startsWith('#') ||
      /^https?:\/\//.test(value),
    {
      message: 'Utilisez /products, #promotions ou une URL complete',
    },
  )

export const heroSlideSchema = z
  .object({
    imageUrl: z.string().min(1, 'Image requise'),
    alt: z.string().max(200, 'Texte alternatif trop long'),
    eyebrow: z.string().max(80, 'Sur-titre trop long'),
    title: z.string().min(1, 'Titre requis').max(80, 'Titre trop long'),
    subtitle: z.string().max(220, 'Sous-titre trop long'),
    ctaLabel: z.string().min(1, 'Libelle du bouton requis').max(40, 'Libelle trop long'),
    ctaTarget: heroCtaTargetSchema,
    ctaHref: sectionHrefSchema,
    published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.ctaTarget === 'custom' && data.ctaHref.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Ajoutez le lien du bouton',
        path: ['ctaHref'],
      })
    }
  })

export type HeroSlideFormValues = z.infer<typeof heroSlideSchema>

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

function refineDeliveryAddress(
  data: {
    customerGovernorate: string
    customerAddress: string
  },
  ctx: z.RefinementCtx,
) {
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
      message: 'Adresse de livraison requise',
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
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine(refineDeliveryAddress)

export type OrderEditFormValues = z.infer<typeof orderEditSchema>

export const orderCreateItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  size: z.string().min(1, 'Taille requise'),
  color: z.string().max(40),
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
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
    items: z.array(orderCreateItemSchema).min(1, 'Ajoutez au moins un article'),
  })
  .superRefine(refineDeliveryAddress)

export type OrderCreateFormValues = z.infer<typeof orderCreateSchema>

export const checkoutSchema = z
  .object({
    customerName: z.string().min(1, 'Nom requis').max(200, 'Nom trop long'),
    customerPhone: z
      .string()
      .min(1, 'Telephone requis')
      .min(8, 'Telephone invalide (8 chiffres minimum)'),
    customerGovernorate: z.string(),
    customerAddress: z.string(),
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine(refineDeliveryAddress)

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

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
