// ============================================================
// hooks/usePerfilPaciente.js
// Estado do Perfil do paciente na visão do profissional (a página só desenha).
//   const p = usePerfilPaciente(idPaciente)
//   p.perfil      -> perfil no formato dos componentes (null enquanto carrega ou se não existe)
//   p.naoEncontrado / p.carregando / p.erro / p.recarregar()
//   p.anotacoes   -> anotações privadas do profissional
//   p.salvarNota(dados) / p.excluirNota(nota) / p.solicitarAcesso() / p.remover()
//     -> gravam na API (lançam Error com .message pronta para a tela)
// Paciente externo (id "ext-..."): vem deste navegador (utils/pacientesExternos),
// sem indicadores nem histórico; anotações e remoção também ficam no navegador.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  buscarPerfilPaciente,
  excluirAnotacao,
  listarAnotacoes,
  pedirAcesso,
  removerPaciente,
  salvarAnotacao,
} from '../services/perfilPacienteService'
import {
  buscarPacienteExterno,
  ehPacienteExterno,
  excluirAnotacaoExterno,
  listarAnotacoesExterno,
  removerPacienteExterno,
  salvarAnotacaoExterno,
} from '../utils/pacientesExternos'

const RESUMO_VAZIO = { sessoes: 0, tarefasEnviadas: 0, taxaResposta: 0 }

// paciente externo: só o que está guardado neste navegador (null se não existe)
function carregarExterno(idUsuario, idPaciente) {
  const basico = buscarPacienteExterno(idUsuario, idPaciente)
  const perfil = basico ? { ...basico, acesso: 'externo', resumo: RESUMO_VAZIO, indicadores: null, historico: [] } : null
  return Promise.resolve([perfil, basico ? listarAnotacoesExterno(idUsuario, idPaciente) : []])
}

export function usePerfilPaciente(idPaciente) {
  const { auth } = useAuth()
  const token = auth?.token
  const idUsuario = auth?.id
  const externo = ehPacienteExterno(idPaciente)

  const [dados, setDados] = useState({ perfil: null, anotacoes: [] })
  const [carga, setCarga] = useState(null) // { tentativa, erro }
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const minhaTentativa = tentativa

    const carregar = externo
      ? carregarExterno(idUsuario, idPaciente)
      : Promise.all([buscarPerfilPaciente(token, idPaciente, signal), listarAnotacoes(token, idPaciente, signal).catch(() => [])])

    carregar
      .then(([perfil, anotacoes]) => {
        setDados({ perfil, anotacoes })
        setCarga({ tentativa: minhaTentativa, erro: '' })
      })
      .catch((e) => {
        if (signal.aborted) return
        setCarga({ tentativa: minhaTentativa, erro: e.message })
      })

    return () => controller.abort()
  }, [token, idUsuario, externo, idPaciente, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  async function atualizarAnotacoes() {
    const anotacoes = externo ? listarAnotacoesExterno(idUsuario, idPaciente) : await listarAnotacoes(token, idPaciente)
    setDados((atual) => ({ ...atual, anotacoes }))
  }

  async function salvarNota(nota) {
    if (externo) salvarAnotacaoExterno(idUsuario, idPaciente, nota)
    else await salvarAnotacao(token, idPaciente, nota)
    await atualizarAnotacoes()
  }

  async function excluirNota(nota) {
    if (externo) excluirAnotacaoExterno(idUsuario, idPaciente, nota.id)
    else await excluirAnotacao(token, nota.id)
    await atualizarAnotacoes()
  }

  // o pedido fica "Solicitação enviada" na tela (o paciente responde em Relatórios)
  async function solicitarAcesso() {
    await pedirAcesso(token, idPaciente)
    setDados((atual) => ({ ...atual, perfil: atual.perfil && { ...atual.perfil, acesso: 'pendente' } }))
  }

  // externo sai do navegador (com as anotações); plataforma desfaz o vínculo no back
  async function remover() {
    if (externo) removerPacienteExterno(idUsuario, idPaciente)
    else await removerPaciente(token, idPaciente)
  }

  const cargaAtual = carga?.tentativa === tentativa ? carga : null
  const carregando = !cargaAtual

  return {
    perfil: carregando ? null : dados.perfil,
    anotacoes: dados.anotacoes,
    naoEncontrado: !carregando && !cargaAtual.erro && !dados.perfil,
    carregando,
    erro: cargaAtual?.erro ?? '',
    recarregar,
    salvarNota,
    excluirNota,
    solicitarAcesso,
    remover,
  }
}
