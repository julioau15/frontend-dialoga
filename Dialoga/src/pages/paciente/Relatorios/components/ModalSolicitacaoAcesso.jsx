// ============================================================
// ModalSolicitacaoAcesso
// Pop-up "Solicitação de acesso" (frame "Relatorios - Mobile-3"):
//   - profissional (avatar, nome, especialidade e o selo "Pendente");
//   - os indicadores que ele pediu para ver, como caixas de marcar (Sentimento, Energia,
//     Humor, Horas de sono, Acontecimentos); o paciente pode desmarcar o que não quer mostrar;
//   - rodapé com "Aprovar" (roxo, com ✓) e "Recusar".
// "Aprovar" fica desabilitado quando nenhum indicador está marcado.
// Usa o Modal e o Button compartilhados (sem alterar); o contêiner ajusta as medidas do Figma.
// Props:
//   aberto          -> mostra ou esconde
//   solicitacao     -> { nome, especialidade, indicadores } (ou null)
//   onFechar        -> X, Esc ou clique fora
//   onAprovar(lista) -> ids dos indicadores marcados
//   onRecusar       -> recusa a solicitação
// Para recomeçar com as marcações da solicitação, o pai troca a "key" ao abrir.
// ============================================================
import { useState } from 'react'
import Button from '../../../../components/Button'
import { IconeCheck } from '../../../../components/Icones'
import Modal from '../../../../components/Modal'
import Selo from '../../../../components/Selo'
import { AJUSTE_SELO_PENDENTE, AVATAR_PENDENTE } from './estilosRelatorios'
import { INDICADORES_ACESSO, iniciaisSolicitacao } from './relatoriosMock'

// medidas do Figma: 351px no mobile, cabeçalho de 63px com título de 16px e X de 18px,
// corpo com 12px nas laterais e rodapé com os dois botões dividindo a largura
const AJUSTE_MODAL = [
  '[&_dialog]:w-[calc(100%-52px)]',
  '[&_dialog>div>div:first-child]:py-[19px]',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:mt-0 [&_h2+button]:mr-[3px]',
  '[&_h2+button_svg]:h-[18px] [&_h2+button_svg]:w-[18px] [&_h2+button_svg]:[stroke-width:1.8]',
  '[&_dialog>div>div:nth-child(2)]:px-3 [&_dialog>div>div:nth-child(2)]:pt-[17px] [&_dialog>div>div:nth-child(2)]:pb-[33px]',
  '[&_dialog>div>div:last-child]:gap-[13px] [&_dialog>div>div:last-child]:pt-[17px] [&_dialog>div>div:last-child]:pb-[15px]',
].join(' ')

const BOTAO = 'h-[37px]! flex-1 rounded-[10px]! text-[14px]! font-bold!'

export default function ModalSolicitacaoAcesso({ aberto, solicitacao, onFechar, onAprovar, onRecusar }) {
  const [marcados, setMarcados] = useState(() => solicitacao?.indicadores ?? [])

  // marca ou desmarca um indicador
  const alternar = (id) => setMarcados((lista) => (lista.includes(id) ? lista.filter((i) => i !== id) : [...lista, id]))

  return (
    <div className={AJUSTE_MODAL}>
      <Modal
        aberto={aberto}
        titulo="Solicitação de acesso"
        onFechar={onFechar}
        largura="max-w-[351px]"
        comDivisores
        rodape={
          <>
            <Button type="button" className={`${BOTAO} shadow-sm`} disabled={marcados.length === 0} onClick={() => onAprovar(marcados)}>
              <IconeCheck tamanho={14} />
              Aprovar
            </Button>
            <Button type="button" variante="suave" className={`${BOTAO} border-borda! text-secundaria!`} onClick={onRecusar}>
              Recusar
            </Button>
          </>
        }
      >
        {solicitacao && (
          <>
            {/* profissional */}
            <div className="flex items-center gap-3 pr-px">
              <span aria-hidden="true" className={AVATAR_PENDENTE}>
                {iniciaisSolicitacao(solicitacao.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-5 text-texto">{solicitacao.nome}</p>
                <p className="text-[12px] leading-4 text-secundaria">{solicitacao.especialidade}</p>
              </div>
              <span className={AJUSTE_SELO_PENDENTE}>
                <Selo tom="alerta">Pendente</Selo>
              </span>
            </div>

            {/* indicadores pedidos (caixas de marcar) */}
            <fieldset className="mt-4 border-0 p-0">
              <legend className="sr-only">Indicadores que o profissional poderá ver</legend>
              <div className="flex flex-col gap-3">
                {INDICADORES_ACESSO.map((ind) => {
                  const marcado = marcados.includes(ind.id)
                  return (
                    <label
                      key={ind.id}
                      className={`flex h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-[14px] leading-5 text-texto has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primaria ${
                        marcado ? 'border-primaria bg-fundo-card' : 'border-borda bg-branco hover:bg-fundo-suave-2'
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={marcado} onChange={() => alternar(ind.id)} />
                      <span
                        aria-hidden="true"
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border ${
                          marcado ? 'border-primaria bg-primaria text-branco' : 'border-borda bg-branco'
                        }`}
                      >
                        {marcado && <IconeCheck tamanho={11} />}
                      </span>
                      {ind.rotulo}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </>
        )}
      </Modal>
    </div>
  )
}
