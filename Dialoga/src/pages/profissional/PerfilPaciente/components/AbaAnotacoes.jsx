// ============================================================
// AbaAnotacoes
// Anotações privadas do profissional sobre o paciente (RF221, RF222, RF310, RF311),
// como no Figma: um cartão com o cabeçalho "Anotações privadas (visíveis apenas
// para você)" e "+ Nova nota", e as notas (título, data, conteúdo, lápis e lixeira)
// separadas por linhas. Sem notas, mostra o estado "Sem anotações" com o botão "Nova nota".
// No mobile, "(visíveis apenas para você)" desce para baixo do título para o
// "+ Nova nota" caber (no Figma mobile ele ficava cortado).
// Props:
//   anotacoes -> [{ id, titulo, conteudo, data }]
//   onNova    -> clique em "+ Nova nota" (ou no botão do estado vazio)
//   onEditar  -> (anotacao) => void, clique no lápis
//   onExcluir -> (anotacao) => void, clique na lixeira
// ============================================================
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import { IconeAnotacao } from '../../Pacientes/components/iconesPacientes'
import { formatarDataExtenso } from './datasPerfil'
import { BOTAO_PEQUENO } from './estilosPerfil'
import { IconeEditar, IconeExcluir, IconeMaisFino } from './iconesPerfil'

// botão quadrado de ícone (editar / excluir)
const BOTAO_ICONE =
  'grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-secundaria transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function AbaAnotacoes({ anotacoes, onNova, onEditar, onExcluir }) {
  return (
    <Card as="section" aria-label="Anotações privadas" className="overflow-hidden">
      <div className="flex min-h-[61px] items-center justify-between gap-3 border-b border-borda px-5 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <IconeAnotacao className="mt-0.5 text-primaria-texto" />
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
            <h2 className="text-[14px] font-bold leading-5 text-texto">Anotações privadas</h2>
            <span className="text-[11px] leading-4 text-secundaria">(visíveis apenas para você)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onNova}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold text-primaria-texto transition-colors duration-200 hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeMaisFino tamanho={13} />
          Nova nota
        </button>
      </div>

      {anotacoes.length === 0 ? (
        // estado "Sem anotações" (RF222)
        <div className="flex flex-col items-center px-5 pt-[34px] pb-10 text-center">
          <span aria-hidden="true" className="text-[28px] leading-none">
            📝
          </span>
          <p className="mt-4 text-[14px] font-bold text-texto">Sem anotações</p>
          <p className="mt-1 text-[12px] text-secundaria">Registre observações clínicas sobre este paciente.</p>
          <div className="mt-3">
            <Button type="button" larguraAuto className={BOTAO_PEQUENO} onClick={onNova}>
              Nova nota
            </Button>
          </div>
        </div>
      ) : (
        <ul aria-label="Lista de anotações" className="divide-y divide-borda">
          {anotacoes.map((nota) => (
            <li key={nota.id} className="flex items-start gap-5 px-5 pt-[15px] pb-[17px]">
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-[14px] font-bold leading-5 text-texto">{nota.titulo}</h3>
                <p className="text-[12px] leading-4 text-secundaria">{formatarDataExtenso(nota.data)}</p>
                <p className="mt-[7px] whitespace-pre-line break-words text-[14px] leading-[23px] text-texto">{nota.conteudo}</p>
              </div>
              <div className="flex shrink-0 gap-[3px]">
                <button
                  type="button"
                  aria-label={`Editar anotação ${nota.titulo}`}
                  onClick={() => onEditar(nota)}
                  className={`${BOTAO_ICONE} hover:bg-fundo-suave hover:text-primaria-texto`}
                >
                  <IconeEditar />
                </button>
                <button
                  type="button"
                  aria-label={`Excluir anotação ${nota.titulo}`}
                  onClick={() => onExcluir(nota)}
                  className={`${BOTAO_ICONE} hover:bg-erro-fundo hover:text-erro-texto`}
                >
                  <IconeExcluir />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
