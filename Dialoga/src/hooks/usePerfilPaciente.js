// ============================================================
// hooks/usePerfilPaciente.js
// Estado do Perfil do paciente na visão do profissional (a página só desenha).
//   const p = usePerfilPaciente(idPaciente)
//   p.perfil      -> perfil no formato dos componentes (null enquanto carrega ou se não existe)
//   p.naoEncontrado / p.carregando / p.erro / p.recarregar()
//   p.anotacoes   -> anotações privadas do profissional
//   p.salvarNota(dados) / p.excluirNota(nota) / p.solicitarAcesso() / p.remover()
//     -> gravam na API (lançam Error com .message pronta para a tela)
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

export function usePerfilPaciente(idPaciente) {
  const { auth } = useAuth()
  const token = auth?.token

  const [dados, setDados] = useState({ perfil: null, anotacoes: [] })
  const [carga, setCarga] = useState(null) // { tentativa, erro }
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const minhaTentativa = tentativa

    Promise.all([buscarPerfilPaciente(token, idPaciente, signal), listarAnotacoes(token, idPaciente, signal).catch(() => [])])
      .then(([perfil, anotacoes]) => {
        setDados({ perfil, anotacoes })
        setCarga({ tentativa: minhaTentativa, erro: '' })
      })
      .catch((e) => {
        if (signal.aborted) return
        setCarga({ tentativa: minhaTentativa, erro: e.message })
      })

    return () => controller.abort()
  }, [token, idPaciente, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  async function atualizarAnotacoes() {
    const anotacoes = await listarAnotacoes(token, idPaciente)
    setDados((atual) => ({ ...atual, anotacoes }))
  }

  async function salvarNota(nota) {
    await salvarAnotacao(token, idPaciente, nota)
    await atualizarAnotacoes()
  }

  async function excluirNota(nota) {
    await excluirAnotacao(token, nota.id)
    await atualizarAnotacoes()
  }

  // o pedido fica "Solicitação enviada" na tela (o paciente responde em Relatórios)
  async function solicitarAcesso() {
    await pedirAcesso(token, idPaciente)
    setDados((atual) => ({ ...atual, perfil: atual.perfil && { ...atual.perfil, acesso: 'pendente' } }))
  }

  async function remover() {
    await removerPaciente(token, idPaciente)
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
