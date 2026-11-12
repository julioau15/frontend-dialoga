// ============================================================
// PainelDisponibilidade
// Coluna da direita da aba Disponibilidade: título, botão "Adicionar"
// e a lista de horários (um cartão por dia, com a lixeira para remover).
// Frames: Disponibilidade - Profissional | Remover disponibilidade - Profissional
// Props: itens (já ordenados), onAdicionar, onRemover(item)
// ============================================================
import Button from '../../../../components/Button'
import { IconeLixeira } from '../../../../components/Icones'
import { IconeMais } from '../../../../components/IconesAgenda'
import { faixaDeHorario, siglaDoDia } from '../../../../utils/disponibilidade'

const SELOS = {
  semanal: { texto: 'Semanal', classes: 'bg-sucesso-fundo text-sucesso-escura' },
  unica: { texto: 'Única vez', classes: 'bg-alerta-fundo text-alerta-escura' },
}

export default function PainelDisponibilidade({ itens, onAdicionar, onRemover }) {
  return (
    <section aria-labelledby="titulo-disponibilidade" className="flex min-w-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="titulo-disponibilidade" className="text-[15px] font-extrabold text-texto">Disponibilidade semanal</h2>
          <p className="text-[11px] text-secundaria">Horários recorrentes disponíveis para agendamentos</p>
        </div>
        <Button type="button" larguraAuto className="h-8 text-[11px]" onClick={onAdicionar}>
          <IconeMais tamanho={12} />
          Adicionar
        </Button>
      </div>

      {itens.length === 0 ? (
        <p className="rounded-xl bg-branco px-4 py-6 text-center text-[12px] text-secundaria">
          Nenhuma disponibilidade cadastrada
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {itens.map((item) => {
            const selo = SELOS[item.tipo]
            const horario = faixaDeHorario(item)
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-branco px-3 py-3 shadow-[0_1px_3px_var(--color-sombra)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-fundo-card text-[12px] font-extrabold text-primaria">
                  {siglaDoDia(item.dia)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <span className="text-[13px] font-bold text-texto">{horario}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selo.classes}`}>{selo.texto}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Remover disponibilidade de ${siglaDoDia(item.dia)}, ${horario}`}
                  onClick={() => onRemover(item)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-secundaria cursor-pointer hover:bg-erro-fundo hover:text-erro focus-visible:outline-2 focus-visible:outline-primaria"
                >
                  <IconeLixeira tamanho={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
