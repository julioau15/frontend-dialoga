import './AbasFiltro.css'

// tabs: [{ value, label, count? }]
function AbasFiltro({ tabs = [], value, onChange }) {
  return (
    <div className="abas-filtro" role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`abas-filtro__tab${active ? ' abas-filtro__tab--active' : ''}`}
            onClick={() => onChange?.(tab.value)}
          >
            {tab.label}
            {tab.count != null && (
              <span className="abas-filtro__count">{tab.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default AbasFiltro
