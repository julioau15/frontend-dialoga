// ============================================================
// CartaoAnotacoesPeriodo
// Seção "Anotações" da tela Relatórios, como no Figma: um item por dia do período que
// tem anotação, do mais antigo para o mais recente, com:
//   - quadrado com o emoji do humor do dia (verde 😊 Positivo, roxo 😐 Moderado,
//     vermelho 😟 Atenção) e a data ("30/08") embaixo;
//   - etiquetas lilás com sentimento, energia, humor e pensamentos e a azul com o sono;
//   - o texto da anotação e, no desktop, "Ver mais" (abre o texto inteiro quando é longo).
// Props:
//   registros -> registros do período (formato de utils/relatorios); só os que têm anotação aparecem
// Tablet segue o mobile: texto inteiro e sem "Ver mais"
// ============================================================
import { useId, useState } from 'react'
import Card from '../../../../components/Card'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import { IconeAnotacao } from './iconesRelatorios'
import { INDICADORES, diaMes, faixaDe, notaMaxima } from '../../../../utils/relatorios'

// quadrado do humor do dia, pela faixa da nota do humor
const HUMOR_DO_DIA = {
  positivo: { emoji: '😊', fundo: 'bg-sucesso bg-barra-positivo' },
  moderado: { emoji: '😐', fundo: 'bg-primaria bg-barra-moderado' },
  atencao: { emoji: '😟', fundo: 'bg-erro bg-barra-atencao' },
}
const INDICADOR_HUMOR = INDICADORES.find((i) => i.id === 'humor')

// ordem das etiquetas no Figma: sentimento, energia, humor e pensamentos
const ORDEM_ETIQUETAS = ['sentimento', 'energia', 'humor', 'pensamentos']

const ETIQUETA = 'inline-flex h-5 items-center rounded-full px-2 text-[12px] leading-4'

// um dia com anotação
function ItemAnotacao({ registro }) {
  const [aberto, setAberto] = useState(false)
  const idTexto = useId()
  // sem humor informado, o quadrado fica no tom neutro (moderado)
  const nota = INDICADOR_HUMOR.notas[registro.humor]
  const humor = nota ? HUMOR_DO_DIA[faixaDe(nota, notaMaxima(INDICADOR_HUMOR))] : HUMOR_DO_DIA.moderado

  return (
    <li className="flex gap-3 border-t border-borda px-5 pt-[17px] pb-4 xl:pr-10 xl:pl-[21px]">
      <div className="flex w-10 shrink-0 flex-col items-center">
        <span aria-hidden="true" className={`grid h-10 w-10 place-items-center rounded-xl text-[14px] ${humor.fundo}`}>
          {humor.emoji}
        </span>
        <p className="mt-0.5 text-[12px] leading-4 text-secundaria">{diaMes(registro.data)}</p>
      </div>

      <div className="min-w-0 flex-1">
        <ul aria-label="Como foi o dia" className="flex flex-wrap gap-1.5">
          {ORDEM_ETIQUETAS.filter((id) => registro[id]).map((id) => (
            <li key={id} className={`${ETIQUETA} bg-fundo-card text-primaria-texto`}>
              {registro[id]}
            </li>
          ))}
          {typeof registro.sono === 'number' && (
            <li className={`${ETIQUETA} gap-0.5 bg-info-fundo text-info-texto`}>
              <span aria-hidden="true" className="text-[10px]">
                🌙
              </span>
              {registro.sono}h sono
            </li>
          )}
        </ul>
        {/* no desktop o texto fica numa linha até abrir com "Ver mais"; no mobile e tablet aparece inteiro */}
        <p id={idTexto} className={`mt-[9px] text-[14px] leading-[23px] text-texto xl:mt-[11px] xl:leading-5 ${aberto ? '' : 'xl:line-clamp-1'}`}>
          {registro.anotacao}
        </p>
      </div>

      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={idTexto}
        onClick={() => setAberto((a) => !a)}
        className="hidden shrink-0 cursor-pointer self-center rounded-sm text-[12px] font-semibold text-primaria-texto hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria xl:block"
      >
        {aberto ? 'Ver menos' : 'Ver mais'}
      </button>
    </li>
  )
}

export default function CartaoAnotacoesPeriodo({ registros }) {
  const anotacoes = registros.filter((r) => r.anotacao)

  return (
    <Card as="section" aria-label="Anotações" className="overflow-hidden rounded-2xl! shadow-[0_2px_4px_var(--color-borda)]!">
      <div className="flex min-h-[52px] items-center px-5 py-3 xl:min-h-[53px] xl:pr-[22px] xl:pl-[21px]">
        <div className="w-full">
          <CabecalhoCartao
            icone={<IconeAnotacao tamanho={16} className="text-primaria-texto" />}
            titulo="Anotações"
            direita={<p className="text-[12px] leading-5 text-secundaria">{anotacoes.length} registro(s)</p>}
          />
        </div>
      </div>

      {anotacoes.length === 0 ? (
        <p className="border-t border-borda px-5 py-6 text-center text-[13px] text-secundaria xl:px-[21px]">Nenhuma anotação no período.</p>
      ) : (
        <ul>
          {anotacoes.map((r) => (
            <ItemAnotacao key={r.data} registro={r} />
          ))}
        </ul>
      )}
    </Card>
  )
}
