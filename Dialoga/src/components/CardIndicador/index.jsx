import './CardIndicador.css'

function CardIndicador({ label, value, icon, hint }) {
  return (
    <div className="card-indicador">
      <div className="card-indicador__header">
        <span className="card-indicador__label">{label}</span>
        {icon && <span className="card-indicador__icon">{icon}</span>}
      </div>
      <strong className="card-indicador__value">{value}</strong>
      {hint && <span className="card-indicador__hint">{hint}</span>}
    </div>
  )
}

export default CardIndicador
