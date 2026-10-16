import { NavLink } from 'react-router-dom'
import './BarraLateral.css'

// items: [{ to, label, icon?, end? }]
function BarraLateral({ title = 'Dialoga', items = [], footer }) {
  return (
    <aside className="barra-lateral">
      <div className="barra-lateral__brand">{title}</div>

      <nav className="barra-lateral__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `barra-lateral__link${isActive ? ' barra-lateral__link--active' : ''}`
            }
          >
            {item.icon && <span className="barra-lateral__icon">{item.icon}</span>}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {footer && <div className="barra-lateral__footer">{footer}</div>}
    </aside>
  )
}

export default BarraLateral
