// ============================================================
// components/Selo
// Etiqueta pequena e arredondada para mostrar um status (ex.: "Ativo").
// Props:
//   tom -> 'sucesso' | 'info' | 'primaria' | 'erro' | 'neutro' (padrão)
// ============================================================
const TONS = {
  sucesso: 'bg-sucesso-fundo text-sucesso',
  info: 'bg-info-fundo text-info',
  primaria: 'bg-fundo-card text-primaria',
  erro: 'bg-erro-fundo text-erro',
  neutro: 'bg-cinza-100 text-secundaria',
}

export default function Selo({ tom = 'neutro', children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TONS[tom]}`}
    >
      {children}
    </span>
  )
}
