import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger' // 'danger' or 'primary'
}) {
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      document.body.style.overflow = 'hidden'
      // Focus trap
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
        if (e.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements?.length) {
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)

      // Focus first button
      setTimeout(() => {
        dialogRef.current?.querySelector('button')?.focus()
      }, 0)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const confirmColor = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-indigo-600 hover:bg-indigo-700'

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900 mb-2">
          {title}
        </h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}