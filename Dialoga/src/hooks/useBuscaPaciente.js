// ============================================================
// hooks/useBuscaPaciente.js
// Busca de pacientes por nome ou e-mail, usada na tela de boas-vindas do
// profissional (primeiro acesso). Mesmo padrão do useBuscaProfissional:
//   - espera o usuário parar de digitar (debounce de 300 ms)
//   - só busca com 2 ou mais caracteres
//   - cancela a busca anterior se o texto mudar (AbortController)
// Além da busca (GET /pacientes/busca), carrega UMA vez os vínculos do profissional
// para marcar quem já tem solicitação pendente ou acompanhamento ativo
// (a rota de busca não informa isso).
//
// Uso:  const busca = useBuscaPaciente(texto, token, ativo)
//   ativo                 -> só busca e carrega os vínculos quando for true (ex.: escolheu "Sim, quero vincular")
//   busca.resultados      -> [{ id, nome_completo, email, situacao_vinculo, ... }]
//   busca.carregando      -> true enquanto espera a digitação ou a API
//   busca.erro            -> mensagem de erro ('' se deu certo)
//   busca.termoCurto      -> true se tem texto, mas menos de 2 letras
//   busca.tentarNovamente -> repete a busca e recarrega os vínculos (após um erro ou para atualizar a lista)
//
// Para não chamar setState direto dentro do useEffect (o eslint do projeto,
// react-hooks v7, reclama disso), o "carregando" não é um estado: ele é
// CALCULADO comparando o texto atual com o texto do último resultado.
// ============================================================
import { useEffect, useState } from 'react'
import { buscarPacientes, carregarSituacoesVinculo } from '../services/profissionalService'

const MIN_CARACTERES = 2
const MAX_CARACTERES = 100
const ESPERA_DIGITACAO_MS = 300

export function useBuscaPaciente(texto, token, ativo) {
  const termo = texto.trim()
  const termoValido = ativo && termo.length >= MIN_CARACTERES && termo.length <= MAX_CARACTERES

  // Texto "atrasado": só muda 300 ms depois que o usuário para de digitar
  const [termoAtrasado, setTermoAtrasado] = useState('')

  // +1 = repetir a busca e recarregar os vínculos (botão "Tentar novamente")
  const [tentativa, setTentativa] = useState(0)

  // Último resultado da busca: { termo, tentativa, lista, erro }
  const [resultado, setResultado] = useState(null)

  // Últimos vínculos carregados: { tentativa, situacoes, erro }
  const [vinculos, setVinculos] = useState(null)

  // 1) Debounce: agenda a troca do termo e desfaz o agendamento se o texto mudar antes
  useEffect(() => {
    const timer = setTimeout(() => setTermoAtrasado(termo), ESPERA_DIGITACAO_MS)
    return () => clearTimeout(timer)
  }, [termo])

  // 2) Vínculos do profissional: carrega quando a busca fica ativa (ou ao tentar de novo)
  useEffect(() => {
    if (!ativo) return

    const controller = new AbortController()

    carregarSituacoesVinculo(token, controller.signal)
      .then((situacoes) => setVinculos({ tentativa, situacoes, erro: '' }))
      .catch((erro) => {
        // Cancelado (saiu da tela ou trocou a escolha): não é erro
        if (controller.signal.aborted) return
        setVinculos({ tentativa, situacoes: {}, erro: erro.message })
      })

    return () => controller.abort()
  }, [ativo, token, tentativa])

  // 3) Busca na API quando o termo "atrasado" muda (ou ao tentar de novo)
  useEffect(() => {
    if (!ativo || termoAtrasado.length < MIN_CARACTERES || termoAtrasado.length > MAX_CARACTERES) return

    const controller = new AbortController()

    buscarPacientes(token, termoAtrasado, controller.signal)
      .then((lista) => setResultado({ termo: termoAtrasado, tentativa, lista, erro: '' }))
      .catch((erro) => {
        // Busca cancelada (o texto mudou ou saiu da tela): não é erro
        if (controller.signal.aborted) return
        setResultado({ termo: termoAtrasado, tentativa, lista: [], erro: erro.message })
      })

    // Ao mudar o termo, cancela a requisição que ainda estava em andamento
    return () => controller.abort()
  }, [ativo, termoAtrasado, token, tentativa])

  // O resultado só vale se for do texto que está no campo agora
  const atual = resultado && resultado.termo === termo && resultado.tentativa === tentativa ? resultado : null
  const doProfissional = vinculos && vinculos.tentativa === tentativa ? vinculos : null

  const erro = termoValido ? atual?.erro || doProfissional?.erro || '' : ''
  const pronto = Boolean(atual && doProfissional)

  return {
    resultados:
      termoValido && pronto && !erro
        ? atual.lista.map((paciente) => ({ ...paciente, situacao_vinculo: doProfissional.situacoes[paciente.id] ?? null }))
        : [],
    carregando: termoValido && !erro && !pronto,
    erro,
    termoCurto: ativo && termo.length > 0 && termo.length < MIN_CARACTERES,
    tentarNovamente: () => setTentativa((n) => n + 1),
  }
}
