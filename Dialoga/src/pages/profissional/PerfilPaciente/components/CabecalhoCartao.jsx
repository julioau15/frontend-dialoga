// ============================================================
// CabecalhoCartao
// Topo dos cartões da aba Indicadores, como no Figma: ícone (ou emoji) e título
// de 14px em negrito, um texto de apoio embaixo e, opcionalmente, algo à direita
// (ex.: "7 registro(s)" ou a média de sono).
// Props:
//   icone     -> elemento do ícone ou emoji
//   titulo    -> texto do título (vira um <h3>)
//   subtitulo -> texto de apoio (opcional)
//   direita   -> elemento mostrado à direita (opcional)
// ============================================================
export default function CabecalhoCartao({ icone, titulo, subtitulo, direita }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-[14px] font-bold leading-5 text-texto">
          {icone}
          {titulo}
        </h3>
        {subtitulo && <p className="mt-[3px] text-[12px] leading-4 text-secundaria">{subtitulo}</p>}
      </div>
      {direita && <div className="shrink-0 text-right">{direita}</div>}
    </div>
  )
}
