// ============================================================
// components/BarraProgresso
// Barra de progresso com o texto "Progresso" à esquerda e a porcentagem
// à direita (ex.: "Progresso ........ 60%").
// Props:
//   valor  -> número de 0 a 100
//   rotulo -> texto à esquerda (padrão "Progresso")
// ============================================================
export default function BarraProgresso({ valor, rotulo = 'Progresso' }) {
  const porcentagem = Math.min(100, Math.max(0, valor))

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-secundaria">
        <span>{rotulo}</span>
        <span>{porcentagem}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentagem}
        className="h-2 overflow-hidden rounded-full bg-borda"
      >
        <div className="h-full rounded-full bg-primaria transition-[width] duration-300" style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  )
}
