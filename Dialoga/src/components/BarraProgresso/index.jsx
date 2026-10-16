import './BarraProgresso.css'

// variant: 'accent' | 'success' | 'warning' | 'danger'
function BarraProgresso({ value = 0, max = 100, label, showValue = true, variant = 'accent' }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className="barra-progresso">
      {(label || showValue) && (
        <div className="barra-progresso__header">
          {label && <span>{label}</span>}
          {showValue && <span className="barra-progresso__value">{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className="barra-progresso__track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`barra-progresso__fill barra-progresso__fill--${variant}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default BarraProgresso
