// ============================================================
// hooks/useAgendaPaciente.js
// Estado da Agenda do paciente, ligado à API (rota /paciente/agenda).
//   const agenda = useAgendaPaciente()
//   agenda.consultas      -> [{ id, titulo, profissional, idVinculo, especialidade, data, hora }]
//   agenda.profissionais  -> profissionais que podem receber consulta (vínculo ativo): [{ idVinculo, nome, especialidade }]
//   agenda.carregando / agenda.erro / agenda.recarregar()
//   agenda.horarios(idVinculo, signal) -> dias e horários livres do profissional
//   agenda.agendar(dados)   -> { titulo, idVinculo, especialidade, data, hora }; recarrega as consultas
//   agenda.excluir(consulta)-> exclui e tira da lista
// As ações lançam Error com .message pronta para a tela (vinda do back).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listarMeusProfissionais } from '../services/profissionaisPacienteService'
import {
  buscarConsultas,
  buscarHorariosDoVinculo,
  criarConsulta,
  excluirConsulta,
} from '../services/agendaPacienteService'

export function useAgendaPaciente() {
  const { auth } = useAuth()
  const token = auth?.token
  const [consultas, setConsultas] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0) // +1 = buscar tudo de novo

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    Promise.all([buscarConsultas(token, signal), listarMeusProfissionais(token, signal)])
      .then(([listaConsultas, listaProfissionais]) => {
        setConsultas(listaConsultas)
        // só quem tem vínculo ativo na plataforma pode receber consulta (regra do back)
        setProfissionais(
          listaProfissionais
            .filter((p) => p.status === 'ativo' && p.idVinculo != null)
            .map((p) => ({ idVinculo: p.idVinculo, nome: p.nome, especialidade: p.especialidade })),
        )
        setErro('')
      })
      .catch((e) => {
        if (signal.aborted) return
        setErro(e.message)
      })
      .finally(() => {
        if (!signal.aborted) setCarregando(false)
      })

    return () => controller.abort()
  }, [token, tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setTentativa((n) => n + 1)
  }, [])

  const horarios = useCallback((idVinculo, signal) => buscarHorariosDoVinculo(token, idVinculo, signal), [token])

  async function agendar(dados) {
    await criarConsulta(token, dados)
    // o back devolve só o id: busca a lista de novo para mostrar exatamente o que foi gravado
    setConsultas(await buscarConsultas(token))
  }

  async function excluir(consulta) {
    await excluirConsulta(token, consulta.id)
    setConsultas((lista) => lista.filter((c) => c.id !== consulta.id))
  }

  return { consultas, profissionais, carregando, erro, recarregar, horarios, agendar, excluir }
}
