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
//   agenda.editarDisponibilidade(item, { dias, inicio, fim, repetir, data })
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
  atualizarDisponibilidade,
  excluirConsulta as excluirConsultaApi,
  excluirDisponibilidade,
} from '../services/agendaProfissionalService'
import { buscarHorariosDoVinculo } from '../services/agendaPacienteService'
import { diaDaSemana, proximaData } from '../utils/disponibilidade'

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

  // "Repetir semanalmente" ligado: cria 1 registro semanal por dia escolhido.
  // Desligado: "Única vez" na data escolhida (sem data, cai na próxima data daquele dia da semana).
  // Se algum falhar, os anteriores já foram salvos: a tela é recarregada e o erro avisa.
  async function adicionarDisponibilidade({ dias, inicio, fim, repetir, data, hoje }) {
    try {
      if (!repetir && data) {
        await criarDisponibilidade(token, { dia: diaDaSemana(data), inicio, fim, tipo: 'unica', data })
        return
      }
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

  // o mesmo registro do back, só com os outros dias (mantém tipo e datas do período)
  const manterIrmaos = (item) =>
    atualizarDisponibilidade(token, item.idApi, {
      dias: item.irmaos,
      inicio: item.inicio,
      fim: item.fim,
      tipo: item.tipo,
      data: item.data,
      dataFinal: item.dataFinal,
    })

  // Edita um item da lista. Se o registro do back tem outros dias (irmaos), eles continuam como
  // estavam e o dia editado vira um registro novo; senão, o próprio registro é atualizado (PUT).
  async function editarDisponibilidade(item, { dias, inicio, fim, repetir, data }) {
    const novo = repetir
      ? { dias, inicio, fim, tipo: item.tipo === 'periodo' ? 'periodo' : 'semanal', data: item.data, dataFinal: item.dataFinal }
      : { dias: [diaDaSemana(data)], inicio, fim, tipo: 'unica', data }
    try {
      if (item.irmaos?.length) {
        await manterIrmaos(item)
        if (novo.tipo === 'unica') await criarDisponibilidade(token, { dia: novo.dias[0], inicio, fim, tipo: 'unica', data })
        else for (const dia of novo.dias) await criarDisponibilidade(token, { dia, inicio, fim, tipo: 'semanal' })
      } else {
        await atualizarDisponibilidade(token, item.idApi, novo)
      }
    } finally {
      await atualizarListas().catch(() => {})
    }
  }

  // Remove só o dia escolhido: se o registro do back tem outros dias, atualiza o registro sem este
  // dia (PUT, mantendo tipo e datas); senão apaga o registro.
  async function removerDisponibilidade(item) {
    try {
      if (item.irmaos?.length) await manterIrmaos(item)
      else await excluirDisponibilidade(token, item.idApi)
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
    editarDisponibilidade,
    removerDisponibilidade,
  }
}
