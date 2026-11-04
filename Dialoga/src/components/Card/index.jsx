// ============================================================
// components/Card
// Caixa branca com borda lilás e sombra leve, usada nas telas internas.
// Props: className (classes extras, ex.: "p-5"), as (tag HTML, padrão "section")
// ============================================================
export default function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-xl border border-borda bg-branco shadow-sm ${className}`} {...props}>
      {children}
    </Tag>
  )
}
