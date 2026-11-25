// ============================================================
// components/Stepper
// Indicador de etapas: bolinha numerada + nome embaixo, ligadas por uma linha.
// Props:
//   passos -> lista com o nome de cada etapa (ex.: ['Pessoal', 'Profissional', 'Humor'])
//   atual  -> número da etapa atual (começa em 1)
//   className -> classes extras (opcional)
// Etapa atual = roxa com halo | etapas já feitas = roxas com ✓ | próximas = brancas.
// ============================================================
export default function Stepper({ passos, atual, className = '' }) {
  return (
    <ol className={`flex w-full max-w-[380px] ${className}`} aria-label="Etapas">
      {passos.map((nome, i) => {
        const numero = i + 1
        const ativo = numero === atual
        const feito = numero < atual
        const ultimo = numero === passos.length

        return (
          <li
            key={nome}
            className="relative flex flex-col items-center flex-1 gap-1.5"
            aria-current={ativo ? 'step' : undefined}
          >
            {/* Linha até a próxima bolinha (do centro desta até o centro da seguinte) */}
            {!ultimo && (
              <span
                className={`absolute top-3.5 left-1/2 w-full h-px ${feito ? 'bg-primaria' : 'bg-borda'}`}
                aria-hidden="true"
              />
            )}

            <span
              className={`relative z-10 grid place-items-center w-7 h-7 rounded-full text-[12px] font-bold ${
                ativo
                  ? 'bg-primaria bg-botao text-branco shadow-[0_0_0_4px_var(--color-primaria-alfa-20)]'
                  : feito
                    ? 'bg-primaria bg-botao text-branco'
                    : 'bg-superficie border border-borda text-texto'
              }`}
            >
              {feito ? '✓' : numero}
            </span>

            <span className={`text-[11px] ${ativo ? 'font-semibold text-primaria-texto' : 'text-texto'}`}>{nome}</span>
          </li>
        )
      })}
    </ol>
  )
}
