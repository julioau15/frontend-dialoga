import { useEffect, useRef } from 'react'
import './ModalConfirmacao.css'

// <dialog> nativo: foco preso no modal e Esc chamam onCancel
function ModalConfirmacao({
  open,
  title = 'Tem certeza?',
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleCancel(event) {
    event.preventDefault()
    if (!loading) onCancel?.()
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current && !loading) onCancel?.()
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-confirmacao"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="modal-confirmacao__content">
        <h2 className="modal-confirmacao__title">{title}</h2>
        {children && <div className="modal-confirmacao__body">{children}</div>}

        <div className="modal-confirmacao__actions">
          <button
            type="button"
            className="modal-confirmacao__btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-confirmacao__btn modal-confirmacao__btn--${danger ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ModalConfirmacao
