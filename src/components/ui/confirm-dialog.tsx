'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export type ConfirmTone = 'default' | 'danger' | 'success' | 'warning'

const TONE_ACTION_CLASSES: Record<ConfirmTone, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/40',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-600/90 focus-visible:ring-emerald-600/40',
  warning:
    'bg-amber-600 text-white hover:bg-amber-600/90 focus-visible:ring-amber-600/40',
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      try {
        await onConfirm()
      } finally {
        onOpenChange(false)
      }
    },
    [onConfirm, onOpenChange],
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading} className="mt-0 sm:mt-0">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'mt-0 sm:mt-0',
              TONE_ACTION_CLASSES[tone],
              loading && 'cursor-not-allowed opacity-70',
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                <span>Please wait</span>
              </span>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
