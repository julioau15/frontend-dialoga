// ============================================================
// hooks/useBuscaPaciente.js
// Busca de pacientes por nome ou e-mail, usada no primeiro acesso do
// profissional. Mesmo funcionamento do useBuscaProfissional:
//   - espera o usuário parar de digitar (debounce de 300 ms)
//   - só busca com 2 ou mais caracteres
//   - cancela a busca anterior se o texto mudar (AbortController)
//
// Uso:  const busca = useBuscaPaciente(texto, token)
//   busca.resultados      -> [{ id, nome_completo, email, ... }] (até 8)
//   busca.carregando      -> true enquanto espera a digitação ou a API
//   busca.erro            -> mensagem de erro ('' se deu certo)
//   busca.termoCurto      -> true se tem texto, mas menos de 2 letras
//   busca.tentarNovamente -> repete a última busca (após um erro)
//
// "carregando" não é um estado: é CALCULADO comparando o texto atual com
// o texto do último resultado (evita setState direto dentro do useEffect).
// ============================================================
import { useEffect, useState } from 'react'
import { buscarPacientes } from '../services/profissionalService'

const MIN_CARACTERES = 2
const MAX_CARACTERES = 100
const MAX_RESULTADOS = 8 // o back não limita: mostramos só os 8 primeiros (ordem alfabética)
const ESPERA_DIGITACAO_MS = 300

export function useBuscaPaciente(texto, token) {
  const termo = texto.trim()
  const termoValido = termo.length >= MIN_CARACTERES && termo.length <= MAX_CARACTERES

  // Texto "atrasado": só muda 300 ms depois que o usuário para de digitar
  const [termoAtrasado, setTermoAtrasado] = useState('')

  // +1 = buscar de novo o mesmo texto (botão "Tentar novamente")
  const [tentativa, setTentativa] = useState(0)

  // Último resultado recebido: { termo, tentativa, lista, erro }
  const [resultado, setResultado] = useState(null)

  // 1) Debounce: agenda a troca do termo e desfaz o agendamento se o texto mudar antes
  useEffect(() => {
    const timer = setTimeout(() => setTermoAtrasado(termo), ESPERA_DIGITACAO_MS)
    return () => clearTimeout(timer)
  }, [termo])

  // 2) Busca na API quando o termo "atrasado" muda (ou ao tentar de novo)
  useEffect(() => {
    if (termoAtrasado.length < MIN_CARACTERES || termoAtrasado.length > MAX_CARACTERES) return

    const controller = new AbortController()

    buscarPacientes(token, termoAtrasado, controller.signal)
      .then((lista) => setResultado({ termo: termoAtrasado, tentativa, lista: lista.slice(0, MAX_RESULTADOS), erro: '' }))
      .catch((erro) => {
        // Busca cancelada (o texto mudou ou saiu da tela): não é erro
        if (controller.signal.aborted) return
        setResultado({ termo: termoAtrasado, tentativa, lista: [], erro: erro.message })
      })

    // Ao mudar o termo, cancela a requisição que ainda estava em andamento
    return () => controller.abort()
  }, [termoAtrasado, token, tentativa])

  // O resultado só vale se for do texto que está no campo agora
  const atual = resultado && resultado.termo === termo && resultado.tentativa === tentativa ? resultado : null

  return {
    resultados: termoValido ? atual?.lista ?? [] : [],
    carregando: termoValido && !atual,
    erro: termoValido ? atual?.erro ?? '' : '',
    termoCurto: termo.length > 0 && termo.length < MIN_CARACTERES,
    tentarNovamente: () => setTentativa((n) => n + 1),
  }
}
