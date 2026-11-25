// ============================================================
// ModalSolicitacaoAcesso
// Pop-up "Solicitação de acesso" (RF204–RF207, RN72):
//   - profissional (avatar, nome, especialidade e o selo "Pendente");
//   - os indicadores que ele pode ver, como caixas de marcar (Sentimento, Energia, Humor,
//     Horas de sono, Pensamentos, Acontecimentos e Tratamentos); o paciente marca só o que
//     quer mostrar. "Tratamentos" libera para o profissional os tratamentos (medicação).
// Mobile e Tablet (frame "Relatorios - Mobile-3"): título "Solicitação de acesso" com X,
//   caixas uma embaixo da outra e rodapé com "Aprovar" (roxo, com ✓) e "Recusar".
// Desktop (frame "Solicitação de acesso - Paciente"): 846px, sem a linha do título,
//   pergunta "O que deseja compartilhar com este profissional?", caixas em 2 colunas e
//   rodapé com "Cancelar", "Aprovar" e "Recusar" (RF206: recusar também no desktop).
// "Aprovar" fica desabilitado quando nenhum indicador está marcado.
// Usa o Modal e o Button compartilhados (sem alterar); o contêiner ajusta as medidas do Figma.
// Props:
//   aberto          -> mostra ou esconde
//   solicitacao     -> { nome, especialidade, indicadores } (ou null)
//   onFechar        -> X, Esc ou clique fora
//   onAprovar(lista) -> ids dos indicadores marcados
//   onRecusar       -> recusa a solicitação
//   onSalvar(lista) -> (já aprovado) grava as novas permissões
//   onRemover       -> (já aprovado) retira o acesso, depois da confirmação dentro do pop-up
//   enviando        -> desabilita os botões enquanto a API responde
// Profissional já aprovado: título "Acesso compartilhado", selo "Aprovado" e os botões
// "Remover acesso" e "Salvar alterações" (com as permissões atuais já marcadas).
// Para recomeçar com as marcações da solicitação, o pai troca a "key" ao abrir.
// ============================================================
import { useState } from 'react'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Button from '../../../../components/Button'
import { IconeCheck } from '../../../../components/Icones'
import Modal from '../../../../components/Modal'
import Selo from '../../../../components/Selo'
import { AJUSTE_SELO_DECIDIDO, AJUSTE_SELO_PENDENTE, AVATAR_PENDENTE } from './estilosRelatorios'
import { INDICADORES_ACESSO, nomeAvatarSolicitacao } from '../../../../utils/relatorios'

// medidas do Figma: 351px no mobile, cabeçalho de 63px com título de 16px e X de 18px,
// corpo com 12px nas laterais e rodapé com os dois botões dividindo a largura.
// Desktop (xl): 846px, a linha do título some (o título continua dando nome ao pop-up
// para leitores de tela), 20px nas laterais e rodapé sem a linha divisória.
const AJUSTE_MODAL = [
  '[&_dialog]:w-[calc(100%-52px)] xl:[&_dialog]:max-w-[846px] xl:[&_dialog]:rounded-xl',
  '[&_dialog>div>div:first-child]:py-[19px] xl:[&_dialog>div>div:first-child]:hidden',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:mt-0 [&_h2+button]:mr-[3px]',
  '[&_h2+button_svg]:h-[18px] [&_h2+button_svg]:w-[18px] [&_h2+button_svg]:[stroke-width:1.8]',
  '[&_dialog>div>div:nth-child(2)]:px-3 [&_dialog>div>div:nth-child(2)]:pt-[17px] [&_dialog>div>div:nth-child(2)]:pb-[33px]',
  'xl:[&_dialog>div>div:nth-child(2)]:px-5 xl:[&_dialog>div>div:nth-child(2)]:pt-4 xl:[&_dialog>div>div:nth-child(2)]:pb-5',
  '[&_dialog>div>div:last-child]:gap-[13px] [&_dialog>div>div:last-child]:pt-[17px] [&_dialog>div>div:last-child]:pb-[15px]',
  'xl:[&_dialog>div>div:last-child]:gap-2 xl:[&_dialog>div>div:last-child]:border-t-0 xl:[&_dialog>div>div:last-child]:px-5 xl:[&_dialog>div>div:last-child]:pt-0 xl:[&_dialog>div>div:last-child]:pb-4',
].join(' ')

// botões do rodapé: 37px no mobile e no tablet; 48px no desktop
const BOTAO = 'h-[37px]! flex-1 rounded-[10px]! text-[14px]! font-bold! xl:h-12! xl:rounded-xl! xl:font-semibold!'

export default function ModalSolicitacaoAcesso({ aberto, solicitacao, onFechar, onAprovar, onRecusar, onSalvar, onRemover, enviando = false }) {
  const [marcados, setMarcados] = useState(() => solicitacao?.indicadores ?? [])
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)
  const aprovado = solicitacao?.status === 'aprovado'

  const rodapePendente = (
    <>
      {/* desktop: "Cancelar" (só fecha) à esquerda do "Aprovar" */}
      <Button type="button" variante="suave" className={`${BOTAO} border-borda-forte! text-secundaria! max-xl:hidden`} onClick={onFechar}>
        Cancelar
      </Button>
      <Button type="button" className={`${BOTAO} shadow-sm`} disabled={marcados.length === 0 || enviando} onClick={() => onAprovar(marcados)}>
        <IconeCheck tamanho={14} />
        Aprovar
      </Button>
      {/* "Recusar" à direita do "Aprovar" (em todas as larguras) */}
      <Button type="button" variante="suave" className={`${BOTAO} border-borda! text-secundaria!`} disabled={enviando} onClick={onRecusar}>
        Recusar
      </Button>
    </>
  )

  const rodapeAprovado = confirmandoRemocao ? (
    <>
      <Button type="button" variante="suave" className={`${BOTAO} border-borda! text-secundaria!`} disabled={enviando} onClick={() => setConfirmandoRemocao(false)}>
        Voltar
      </Button>
      <Button type="button" variante="perigo" className={`${BOTAO} shadow-sm`} disabled={enviando} onClick={onRemover}>
        Remover acesso
      </Button>
    </>
  ) : (
    <>
      <Button type="button" variante="suave" className={`${BOTAO} border-erro-borda! text-erro-texto!`} disabled={enviando} onClick={() => setConfirmandoRemocao(true)}>
        Remover acesso
      </Button>
      <Button type="button" className={`${BOTAO} shadow-sm`} disabled={marcados.length === 0 || enviando} onClick={() => onSalvar(marcados)}>
        <IconeCheck tamanho={14} />
        Salvar alterações
      </Button>
    </>
  )

  // marca ou desmarca um indicador
  const alternar = (id) => setMarcados((lista) => (lista.includes(id) ? lista.filter((i) => i !== id) : [...lista, id]))

  return (
    <div className={AJUSTE_MODAL}>
      <Modal
        aberto={aberto}
        titulo={aprovado ? 'Acesso compartilhado' : 'Solicitação de acesso'}
        onFechar={onFechar}
        largura="max-w-[351px]"
        comDivisores
        rodape={aprovado ? rodapeAprovado : rodapePendente}
      >
        {solicitacao && (
          <>
            {/* profissional */}
            <div className="flex items-center gap-3 pr-px">
              <div className={AVATAR_PENDENTE}>
                <AvatarIniciais nome={nomeAvatarSolicitacao(solicitacao.nome)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-5 text-texto">{solicitacao.nome}</p>
                <p className="text-[12px] leading-4 text-secundaria">{solicitacao.especialidade}</p>
              </div>
              <span className={aprovado ? AJUSTE_SELO_DECIDIDO : AJUSTE_SELO_PENDENTE}>
                {aprovado ? (
                  <Selo tom="sucesso">
                    <IconeCheck tamanho={12} />
                    Aprovado
                  </Selo>
                ) : (
                  <Selo tom="alerta">Pendente</Selo>
                )}
              </span>
            </div>

            {confirmandoRemocao && (
              <p role="alert" className="mt-4 text-[14px] leading-5 text-secundaria xl:mt-[22px]">
                Tem certeza que deseja remover o acesso de <strong className="font-bold text-texto">{solicitacao.nome}</strong>?
                Ele deixará de ver todos os seus indicadores e tratamentos (poderá pedir acesso de novo).
              </p>
            )}

            {/* indicadores pedidos (caixas de marcar): 1 coluna no mobile e no tablet, 2 no desktop */}
            <fieldset hidden={confirmandoRemocao} className="mt-4 border-0 p-0 xl:mt-[22px]">
              <legend className="sr-only">Indicadores que o profissional poderá ver</legend>
              {/* pergunta do Figma desktop (no mobile o título do pop-up já explica) */}
              <p aria-hidden="true" className="mb-3 hidden text-[12px] font-bold leading-4 text-texto xl:block">
                {aprovado ? 'O que este profissional pode ver:' : 'O que deseja compartilhar com este profissional?'}
              </p>
              <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-x-[11px] xl:gap-y-2.5">
                {INDICADORES_ACESSO.map((ind) => {
                  const marcado = marcados.includes(ind.id)
                  return (
                    <label
                      key={ind.id}
                      className={`flex h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 xl:h-12 xl:border-2 text-[14px] leading-5 text-texto has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primaria ${
                        marcado ? 'border-primaria bg-fundo-card' : 'border-borda bg-superficie hover:bg-fundo-suave-2'
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={marcado} onChange={() => alternar(ind.id)} />
                      <span
                        aria-hidden="true"
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border ${
                          marcado ? 'border-primaria bg-primaria bg-botao text-branco' : 'border-borda bg-superficie'
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
