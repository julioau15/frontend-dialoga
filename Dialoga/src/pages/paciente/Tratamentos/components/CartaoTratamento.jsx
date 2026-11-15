// ============================================================
// CartaoTratamento
// Item da lista de Tratamentos (RF333–RF335, RF337, RF338), como no Figma:
//   - nome do medicamento com a dosagem num selo lilás ao lado;
//   - frequência na linha de baixo;
//   - um chip por horário (relógio + hora) e "Lembrete ativo" em verde (só com lembrete);
//   - lápis (editar) e lixeira (excluir) no canto direito.
// No mobile, "Lembrete ativo" desce para a linha de baixo quando não cabe ao lado dos horários.
// Props:
//   tratamento -> { id, nome, dosagem, frequencia, horarios, lembrete }
//   onEditar(tratamento)  -> abre o pop-up "Editar tratamento"
//   onExcluir(tratamento) -> abre o pop-up "Excluir tratamento"
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeEditar, IconeLixeira, IconeRelogio, IconeSino } from './iconesTratamentos'

// selo do Figma: 20px de altura, texto de 12px e 8px nas laterais (o Selo compartilhado não muda)
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-5 [&>span]:px-2 [&>span]:py-0 [&>span]:text-[12px]'

// botão quadrado só com ícone (editar / excluir)
const BOTAO_ICONE =
  'grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-secundaria transition-colors duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CartaoTratamento({ tratamento, onEditar, onExcluir }) {
  const idTitulo = useId()
  const { nome, dosagem, frequencia, horarios, lembrete } = tratamento

  return (
    <Card as="article" aria-labelledby={idTitulo} className="flex items-start justify-between gap-3 p-5">
      <div className="min-w-0 flex-1">
        {/* nome + selo da dosagem (o selo desce se o nome for muito longo) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 id={idTitulo} className="break-words text-[16px] font-bold leading-5 text-texto">
            {nome}
          </h2>
          <span className={AJUSTE_SELO}>
            <Selo tom="primaria">{dosagem}</Selo>
          </span>
        </div>

        {frequencia && <p className="mt-[7px] text-[14px] leading-5 text-secundaria">{frequencia}</p>}

        {/* horários do dia (um chip por horário) e o lembrete */}
        {(horarios.length > 0 || lembrete) && (
          <div className="mt-[9px] flex flex-wrap items-center gap-2">
            {horarios.length > 0 && (
              <ul aria-label="Horários" className="flex flex-wrap gap-2">
                {horarios.map((hora) => (
                  <li
                    key={hora}
                    className="inline-flex h-[22px] items-center gap-1 rounded-md bg-borda px-2 text-[12px] font-semibold text-texto"
                  >
                    <IconeRelogio tamanho={11} className="text-secundaria" />
                    {hora}
                  </li>
                ))}
              </ul>
            )}
            {/* verde escuro: texto de 12px passa no contraste mínimo (AA) */}
            {lembrete && (
              <p className="inline-flex items-center gap-1 text-[12px] font-semibold text-sucesso-escura">
                <IconeSino tamanho={11} />
                Lembrete ativo
              </p>
            )}
          </div>
        )}
      </div>

      {/* mr-[3px]: posição dos ícones no Figma (23px da borda do cartão) */}
      <div className="mr-[3px] flex shrink-0 gap-2">
        <button
          type="button"
          aria-label={`Editar ${nome}`}
          onClick={() => onEditar(tratamento)}
          className={`${BOTAO_ICONE} hover:bg-fundo-suave hover:text-primaria`}
        >
          <IconeEditar tamanho={15} />
        </button>
        <button
          type="button"
          aria-label={`Excluir ${nome}`}
          onClick={() => onExcluir(tratamento)}
          className={`${BOTAO_ICONE} hover:bg-erro-fundo hover:text-erro`}
        >
          <IconeLixeira tamanho={15} />
        </button>
      </div>
    </Card>
  )
}
