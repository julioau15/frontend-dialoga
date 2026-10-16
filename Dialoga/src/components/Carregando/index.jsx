import './Carregando.css'

function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="carregando" role="status">
      <span className="carregando__spinner" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}

export default Carregando
