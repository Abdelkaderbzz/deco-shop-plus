'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createContext, useCallback, useContext, useRef, useState } from 'react'

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

const defaultOptions: Required<Omit<ConfirmOptions, 'description'>> & { description: string } = {
  title: '',
  description: '',
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  variant: 'default',
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState(defaultOptions)
  const resolveRef = useRef<(value: boolean) => void>(() => {})
  const resultRef = useRef<boolean | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      resultRef.current = null
      setOptions({ ...defaultOptions, ...opts })
      setOpen(true)
    })
  }, [])

  const isDestructive = options.variant === 'destructive'

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            resolveRef.current(resultRef.current ?? false)
            resultRef.current = null
          }
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-[250] bg-slate-900/40 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup
            className={cn(
              'fixed top-1/2 left-1/2 z-[251] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-lg border border-slate-200 bg-white p-6 shadow-2xl',
              'transition-[opacity,transform] duration-150',
              'data-starting-style:scale-95 data-starting-style:opacity-0',
              'data-ending-style:scale-95 data-ending-style:opacity-0',
            )}
          >
            <AlertDialog.Title className="text-lg font-bold text-slate-900">
              {options.title}
            </AlertDialog.Title>
            {options.description ? (
              <AlertDialog.Description className="mt-2 text-sm text-slate-600">
                {options.description}
              </AlertDialog.Description>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Close
                render={<Button type="button" variant="outline" />}
                onClick={() => {
                  resultRef.current = false
                }}
              >
                {options.cancelLabel}
              </AlertDialog.Close>
              <AlertDialog.Close
                render={
                  <Button
                    type="button"
                    variant={isDestructive ? 'destructive' : 'default'}
                  />
                }
                onClick={() => {
                  resultRef.current = true
                }}
              >
                {options.confirmLabel}
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return ctx
}
