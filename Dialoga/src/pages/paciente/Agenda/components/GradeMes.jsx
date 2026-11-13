// ============================================================
// GradeMes
// Visão "Mês": dias da semana + dias do mês.
//   - dia escolhido: roxo | hoje (se não escolhido): rosa
//   - dias com consulta: pontinho embaixo do número
// Props: ano, mes (0-11), selecionado, hoje, diasComConsulta (Set), onSelecionar(iso)
// ============================================================
import { celulasDoMes, montarIso } from '../../../../utils/datasAgenda'
import { NOMES_DIAS_SEMANA } from '../../../../utils/datasAgendaPaciente'

export default function GradeMes({ ano, mes, selecionado, hoje, diasComConsulta, onSelecionar }) {
  const celulas = celulasDoMes(ano, mes)

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-borda py-3 text-center">
        {NOMES_DIAS_SEMANA.map((nome) => (
          <span key={nome} className="text-[10px] text-secundaria">{nome}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 p-2 sm:p-3">
        {celulas.map((dia, i) => {
          if (!dia) return <span key={`vazio-${i}`} />
          const iso = montarIso(ano, mes, dia)
          const ativo = iso === selecionado
          const ehHoje = iso === hoje
          const temConsulta = diasComConsulta.has(iso)
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={ativo}
              aria-label={`${dia}${ehHoje ? ', hoje' : ''}${temConsulta ? ', com consulta' : ''}`}
              onClick={() => onSelecionar(iso)}
              className={`mx-px flex h-11 flex-col items-center justify-center gap-1 rounded-xl text-[11px] cursor-pointer focus-visible:outline-2 focus-visible:outline-primaria sm:h-[76px] ${
                ativo ? 'bg-primaria text-branco' : ehHoje ? 'bg-erro-borda-2 text-texto' : 'text-texto hover:bg-fundo-suave'
              }`}
            >
              <span className={ativo ? '' : 'font-semibold'}>{dia}</span>
              <span className={`h-1 w-1 rounded-full ${temConsulta ? (ativo ? 'bg-branco' : 'bg-primaria') : ''}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
