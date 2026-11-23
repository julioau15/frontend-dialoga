// ============================================================
// hooks/useAgendaProfissional.js
// Carrega e altera os dados da Agenda do profissional na API.
//   const agenda = useAgendaProfissional(token)
//   agenda.consultas / .pacientes / .disponibilidades -> listas já no formato da tela
//   agenda.carregando / agenda.erro / agenda.recarregar()
//   agenda.horarios(idVinculo, signal)         -> dias e horários livres da disponibilidade (igual ao paciente)
//   agenda.salvarConsulta(dados, idConsulta?)  -> cria (ou edita, se vier o id) e recarrega
//   agenda.excluirConsulta(id)
//   agenda.adicionarDisponibilidade({ dias, inicio, fim, repetir, hoje })
//   agenda.removerDisponibilidade(item)
// As ações lançam Error com .message pronta para a tela (vinda do back).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import {
  atualizarConsulta,
  buscarConsultas,
  buscarDisponibilidades,
  buscarPacientesDaAgenda,
  criarConsulta,
  criarDisponibilidade,
  excluirConsulta as excluirConsultaApi,
  excluirDisponibilidade,
} from '../services/agendaProfissionalService'
import { buscarHorariosDoVinculo } from '../services/agendaPacienteService'
import { proximaData } from '../utils/disponibilidade'

const VAZIO = { consultas: [], pacientes: [], disponibilidades: [] }

export function useAgendaProfissional(token) {
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0) // +1 = buscar tudo de novo

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    Promise.all([
      buscarConsultas(token, signal),
      buscarPacientesDaAgenda(token, signal),
      buscarDisponibilidades(token, signal),
    ])
      .then(([consultas, pacientes, disponibilidades]) => {
        setDados({ consultas, pacientes, disponibilidades })
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

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  // mesma rota usada pelo paciente: GET /consultas/vinculos/:id/horarios
  const horarios = useCallback((idVinculo, signal) => buscarHorariosDoVinculo(token, idVinculo, signal), [token])

  // Depois de cada alteração, busca de novo para a tela refletir exatamente o que o back guardou
  async function atualizarListas() {
    const [consultas, disponibilidades] = await Promise.all([buscarConsultas(token), buscarDisponibilidades(token)])
    setDados((atual) => ({ ...atual, consultas, disponibilidades }))
  }

  async function salvarConsulta(consulta, idConsulta) {
    if (idConsulta) await atualizarConsulta(token, idConsulta, consulta)
    else await criarConsulta(token, consulta)
    await atualizarListas().catch(() => {}) // a consulta já foi salva; se só a releitura falhar, não acusa erro
  }

  async function excluirConsulta(id) {
    await excluirConsultaApi(token, id)
    await atualizarListas().catch(() => {})
  }

  // "Repetir semanalmente" desligado vira "Única vez" na próxima data (hoje inclusive) daquele dia da semana.
  // Cria 1 registro por dia escolhido. Se algum falhar, os anteriores já foram salvos: a tela é recarregada e o erro avisa.
  async function adicionarDisponibilidade({ dias, inicio, fim, repetir, hoje }) {
    try {
      for (const dia of dias) {
        await criarDisponibilidade(token, {
          dia,
          inicio,
          fim,
          tipo: repetir ? 'semanal' : 'unica',
          data: repetir ? undefined : proximaData(dia, hoje),
        })
      }
    } finally {
      await atualizarListas().catch(() => {})
    }
  }

  // O back apaga o registro inteiro. Se ele tinha outros dias (cadastro antigo), recria esses dias.
  async function removerDisponibilidade(item) {
    await excluirDisponibilidade(token, item.idApi)
    try {
      for (const dia of item.irmaos ?? []) {
        await criarDisponibilidade(token, { dia, inicio: item.inicio, fim: item.fim, tipo: 'semanal' })
      }
    } finally {
      await atualizarListas().catch(() => {})
    }
  }

  return {
    ...dados,
    carregando,
    erro,
    recarregar,
    horarios,
    salvarConsulta,
    excluirConsulta,
    adicionarDisponibilidade,
    removerDisponibilidade,
  }
}
