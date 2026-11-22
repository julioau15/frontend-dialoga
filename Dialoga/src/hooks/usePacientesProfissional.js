// ============================================================
// hooks/usePacientesProfissional.js
// Carrega e altera os dados da tela Pacientes do profissional na API.
//   const lista = usePacientesProfissional(token)
//   lista.pacientes   -> [{ id, nome, email, origem, desde, proximaConsulta, status, ... }]
//   lista.carregando / lista.erro / lista.recarregar()
//   lista.adicionar({ id, origem })           -> envia o pedido de vínculo e recarrega a lista
//   lista.salvarAnotacao(idPaciente, dados)   -> cria a anotação ({ titulo, conteudo })
//   lista.responderPedido(paciente, aceitar)  -> aceita (true) ou recusa (false) o pedido do paciente
// As ações lançam Error com .message pronta para a tela (vinda do back).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { vincularPaciente } from '../services/profissionalService'
import { aceitarVinculo, buscarPacientesDoProfissional, criarAnotacao, recusarVinculo } from '../services/pacientesProfissionalService'

export function usePacientesProfissional(token) {
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0) // +1 = buscar tudo de novo

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    buscarPacientesDoProfissional(token, signal)
      .then((lista) => {
        setPacientes(lista)
        setErro('')
        setCarregando(false)
      })
      .catch((e) => {
        if (signal.aborted) return
        setErro(e.message)
        setCarregando(false)
      })

    return () => controller.abort()
  }, [token, tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setTentativa((n) => n + 1)
  }, [])

  // O back só sabe vincular quem já tem conta no Dialoga; paciente "externo" (só o nome) não existe lá.
  // Depois do POST, busca a lista de novo para a tela mostrar exatamente o que o back guardou.
  async function adicionar({ id, origem }) {
    if (origem === 'externo' || id == null) {
      throw new Error('O cadastro de paciente externo (só pelo nome) ainda não está disponível. Busque um paciente da plataforma.')
    }

    await vincularPaciente(token, id)

    // o pedido já foi enviado; se só a releitura falhar, não acusa erro
    await buscarPacientesDoProfissional(token)
      .then((lista) => {
        setPacientes(lista)
      })
      .catch(() => {})
  }

  // Pedido que o paciente fez: aceitar vira "Ativo"; recusar tira da lista. Depois recarrega.
  async function responderPedido(paciente, aceitar) {
    if (aceitar) await aceitarVinculo(token, paciente.idVinculo)
    else await recusarVinculo(token, paciente.idVinculo)

    await buscarPacientesDoProfissional(token)
      .then((nova) => {
        setPacientes(nova)
      })
      .catch(() => {})
  }

  const salvarAnotacao = (idPaciente, dados) => criarAnotacao(token, idPaciente, dados)

  return { pacientes, carregando, erro, recarregar, adicionar, salvarAnotacao, responderPedido }
}
