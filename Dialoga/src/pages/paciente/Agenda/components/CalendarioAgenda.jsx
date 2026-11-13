// ============================================================
// CalendarioAgenda
// Cartão do calendário: setas + título do período + seletor Mês/Semana/Dia
// e, embaixo, a visão escolhida (GradeMes ou GradeHoras).
// Props:
//   visao, onMudarVisao
//   titulo        -> texto ao lado das setas (ex.: 'Setembro 2026')
//   onNavegar(-1 | 1)
//   ...demais props vão para a grade: ano, mes, dias, selecionado, hoje,
//     diasComConsulta, consultas, onSelecionar
// ============================================================
import Card from '../../../../components/Card'
import { IconeSetaDireita, IconeSetaEsquerda } from '../../../../components/IconesAgenda'
import GradeHoras from './GradeHoras'
import GradeMes from './GradeMes'
import SeletorVisao from './SeletorVisao'

const BOTAO_SETA = 'grid h-6 w-6 place-items-center rounded-md text-secundaria cursor-pointer hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-primaria'

export default function CalendarioAgenda({ visao, onMudarVisao, titulo, onNavegar, ...grade }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borda px-4 py-3">
        <div className="flex items-center gap-2">
          <button type="button" className={BOTAO_SETA} aria-label="Período anterior" onClick={() => onNavegar(-1)}>
            <IconeSetaEsquerda tamanho={14} />
          </button>
          <h2 className="text-[11px] font-extrabold text-texto" aria-live="polite">{titulo}</h2>
          <button type="button" className={BOTAO_SETA} aria-label="Próximo período" onClick={() => onNavegar(1)}>
            <IconeSetaDireita tamanho={14} />
          </button>
        </div>
        <SeletorVisao visao={visao} onMudar={onMudarVisao} />
      </div>

      {visao === 'mes' ? (
        <GradeMes
          ano={grade.ano}
          mes={grade.mes}
          selecionado={grade.selecionado}
          hoje={grade.hoje}
          diasComConsulta={grade.diasComConsulta}
          onSelecionar={grade.onSelecionar}
        />
      ) : (
        <GradeHoras dias={grade.dias} consultas={grade.consultas} />
      )}
    </Card>
  )
}
