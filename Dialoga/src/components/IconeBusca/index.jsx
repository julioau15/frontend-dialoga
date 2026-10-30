// ============================================================
// components/IconeBusca
// Lupa em SVG (herda a cor do texto). Use no TextField: icone={<IconeBusca />}
// ============================================================
export default function IconeBusca() {
  return (
    <svg className="text-secundaria" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
