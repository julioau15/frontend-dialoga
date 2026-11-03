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
import { useCallback, useMemo, useState } from 'react'
import Toast from '../../../components/Toast'
import useAprovacoes from '../../../hooks/useAprovacoes'
import { textoParaBusca } from '../../../utils/formatadores'
import CartaoSolicitacao from './components/CartaoSolicitacao'
import FiltrosAprovacoes from './components/FiltrosAprovacoes'
import ModalConfirmarDecisao from './components/ModalConfirmarDecisao'
import ModalSolicitacao from './components/ModalSolicitacao'
import ResumoAprovacoes from './components/ResumoAprovacoes'

const MENSAGENS_TOAST = {
  aprovar: { tipo: 'sucesso', mensagem: 'Profissional aprovado. Um e-mail de confirmação foi enviado.' },
  recusar: { tipo: 'erro', mensagem: 'Solicitação recusada. O profissional será notificado por e-mail.' },
}

export default function DashboardAdmin() {
  const { solicitacoes, carregando, erro, aprovar, recusar } = useAprovacoes()

  const [filtro, setFiltro] = useState('pendente') // 'pendente' | 'aprovado' | 'recusado' | 'todos'
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState(null) // solicitação aberta no modal de detalhes
  const [decisao, setDecisao] = useState(null) // { tipo: 'aprovar' | 'recusar', solicitacao }
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })

  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // Contadores dos cartões e das abas (sempre refletem a lista inteira)
  const contagens = useMemo(() => ({
    pendente: solicitacoes.filter((s) => s.status === 'pendente').length,
    aprovado: solicitacoes.filter((s) => s.status === 'aprovado').length,
    recusado: solicitacoes.filter((s) => s.status === 'recusado').length,
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
  function pedirConfirmacao(tipo, solicitacao) {
    setDetalhe(null)
    setDecisao({ tipo, solicitacao })
  }

  async function confirmar() {
    const { tipo, solicitacao } = decisao
    setEnviando(true)
    try {
      await (tipo === 'aprovar' ? aprovar(solicitacao) : recusar(solicitacao))
      setToast({ aberto: true, ...MENSAGENS_TOAST[tipo] })
    } catch (e) {
      setToast({ aberto: true, tipo: 'erro', mensagem: e.message })
    } finally {
      setEnviando(false)
      setDecisao(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[790px] px-5 py-10 md:pt-16">
      <h1 className="text-[22px] font-extrabold text-texto">Aprovação de profissionais</h1>
      <p className="mt-1 text-[12px] text-secundaria">Analise e gerencie as solicitações de acesso à plataforma</p>

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
      {erro && <p role="alert" className="mt-6 text-[12px] text-erro">{erro}</p>}
      {!carregando && !erro && visiveis.length === 0 && (
        <p className="mt-6 text-[12px] text-secundaria">Nenhuma solicitação encontrada.</p>
      )}

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

      <ModalSolicitacao
        solicitacao={detalhe}
        onFechar={() => setDetalhe(null)}
        onAprovar={() => pedirConfirmacao('aprovar', detalhe)}
        onRecusar={() => pedirConfirmacao('recusar', detalhe)}
      />

      <ModalConfirmarDecisao
        decisao={decisao}
        enviando={enviando}
        onCancelar={() => setDecisao(null)}
        onConfirmar={confirmar}
      />

      <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
    </section>
  )
}
