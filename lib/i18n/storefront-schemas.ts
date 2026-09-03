import { z } from 'zod'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { GOVERNORATE_SLUGS } from '@/lib/tunisia-governorates'

export function checkoutSchemaFor(messages: Dictionary['validation']) {
  return z
    .object({
      customerName: z.string().min(1, messages.nameRequired).max(200, messages.nameTooLong),
      customerPhone: z
        .string()
        .min(1, messages.phoneRequired)
        .min(8, messages.phoneInvalid),
      customerGovernorate: z.string(),
      customerAddress: z.string(),
      notes: z.string().max(500, messages.noteTooLong),
    })
    .superRefine((data, ctx) => refineDelivery(data, ctx, messages))
}

export function productOrderSchemaFor(messages: Dictionary['validation']) {
  return z
    .object({
      customerName: z.string().min(1, messages.nameRequired).max(200, messages.nameTooLong),
      customerPhone: z
        .string()
        .min(1, messages.phoneRequired)
        .min(8, messages.phoneInvalid),
      customerGovernorate: z.string(),
      customerAddress: z.string().max(400, messages.addressTooLong),
      notes: z.string().max(500, messages.noteTooLong),
    })
    .superRefine((data, ctx) => refineDelivery(data, ctx, messages))
}

function refineDelivery(
  data: { customerGovernorate: string; customerAddress: string },
  ctx: z.RefinementCtx,
  messages: Dictionary['validation'],
) {
  if (!data.customerGovernorate) {
    ctx.addIssue({
      code: 'custom',
      message: messages.governorateRequired,
      path: ['customerGovernorate'],
    })
  } else if (!GOVERNORATE_SLUGS.includes(data.customerGovernorate)) {
    ctx.addIssue({
      code: 'custom',
      message: messages.governorateInvalid,
      path: ['customerGovernorate'],
    })
  }

  if (!data.customerAddress.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: messages.addressRequired,
      path: ['customerAddress'],
    })
  }
}
