// ============================================================
// RespostaPergunta
// Uma pergunta e a resposta do paciente na tela de resposta (RF297), como no Figma:
// pergunta pequena em cinza ("1. Como você avalia...") e a resposta logo abaixo.
// Resposta conforme o tipo:
//   paragrafo/unica -> texto | multipla -> opções separadas por vírgula
//   emocoes         -> emoji + nome (ex.: "😊 Bem") | escala -> número (0 a 10)
// Pergunta sem resposta mostra "Ainda não respondida".
// Props: numero, item ({ pergunta, tipo, resposta })
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'

const EMOCOES = {
  mal: { emoji: '😔', rotulo: 'Mal' },
  neutro: { emoji: '😐', rotulo: 'Neutro' },
  bem: { emoji: '😊', rotulo: 'Bem' },
}

// true quando a pergunta não tem resposta (null, texto vazio ou lista vazia)
const semResposta = (r) => r === null || r === undefined || r === '' || (Array.isArray(r) && r.length === 0)

// texto da resposta de acordo com o tipo da pergunta
function Resposta({ tipo, resposta }) {
  if (semResposta(resposta)) {
    return <p className="text-[13px] italic text-secundaria">Ainda não respondida</p>
  }
  if (tipo === 'emocoes') {
    const emocao = EMOCOES[resposta]
    return (
      <p className="flex items-center gap-1.5 text-[13px] text-texto">
        <span aria-hidden="true">{emocao?.emoji}</span>
        {emocao?.rotulo ?? resposta}
      </p>
    )
  }
  if (tipo === 'multipla') return <p className="text-[13px] text-texto">{resposta.join(', ')}</p>
  if (tipo === 'escala') {
    return (
      <p className="text-[13px] text-texto">
        {resposta}
        <span className="sr-only"> de 10</span>
      </p>
    )
  }
  // parágrafo e escolha única: o texto da resposta
  return <p className="whitespace-pre-line text-[13px] leading-relaxed text-texto">{resposta}</p>
}

export default function RespostaPergunta({ numero, item }) {
  const idTitulo = useId()

  return (
    <Card as="section" aria-labelledby={idTitulo} className="px-5 py-[22px]">
      <h3 id={idTitulo} className="mb-2.5 text-[11.5px] font-semibold leading-snug text-secundaria-escura">
        {numero}. {item.pergunta}
      </h3>
      <Resposta tipo={item.tipo} resposta={item.resposta} />
    </Card>
  )
}
