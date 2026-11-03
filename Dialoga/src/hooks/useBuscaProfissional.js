// ============================================================
// hooks/useBuscaProfissional.js
// Busca de profissionais por nome ou e-mail, usada na etapa 2 do
// "Personalizar experiência".
//   - espera o usuário parar de digitar (debounce de 300 ms)
//   - só busca com 2 ou mais caracteres (mesma regra do back)
//   - cancela a busca anterior se o texto mudar (AbortController)
//
// Uso:  const busca = useBuscaProfissional(texto, token)
//   busca.resultados      -> [{ id, nome_completo, especialidades, ... }]
//   busca.carregando      -> true enquanto espera a digitação ou a API
//   busca.erro            -> mensagem de erro ('' se deu certo)
//   busca.termoCurto      -> true se tem texto, mas menos de 2 letras
//   busca.tentarNovamente -> repete a última busca (após um erro)
//
// Para não chamar setState direto dentro do useEffect (o eslint do projeto,
// react-hooks v7, reclama disso), o "carregando" não é um estado: ele é
// CALCULADO comparando o texto atual com o texto do último resultado.
// É o mesmo padrão usado nas especialidades do useCadastroForm.
// ============================================================
import { useEffect, useState } from 'react'
import { buscarProfissionais } from '../services/pacienteService'

const MIN_CARACTERES = 2
const MAX_CARACTERES = 100
const ESPERA_DIGITACAO_MS = 300

export function useBuscaProfissional(texto, token) {
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

    buscarProfissionais(token, termoAtrasado, controller.signal)
      .then((lista) => setResultado({ termo: termoAtrasado, tentativa, lista, erro: '' }))
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
