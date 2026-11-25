// ============================================================
// CalendarioDia
// Calendário do filtro "Dia" (frame "Acompanhamento de tarefa dia"):
// cartão branco de 287px com o mês ("Setembro 2026") e as setas, as letras dos dias
// da semana e os dias; dia com tarefa enviada tem um pontinho roxo embaixo.
// Props:
//   ano, mes          -> mês mostrado (mes de 0 a 11)
//   selecionado       -> dia escolhido, 'AAAA-MM-DD' ('' = nenhum)
//   diasComTarefa     -> Set com os dias 'AAAA-MM-DD' que têm tarefa
//   onSelecionar(iso) -> clique em um dia
//   onMudarMes(delta) -> -1 (mês anterior) ou 1 (próximo mês)
// ============================================================
import { IconeSetaDireita, IconeSetaEsquerda } from '../../../../components/IconesAgenda'
import { celulasDoMes, montarIso, tituloDoMes } from '../../../../utils/datasAgenda'

const SEMANA = [
  { id: 'dom', letra: 'D', nome: 'Domingo' },
  { id: 'seg', letra: 'S', nome: 'Segunda' },
  { id: 'ter', letra: 'T', nome: 'Terça' },
  { id: 'qua', letra: 'Q', nome: 'Quarta' },
  { id: 'qui', letra: 'Q', nome: 'Quinta' },
  { id: 'sex', letra: 'S', nome: 'Sexta' },
  { id: 'sab', letra: 'S', nome: 'Sábado' },
]

const BOTAO_SETA =
  'grid h-7 w-7 cursor-pointer place-items-center rounded-md text-secundaria hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-primaria'

export default function CalendarioDia({ ano, mes, selecionado, diasComTarefa, onSelecionar, onMudarMes }) {
  const celulas = celulasDoMes(ano, mes)

  return (
    <section
      aria-label="Calendário"
      className="w-[287px] max-w-full rounded-[14px] border border-borda bg-superficie px-[15px] pt-[18px] pb-4 shadow-[0_4px_14px_var(--color-sombra)]"
    >
      <div className="mb-3 flex items-center justify-between px-2">
        <button type="button" className={BOTAO_SETA} aria-label="Mês anterior" onClick={() => onMudarMes(-1)}>
          <IconeSetaEsquerda tamanho={14} />
        </button>
        <h2 className="text-[13px] font-bold text-texto" aria-live="polite">{tituloDoMes(ano, mes)}</h2>
        <button type="button" className={BOTAO_SETA} aria-label="Próximo mês" onClick={() => onMudarMes(1)}>
          <IconeSetaDireita tamanho={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {SEMANA.map((d) => (
          <span key={d.id} title={d.nome} className="h-[33px] text-[11px] font-semibold leading-[33px] text-secundaria">{d.letra}</span>
        ))}

        {celulas.map((dia, i) => {
          if (!dia) return <span key={`vazio-${i}`} />
          const iso = montarIso(ano, mes, dia)
          const ativo = iso === selecionado
          const temTarefa = diasComTarefa.has(iso)
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={ativo}
              aria-label={`${dia}${temTarefa ? ', com tarefa' : ''}`}
              onClick={() => onSelecionar(iso)}
              className={`relative mx-auto grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-lg text-[12px] focus-visible:outline-2 focus-visible:outline-primaria ${
                ativo ? 'bg-primaria font-bold text-branco' : 'text-texto hover:bg-fundo-suave'
              } ${i >= 7 ? 'mt-[3px]' : ''}`}
            >
              {dia}
              {/* pontinho embaixo do número, sem tirar o número do lugar */}
              {temTarefa && <span aria-hidden="true" className={`absolute bottom-0 h-1 w-1 rounded-full ${ativo ? 'bg-branco' : 'bg-primaria'}`} />}
            </button>
          )
        })}
      </div>
    </section>
  )
}
