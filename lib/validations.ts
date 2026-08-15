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

export const siteBannerSchema = z
  .object({
    bannerEnabled: z.boolean(),
    bannerMessage: z.string().max(160, 'Message trop long (160 caracteres maximum)'),
    bannerVariant: z.enum(BANNER_VARIANTS),
    bannerLinkLabel: z.string().max(40, 'Libelle trop long'),
    bannerLinkHref: z
      .string()
      .max(300, 'Lien trop long')
      .refine((value) => value === '' || value.startsWith('/') || /^https?:\/\//.test(value), {
        message: 'Utilisez un chemin interne (/products) ou une URL complete (https://...)',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.bannerEnabled && data.bannerMessage.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Un message est requis pour activer la banniere',
        path: ['bannerMessage'],
      })
    }
    if (data.bannerLinkLabel.trim() !== '' && data.bannerLinkHref.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Ajoutez le lien correspondant au bouton',
        path: ['bannerLinkHref'],
      })
    }
  })

export type SiteBannerFormValues = z.infer<typeof siteBannerSchema>

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
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'delivery') {
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
  })

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
    status: z.string().min(1, 'Statut requis'),
    notes: z.string().max(500, 'Notes trop longues'),
    items: z.array(orderCreateItemSchema).min(1, 'Ajoutez au moins un article'),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'delivery') {
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
  })

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
    notes: z.string().max(500, 'Notes trop longues'),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'delivery') {
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
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
