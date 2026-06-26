'use client'
import Button from './Button'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onConfirm?: () => void
  confirmLabel?: string
}

export default function Modal({
  open, onClose, title, children, onConfirm, confirmLabel = 'Salvar',
}: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold mb-5">{title}</h2>
        {children}
        <div className="flex justify-end gap-2 mt-5">
          <Button onClick={onClose}>Cancelar</Button>
          {onConfirm && (
            <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
          )}
        </div>
      </div>
    </div>
  )
}