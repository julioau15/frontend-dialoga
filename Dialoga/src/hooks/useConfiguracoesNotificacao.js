// ============================================================
// hooks/useConfiguracoesNotificacao.js
// Lógica das configurações de notificação do paciente e do profissional
// (as telas só desenham), integrada à API de preferências:
//   - carrega as preferências salvas do usuário logado (GET)
//   - liga e desliga cada tipo de notificação (RF366, RF371)
//   - "Desligar todas" suspende os alertas e bloqueia os interruptores,
//     sem perder as escolhas de cada tipo (RF364, RF369)
//   - abre e fecha as categorias
//   - conta as notificações ativas de cada categoria (valor calculado)
//   - salva as preferências na API (PUT) (RF127, RF134); o aviso
//     "Preferências salvas!" é exibido pela página de Notificações
//   - descarta o que não foi salvo (botão Fechar do modal)
// Uso: const config = useConfiguracoesNotificacao(CATEGORIAS_PACIENTE, ['tarefas'])
//      const config = useConfiguracoesNotificacao(CATEGORIAS_PACIENTE, ['tarefas'], { ativo: aberto })
//   ativo -> false adia a busca (ex.: modal fechado)
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { carregarPreferenciasRequest, salvarPreferenciasRequest } from '../services/preferenciasNotificacaoService'
import { aplicarPreferenciasSalvas, criarEstadoPadrao, montarPreferencias } from '../utils/preferenciasNotificacao'

const REMOTO_INICIAL = { carregado: false, erro: '' }

export function useConfiguracoesNotificacao(categorias, abertasIniciais = [], { ativo = true } = {}) {
  const { auth } = useAuth()
  const token = auth?.token

  // Preferências da última vez que foram carregadas ou salvas na API
  const [salvo, setSalvo] = useState(() => criarEstadoPadrao(categorias))
  // Preferências que estão sendo editadas na tela
  const [atual, setAtual] = useState(() => criarEstadoPadrao(categorias))
  // Ids das categorias abertas
  const [abertas, setAbertas] = useState(() => abertasIniciais)
  // Situação da busca na API (carregado / mensagem de erro)
  const [remoto, setRemoto] = useState(REMOTO_INICIAL)
  // Muda para buscar de novo ("Tentar novamente")
  const [tentativa, setTentativa] = useState(0)
  // Envio das preferências em andamento e erro ao salvar
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')

  // Busca as preferências salvas do usuário logado
  useEffect(() => {
    if (!ativo) return
    const controle = new AbortController()

    carregarPreferenciasRequest(token, controle.signal)
      .then((linhas) => {
        const estado = aplicarPreferenciasSalvas(categorias, linhas)
        setSalvo(estado)
        setAtual(estado)
        setRemoto({ carregado: true, erro: '' })
      })
      .catch((erro) => {
        if (controle.signal.aborted) return // saiu da tela antes da resposta
        setRemoto({ carregado: false, erro: erro.message })
      })

    // cancela se a pessoa sair da tela (ou fechar o modal) antes da resposta chegar
    return () => controle.abort()
  }, [token, categorias, ativo, tentativa])

  // Tenta buscar as preferências de novo depois de uma falha
  const recarregar = useCallback(() => {
    setRemoto(REMOTO_INICIAL)
    setTentativa((valor) => valor + 1)
  }, [])

  // Conta as notificações ativas de cada categoria; com "Desligar todas" ativo, nenhuma conta como ativa
  const resumo = useMemo(
    () =>
      categorias.map((categoria) => ({
        ...categoria,
        total: categoria.tipos.length,
        ativas: atual.desligarTodas ? 0 : categoria.tipos.filter((tipo) => atual.ativos[tipo.id]).length,
      })),
    [categorias, atual],
  )

  // Liga ou desliga um tipo de notificação (bloqueado enquanto "Desligar todas" estiver ativo)
  function alternarTipo(idTipo) {
    setAtual((estado) => {
      if (estado.desligarTodas) return estado
      return { ...estado, ativos: { ...estado.ativos, [idTipo]: !estado.ativos[idTipo] } }
    })
  }

  // Liga ou desliga todas as notificações, mantendo as escolhas de cada tipo
  function alternarDesligarTodas() {
    setAtual((estado) => ({ ...estado, desligarTodas: !estado.desligarTodas }))
  }

  // Alterna a abertura da categoria
  function alternarCategoria(idCategoria) {
    setAbertas((lista) =>
      lista.includes(idCategoria) ? lista.filter((id) => id !== idCategoria) : [...lista, idCategoria],
    )
  }

  // Indica se a categoria está aberta
  function estaAberta(idCategoria) {
    return abertas.includes(idCategoria)
  }

  // Envia as preferências atuais para a API.
  // Devolve true quando salvou e false quando deu erro (a mensagem fica em erroSalvar).
  async function salvar() {
    if (salvando) return false
    setSalvando(true)
    setErroSalvar('')

    try {
      await salvarPreferenciasRequest(token, montarPreferencias(categorias, atual))
      setSalvo(atual)
      return true
    } catch (erro) {
      setErroSalvar(erro.message)
      return false
    } finally {
      setSalvando(false)
    }
  }

  // Volta para as preferências salvas, descartando o que não foi salvo
  function descartar() {
    setAtual(salvo)
    setErroSalvar('')
  }

  return {
    categorias: resumo,
    ativos: atual.ativos,
    desligarTodas: atual.desligarTodas,
    carregando: ativo && !remoto.carregado && !remoto.erro,
    erroCarregar: remoto.erro,
    recarregar,
    salvando,
    erroSalvar,
    alternarTipo,
    alternarDesligarTodas,
    alternarCategoria,
    estaAberta,
    salvar,
    descartar,
  }
}
