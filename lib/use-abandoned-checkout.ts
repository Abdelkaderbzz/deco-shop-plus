'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CartItem } from '@/app/actions/orders'

const DRAFT_STORAGE_KEY = 'dsp-checkout-draft-id'

export type AbandonedCheckoutPayload = {
  customerName: string
  customerPhone: string
  customerGovernorate?: string
  customerAddress?: string
  notes?: string
  items: CartItem[]
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function hasAbandonedContact(name: string, phone: string) {
  return name.trim().length >= 2 && phoneDigits(phone).length >= 8
}

let suppressAbandonedUntil = 0

function checkoutJustCompleted() {
  return Date.now() < suppressAbandonedUntil
}

export function getCheckoutDraftId(): string {
  if (typeof window === 'undefined') return ''
  if (checkoutJustCompleted()) {
    return sessionStorage.getItem(DRAFT_STORAGE_KEY) ?? ''
  }
  let id = sessionStorage.getItem(DRAFT_STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(DRAFT_STORAGE_KEY, id)
  }
  return id
}

export function markCheckoutCompleted() {
  if (typeof window === 'undefined') return
  suppressAbandonedUntil = Date.now() + 5000
  sessionStorage.removeItem(DRAFT_STORAGE_KEY)
}

function postAbandonedCheckout(body: string, keepalive: boolean) {
  if (keepalive && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon('/api/abandoned-checkout', blob)) return
  }

  void fetch('/api/abandoned-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

export function useAbandonedCheckout(
  payload: AbandonedCheckoutPayload,
  options?: { disabled?: boolean },
) {
  const payloadRef = useRef(payload)
  payloadRef.current = payload
  const lastSentRef = useRef('')
  const disabled = Boolean(options?.disabled)

  const flush = useCallback((keepalive: boolean) => {
    if (disabled || checkoutJustCompleted()) return
    const data = payloadRef.current
    if (!hasAbandonedContact(data.customerName, data.customerPhone)) return

    const draftId = getCheckoutDraftId()
    if (!draftId || checkoutJustCompleted()) return

    const body = JSON.stringify({
      draftId,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerGovernorate: data.customerGovernorate?.trim() || undefined,
      customerAddress: data.customerAddress?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      items: data.items,
    })
    if (body === lastSentRef.current) return
    lastSentRef.current = body
    postAbandonedCheckout(body, keepalive)
  }, [disabled])

  const itemsKey = JSON.stringify(payload.items)

  useEffect(() => {
    if (disabled) return
    const timeout = window.setTimeout(() => flush(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [
    disabled,
    flush,
    payload.customerName,
    payload.customerPhone,
    payload.customerGovernorate,
    payload.customerAddress,
    payload.notes,
    itemsKey,
  ])

  useEffect(() => {
    function onPageHide() {
      flush(true)
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') flush(true)
    }

    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibility)
      flush(true)
    }
  }, [flush])
}
