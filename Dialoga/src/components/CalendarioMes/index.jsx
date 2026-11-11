// ============================================================
// components/CalendarioMes
// Calendário do mês (cartão com setas, dias da semana e dias).
// Props:
//   ano, mes            -> mês mostrado (mes de 0 a 11)
//   selecionado         -> dia escolhido, 'AAAA-MM-DD'
//   diasComConsulta     -> Set com os dias que têm consulta (ficam com um pontinho)
//   onSelecionar(iso)   -> clique em um dia
//   onMudarMes(delta)   -> -1 (mês anterior) ou 1 (próximo mês)
// ============================================================
import { celulasDoMes, montarIso, tituloDoMes } from '../../utils/datasAgenda'
import { IconeSetaDireita, IconeSetaEsquerda } from '../IconesAgenda'

const SEMANA = [
  { id: 'dom', letra: 'D', nome: 'Domingo' },
  { id: 'seg', letra: 'S', nome: 'Segunda' },
  { id: 'ter', letra: 'T', nome: 'Terça' },
  { id: 'qua', letra: 'Q', nome: 'Quarta' },
  { id: 'qui', letra: 'Q', nome: 'Quinta' },
  { id: 'sex', letra: 'S', nome: 'Sexta' },
  { id: 'sab', letra: 'S', nome: 'Sábado' },
]

const BOTAO_SETA = 'grid place-items-center h-6 w-6 rounded-md text-secundaria cursor-pointer hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-primaria'

export default function CalendarioMes({ ano, mes, selecionado, diasComConsulta, onSelecionar, onMudarMes }) {
  const celulas = celulasDoMes(ano, mes)

  return (
    <section aria-label="Calendário" className="w-full p-4 rounded-xl bg-branco shadow-[0_1px_3px_var(--color-sombra)]">
      <div className="flex items-center justify-between mb-3">
        <button type="button" className={BOTAO_SETA} aria-label="Mês anterior" onClick={() => onMudarMes(-1)}>
          <IconeSetaEsquerda tamanho={14} />
        </button>
        <h2 className="text-[12px] font-extrabold text-texto" aria-live="polite">{tituloDoMes(ano, mes)}</h2>
        <button type="button" className={BOTAO_SETA} aria-label="Próximo mês" onClick={() => onMudarMes(1)}>
          <IconeSetaDireita tamanho={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {SEMANA.map((d) => (
          <span key={d.id} title={d.nome} className="text-[10px] font-semibold text-secundaria leading-6">{d.letra}</span>
        ))}

        {celulas.map((dia, i) => {
          if (!dia) return <span key={`vazio-${i}`} />
          const iso = montarIso(ano, mes, dia)
          const ativo = iso === selecionado
          const temConsulta = diasComConsulta.has(iso)
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={ativo}
              aria-label={`${dia}${temConsulta ? ', com consulta' : ''}`}
              onClick={() => onSelecionar(iso)}
              className={`relative mx-auto grid h-8 w-8 place-items-center rounded-lg text-[11px] font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-primaria ${
                ativo ? 'bg-primaria text-branco' : 'text-texto hover:bg-fundo-suave'
              }`}
            >
              {dia}
              {temConsulta && !ativo && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-erro" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}
