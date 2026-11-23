// ============================================================
// hooks/usePacientesProfissional.js
// Carrega e altera os dados da tela Pacientes do profissional.
//   const lista = usePacientesProfissional(token, idUsuario)
//   lista.pacientes   -> [{ id, nome, email, origem, desde, proximaConsulta, status, ... }]
//                        (pacientes da API + pacientes externos guardados neste navegador)
//   lista.carregando / lista.erro / lista.recarregar()
//   lista.adicionar({ id?, nome, origem })    -> plataforma: envia o pedido de vínculo e recarrega (devolve null);
//                                                externo: grava só o nome e devolve o paciente novo
//   lista.salvarAnotacao(idPaciente, dados)   -> cria a anotação ({ titulo, conteudo }) na API ou, se externo, no navegador
//   lista.responderPedido(paciente, aceitar)  -> aceita (true) ou recusa (false) o pedido do paciente
// As ações lançam Error com .message pronta para a tela (vinda do back).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { vincularPaciente } from '../services/profissionalService'
import { aceitarVinculo, buscarPacientesDoProfissional, criarAnotacao, recusarVinculo } from '../services/pacientesProfissionalService'
import { adicionarPacienteExterno, ehPacienteExterno, lerPacientesExternos, salvarAnotacaoExterno } from '../utils/pacientesExternos'

// lista da tela: primeiro os pacientes da API, depois os externos (na ordem do cadastro)
const comExternos = (lista, idUsuario) => [...lista, ...lerPacientesExternos(idUsuario)]

export function usePacientesProfissional(token, idUsuario) {
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0) // +1 = buscar tudo de novo

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    buscarPacientesDoProfissional(token, signal)
      .then((lista) => {
        setPacientes(comExternos(lista, idUsuario))
        setErro('')
        setCarregando(false)
      })
      .catch((e) => {
        if (signal.aborted) return
        setErro(e.message)
        setCarregando(false)
      })

    return () => controller.abort()
  }, [token, idUsuario, tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setTentativa((n) => n + 1)
  }, [])

  // busca a lista de novo depois de uma ação; se só a releitura falhar, não acusa erro
  // (a ação já foi feita no back)
  async function atualizarLista() {
    await buscarPacientesDoProfissional(token)
      .then((lista) => setPacientes(comExternos(lista, idUsuario)))
      .catch(() => {})
  }

  // Externo (RF304): só o nome, guardado neste navegador (o back não tem tabela para ele).
  // Plataforma (RF303): envia o pedido de vínculo; o paciente aparece como "Pendente" até aceitar.
  async function adicionar({ id, nome, origem }) {
    if (origem === 'externo') {
      const novo = adicionarPacienteExterno(idUsuario, nome)
      setPacientes((atual) => [...atual, novo])
      return novo
    }

    if (id == null) throw new Error('Escolha um paciente da lista de resultados.')
    await vincularPaciente(token, id)
    await atualizarLista()
    return null
  }

  // Pedido que o paciente fez: aceitar vira "Ativo"; recusar tira da lista. Depois recarrega.
  async function responderPedido(paciente, aceitar) {
    if (aceitar) await aceitarVinculo(token, paciente.idVinculo)
    else await recusarVinculo(token, paciente.idVinculo)
    await atualizarLista()
  }

  // ícone de anotação da lista: externo grava neste navegador; plataforma grava na API
  async function salvarAnotacao(idPaciente, dados) {
    if (ehPacienteExterno(idPaciente)) return salvarAnotacaoExterno(idUsuario, idPaciente, dados)
    return criarAnotacao(token, idPaciente, dados)
  }

  return { pacientes, carregando, erro, recarregar, adicionar, salvarAnotacao, responderPedido }
}
