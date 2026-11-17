// ============================================================
// hooks/useProfissionaisPaciente.js
// Estado da tela Profissionais do paciente (RF317–RF331, RN99–RN104).
// A tela só chama este hook; quem fala com a API é services/profissionaisPacienteService.js.
//
// Profissionais da plataforma (com cadastro no Dialoga) vêm da API.
// Profissionais fora da plataforma (sem cadastro) não têm onde ser gravados no back
// (tbl_vinculo exige id_profissional): ficam guardados no navegador do paciente (localStorage).
//
// Devolve:
//   profissionais     -> lista no formato do CartaoProfissional
//   carregando        -> true enquanto busca a lista
//   erro              -> mensagem de erro ao carregar (ou null)
//   recarregar()      -> busca a lista de novo (botão "Tentar novamente")
//   buscarPorCpf(cpf) -> profissional da plataforma com esse CPF, ou null
//   adicionarExterno(dados) -> guarda um profissional fora da plataforma
//   vincular(prof)    -> pede o vínculo a um profissional da plataforma (fica "Pendente")
//   remover(prof)     -> RN101: muda o status para Inativo (não apaga)
//   aceitar(prof)     -> aceita a solicitação recebida do profissional (fica "Ativo")
//   recusar(prof)     -> recusa a solicitação recebida (vai para o Histórico)
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { vincularProfissional } from '../services/pacienteService'
import {
  aceitarVinculo,
  buscarProfissionalPorCpf,
  encerrarVinculo,
  inativarVinculo,
  listarMeusProfissionais,
} from '../services/profissionaisPacienteService'
import { lerExternos, salvarExternos } from '../pages/paciente/Profissionais/components/profissionaisMemoria'
import { mesAtual } from '../pages/paciente/Profissionais/components/profissionaisMock'

// ordem da tela: os da API (por nome, como o back devolve) e depois os fora da plataforma
const juntar = (daApi, externos) => [...daApi, ...externos]

export default function useProfissionaisPaciente() {
  const { auth } = useAuth()
  const token = auth?.token
  const idUsuario = auth?.id

  const operacao = useRef(false)
  const [ocupado, setOcupado] = useState(false)
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0) // muda para buscar a lista de novo

  // carrega a lista da API e junta com os fora da plataforma
  useEffect(() => {
    const controle = new AbortController()

    async function carregar() {
      try {
        const daApi = await listarMeusProfissionais(token, controle.signal)
        const lista = juntar(daApi, lerExternos(idUsuario))
        if (controle.signal.aborted) return
        setProfissionais(lista)
        setErro(null)
      } catch (e) {
        if (controle.signal.aborted) return // saiu da tela: ignora
        setErro(e.message)
      } finally {
        if (!controle.signal.aborted) setCarregando(false)
      }
    }

    carregar()
    return () => controle.abort()
  }, [token, idUsuario, versao])

  // busca de novo (depois de vincular ou remover, e no "Tentar novamente")
  const recarregar = useCallback(() => {
    setCarregando(true)
    setVersao((v) => v + 1)
  }, [])

  // atualiza os profissionais externos na tela
  function atualizarLista(nova) {
    setProfissionais(nova)
  }

  async function executar(acao) {
    if (operacao.current) throw new Error('Aguarde a operação em andamento.')
    operacao.current = true
    setOcupado(true)
    try {
      return await acao()
    } finally {
      operacao.current = false
      setOcupado(false)
    }
  }

  // RF320: procura o CPF entre os profissionais da plataforma
  const buscarPorCpf = useCallback((cpf, signal) => buscarProfissionalPorCpf(token, cpf, signal), [token])

  // RF320/RF321: profissional fora da plataforma entra direto no acompanhamento atual
  async function adicionarExterno(dados) {
    return executar(async () => {
      const novo = {
        id: `externo-${Date.now()}`, // id só do navegador (não colide com os ids da API)
        nome: dados.nome,
        especialidade: dados.especialidade,
        especialidades: [dados.especialidade],
        email: dados.email || null,
        status: 'ativo',
        naPlataforma: false,
        desde: mesAtual(),
        proximaConsulta: null,
      }
      const externos = [...lerExternos(idUsuario), novo]
      salvarExternos(idUsuario, externos)
      atualizarLista([...profissionais, novo])
    })
  }

  // RN100: o vínculo com um profissional da plataforma só vale depois da confirmação dele
  async function vincular(profissional) {
    return executar(async () => {
      const jaVinculado = (lista) => lista.some((p) => p.naPlataforma &&
        String(p.id) === String(profissional.id) && ['ativo', 'pendente'].includes(p.status))
      if (jaVinculado(profissionais) || jaVinculado(await listarMeusProfissionais(token))) {
        throw new Error('Este profissional já está no seu acompanhamento.')
      }
      await vincularProfissional(token, profissional.id)
      recarregar()
    })
  }

  // RN101: remover muda o status para Inativo; o registro continua (vai para o Histórico)
  async function remover(profissional) {
    return executar(async () => {
      if (profissional.naPlataforma) {
        if (profissional.status === 'ativo') {
          await encerrarVinculo(token, profissional.idVinculo)
        } else if (profissional.status === 'pendente') {
          await inativarVinculo(token, profissional.idVinculo)
        }
        recarregar()
        return
      }
      const externos = lerExternos(idUsuario).map((p) =>
        String(p.id) === String(profissional.id) ? { ...p, status: 'inativo', proximaConsulta: null } : p,
      )
      salvarExternos(idUsuario, externos)
      atualizarLista(profissionais.map((p) => (!p.naPlataforma && String(p.id) === String(profissional.id) ? { ...p, status: 'inativo', proximaConsulta: null } : p)))
    })
  }

  // solicitação recebida: o profissional convidou o paciente; aceitar deixa o vínculo ativo
  async function aceitar(profissional) {
    return executar(async () => {
      await aceitarVinculo(token, profissional.idVinculo)
      recarregar()
    })
  }

  // solicitação recebida recusada: o vínculo não é apagado (RN101) e vai para o Histórico
  async function recusar(profissional) {
    return executar(async () => {
      await inativarVinculo(token, profissional.idVinculo)
      recarregar()
    })
  }

  return { profissionais, ocupado, carregando, erro, recarregar, buscarPorCpf, adicionarExterno, vincular, remover, aceitar, recusar }
}
