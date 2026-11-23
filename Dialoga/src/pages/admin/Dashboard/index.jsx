// ============================================================
// pages/admin/Dashboard
// "Aprovação de profissionais": resumo (pendentes/aprovados/recusados), busca,
// abas de filtro, lista de solicitações e os modais de detalhe e confirmação.
// Rota: /admin/dashboard
//
// Os dados e as ações (aprovar/recusar) vêm do hook useAprovacoes, que usa as
// rotas já existentes do back-end (ver services/aprovacoesService.js).
// Fluxo: clicar na linha  -> ModalSolicitacao -> Aprovar/Recusar -> ModalConfirmarDecisao -> Toast
//        clicar no ✓ / ✕  -> direto para o ModalConfirmarDecisao
// ============================================================
import { useCallback, useMemo, useRef, useState } from 'react'
import Button from '../../../components/Button'
import { useAuth } from '../../../contexts/AuthContext'
import Toast from '../../../components/Toast'
import useAprovacoes from '../../../hooks/useAprovacoes'
import { textoParaBusca } from '../../../utils/formatadores'
import CartaoSolicitacao from './components/CartaoSolicitacao'
import FiltrosAprovacoes from './components/FiltrosAprovacoes'
import ModalConfirmarDecisao from './components/ModalConfirmarDecisao'
import ModalSolicitacao from './components/ModalSolicitacao'
import ResumoAprovacoes from './components/ResumoAprovacoes'

const MENSAGENS_TOAST = {
  aprovar: { tipo: 'sucesso', mensagem: 'Profissional aprovado com sucesso.' },
  recusar: { tipo: 'sucesso', mensagem: 'Solicitação recusada com sucesso.' },
}

function ConteudoDashboardAdmin() {
  const { solicitacoes, pendentesDeOutros, carregando, erro, enviando, recarregar, aprovar, recusar } = useAprovacoes()

  const [filtro, setFiltro] = useState('pendente') // 'pendente' | 'aprovado' | 'recusado' | 'todos'
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState(null) // solicitação aberta no modal de detalhes
  const [decisao, setDecisao] = useState(null) // { tipo: 'aprovar' | 'recusar', solicitacao }
  const confirmandoRef = useRef(false)
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })

  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // Contadores dos cartões e das abas (sempre refletem a lista inteira)
  const contagens = useMemo(() => ({
    pendente: solicitacoes.filter((s) => s.status === 'pendente').length,
    aprovado: solicitacoes.filter((s) => s.status === 'aprovado').length,
    recusado: solicitacoes.filter((s) => s.status === 'recusado').length,
    todos: solicitacoes.length,
  }), [solicitacoes])

  // Lista mostrada: aba ativa + busca por nome, e-mail ou especialidade
  const visiveis = useMemo(() => {
    const termo = textoParaBusca(busca.trim())
    return solicitacoes.filter((s) => {
      if (filtro !== 'todos' && s.status !== filtro) return false
      if (!termo) return true
      return textoParaBusca(`${s.nome} ${s.email} ${s.especialidade}`).includes(termo)
    })
  }, [solicitacoes, filtro, busca])

  // Do modal de detalhes para a confirmação (um modal por vez, como no Figma)
  // Abre somente uma confirmação válida e nunca durante outra decisão.
  function pedirConfirmacao(tipo, solicitacao) {
    if (
      confirmandoRef.current ||
      enviando ||
      !solicitacao ||
      solicitacao.status !== 'pendente' ||
      !['aprovar', 'recusar'].includes(tipo)
    ) {
      return
    }

    setDetalhe(null)
    setDecisao({ tipo, solicitacao })
  }

  // Permite fechar a confirmação apenas antes de iniciar o envio.
  function cancelarDecisao() {
    if (confirmandoRef.current || enviando) return
    setDecisao(null)
  }

  // Mantém o modal aberto em falha para permitir nova tentativa.
  async function confirmar() {
    if (!decisao || confirmandoRef.current || enviando) return

    confirmandoRef.current = true
    const { tipo, solicitacao } = decisao

    try {
      const concluido = await (
        tipo === 'aprovar'
          ? aprovar(solicitacao)
          : recusar(solicitacao)
      )

      if (!concluido) return

      setDecisao(null)
      setToast({ aberto: true, ...MENSAGENS_TOAST[tipo] })
    } catch (erroDecisao) {
      setToast({
        aberto: true,
        tipo: 'erro',
        mensagem: erroDecisao.message || 'Não foi possível registrar a decisão.',
      })
    } finally {
      confirmandoRef.current = false
    }
  }

  return (
    <section className="mx-auto w-full max-w-[790px] px-5 py-10 md:pt-16">
      <h1 className="text-[22px] font-extrabold text-texto">Aprovação de profissionais</h1>
      <p className="mt-1 text-[12px] text-secundaria">Analise e gerencie as solicitações de acesso à plataforma</p>
      {/* Divisão fixa: as pendentes de outros administradores não aparecem aqui */}
      {!carregando && !erro && pendentesDeOutros > 0 && (
        <p className="mt-2 text-[11px] text-secundaria">
          {pendentesDeOutros === 1
            ? '1 solicitação pendente está atribuída a outro administrador.'
            : `${pendentesDeOutros} solicitações pendentes estão atribuídas a outros administradores.`}
        </p>
      )}

      <div className="mt-6">
        <ResumoAprovacoes pendentes={contagens.pendente} aprovados={contagens.aprovado} recusados={contagens.recusado} />
      </div>

      <div className="mt-4">
        <FiltrosAprovacoes
          busca={busca}
          onAlterarBusca={setBusca}
          filtro={filtro}
          onAlterarFiltro={setFiltro}
          contagens={contagens}
        />
      </div>

      {carregando && <p role="status" className="mt-6 text-[12px] text-secundaria">Carregando solicitações...</p>}
      {erro && (
        <div role="alert" className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-4">
          <p className="text-[12px] text-erro">{erro}</p>
          <Button type="button" variante="suave" larguraAuto onClick={recarregar}>
            Tentar novamente
          </Button>
        </div>
      )}
      {!carregando && !erro && visiveis.length === 0 && (
        <p className="mt-6 text-[12px] text-secundaria">Nenhuma solicitação encontrada.</p>
      )}

      {!carregando && !erro && (
        <ul className="flex flex-col gap-3 mt-4">
          {visiveis.map((s) => (
            <CartaoSolicitacao
              key={s.id}
              solicitacao={s}
              onAbrir={() => setDetalhe(s)}
              onAprovar={() => pedirConfirmacao('aprovar', s)}
              onRecusar={() => pedirConfirmacao('recusar', s)}
            />
          ))}
        </ul>
      )}

      <ModalSolicitacao
        solicitacao={detalhe}
        onFechar={() => setDetalhe(null)}
        onAprovar={() => pedirConfirmacao('aprovar', detalhe)}
        onRecusar={() => pedirConfirmacao('recusar', detalhe)}
      />

      <ModalConfirmarDecisao
        decisao={decisao}
        enviando={enviando}
        onCancelar={cancelarDecisao}
        onConfirmar={confirmar}
      />

      <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
    </section>
  )
}

// Reinicia modais e mensagens quando a credencial da sessão muda.
export default function DashboardAdmin() {
  const { auth } = useAuth()
  return <ConteudoDashboardAdmin key={auth?.token ?? 'sem-sessao'} />
}
