// ============================================================
// CartaoSolicitacoesAcesso
// "🔑 Solicitações de acesso" da tela Relatórios (frames "Relatorio - Paciente" e
// "Relatorios - Mobile", "-1", "-2" e "-3"):
//   - profissionais pedindo para ver os indicadores, com o selo laranja "Pendente";
//   - no mobile e no tablet, a etiqueta vermelha com a quantidade de pendentes no topo
//     (no desktop o Figma não mostra);
//   - clicar numa solicitação pendente abre o pop-up (ModalSolicitacaoAcesso);
//   - "Aprovar" mostra o aviso verde "Acesso concedido ao profissional!" e o selo vira
//     "Aprovado"; "Recusar" mostra o aviso vermelho "Solicitação recusada." e o selo vira
//     "Recusado". Mobile e tablet: a solicitação respondida fica mais clara e vai para o fim
//     da lista; desktop (frame "Solicitação aprovada"): continua no mesmo lugar, sem clarear.
// Só visual: dados fixos (mock) guardados no estado da tela, sem API.
// ============================================================
import { useCallback, useState } from 'react'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import Toast from '../../../../components/Toast'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import ModalSolicitacaoAcesso from './ModalSolicitacaoAcesso'
import { AJUSTE_SELO_DECIDIDO, AJUSTE_SELO_PENDENTE, AJUSTE_TOAST, AVATAR_PENDENTE, AVATAR_RESPONDIDA } from './estilosRelatorios'
import { IconeTarefa } from './iconesRelatorios'
import { SOLICITACOES_MOCK, nomeAvatarSolicitacao } from './relatoriosMock'

// avisos depois de responder
const AVISOS = {
  aprovado: { tipo: 'sucesso', mensagem: 'Acesso concedido ao profissional!' },
  recusado: { tipo: 'erro', mensagem: 'Solicitação recusada.' },
}

// selo do status ("Pendente", "Aprovado" ou "Recusado")
function SeloStatus({ status, className = '' }) {
  if (status === 'pendente') {
    return (
      <span className={`${AJUSTE_SELO_PENDENTE} ${className}`}>
        <Selo tom="alerta">Pendente</Selo>
      </span>
    )
  }
  return (
    <span className={`${AJUSTE_SELO_DECIDIDO} ${className}`}>
      {status === 'aprovado' ? (
        <Selo tom="sucesso">
          <IconeTarefa tamanho={12} />
          Aprovado
        </Selo>
      ) : (
        <Selo tom="neutro">Recusado</Selo>
      )}
    </span>
  )
}

// conteúdo de uma linha (avatar, nome, especialidade e selo)
// mobile e tablet: selo à direita, no meio da linha; desktop (cartão estreito, como no Figma):
// nome numa linha só e o selo na linha da especialidade
function Linha({ solicitacao }) {
  const { nome, especialidade, status } = solicitacao
  const pendente = status === 'pendente'
  return (
    <>
      {/* respondida: avatar de 36px no mobile e no tablet (Figma) */}
      <div className={pendente ? AVATAR_PENDENTE : AVATAR_RESPONDIDA}>
        <AvatarIniciais nome={nomeAvatarSolicitacao(nome)} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className={`text-[14px] leading-5 text-texto ${pendente ? 'font-bold' : 'font-semibold xl:font-bold'}`}>{nome}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-[12px] leading-4 text-secundaria">{especialidade}</p>
          <SeloStatus status={status} className="-my-[3px] max-xl:hidden" />
        </div>
      </div>
      <SeloStatus status={status} className="xl:hidden" />
    </>
  )
}

export default function CartaoSolicitacoesAcesso() {
  const [solicitacoes, setSolicitacoes] = useState(SOLICITACOES_MOCK)
  const [aberta, setAberta] = useState(null) // solicitação no pop-up
  const [chave, setChave] = useState(0) // recomeça as marcações do pop-up a cada abertura
  const [aviso, setAviso] = useState(null)

  const pendentes = solicitacoes.filter((s) => s.status === 'pendente')

  // abre o pop-up de uma solicitação pendente
  function abrir(solicitacao) {
    setChave((c) => c + 1)
    setAberta(solicitacao)
  }

  // aprova ou recusa: muda o status (a solicitação fica no mesmo lugar da lista) e mostra o aviso
  function responder(status, indicadores) {
    setSolicitacoes((lista) =>
      lista.map((s) => (s.id === aberta.id ? { ...s, status, indicadores: indicadores ?? s.indicadores } : s)),
    )
    setAberta(null)
    setAviso(AVISOS[status])
  }

  // o Toast compara esta função entre renderizações: precisa ser a mesma
  const fecharAviso = useCallback(() => setAviso(null), [])

  return (
    <Card as="section" aria-label="Solicitações de acesso" className="overflow-hidden rounded-2xl! shadow-[0_2px_4px_var(--color-borda)]!">
      <div className="px-4 pt-[18px] pb-4 xl:px-5 xl:pb-[13px]">
        <CabecalhoCartao
          icone={
            <span aria-hidden="true" className="text-[13px] leading-none">
              🔑
            </span>
          }
          titulo="Solicitações de acesso"
          subtitulo="Profissionais solicitando ver seus indicadores"
          direita={
            pendentes.length > 0 && (
              <p className="mt-[11px] inline-flex h-6 items-center rounded-full bg-erro-borda px-2.5 text-[13px] font-semibold text-erro xl:hidden">
                {pendentes.length} {pendentes.length === 1 ? 'pendente' : 'pendentes'}
              </p>
            )
          }
        />
      </div>

      {/* lista na ordem original; no mobile e no tablet a respondida vai para o fim (order-last) */}
      <ul className="flex flex-col">
        {solicitacoes.map((s) =>
          s.status === 'pendente' ? (
            <li key={s.id} className="border-t border-borda">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Ver a solicitação de ${s.nome}`}
                onClick={() => abrir(s)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaria xl:pr-6 xl:pl-5"
              >
                <Linha solicitacao={s} />
              </button>
            </li>
          ) : (
            <li key={s.id} className="flex items-center gap-3 border-t border-borda px-4 py-4 max-xl:order-last max-xl:opacity-60 xl:pr-6 xl:pl-5">
              <Linha solicitacao={s} />
            </li>
          ),
        )}
      </ul>

      <ModalSolicitacaoAcesso
        key={chave}
        aberto={!!aberta}
        solicitacao={aberta}
        onFechar={() => setAberta(null)}
        onAprovar={(indicadores) => responder('aprovado', indicadores)}
        onRecusar={() => responder('recusado')}
      />

      <div className={AJUSTE_TOAST}>
        <Toast aberto={!!aviso} tipo={aviso?.tipo} mensagem={aviso?.mensagem} onFechar={fecharAviso} />
      </div>
    </Card>
  )
}
