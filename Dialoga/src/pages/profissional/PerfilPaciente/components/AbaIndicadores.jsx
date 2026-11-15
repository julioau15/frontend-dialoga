// ============================================================
// AbaIndicadores
// Indicadores do paciente (RF228–RF238, RF314, RF316), na ordem do Figma:
//   PERÍODO 7d | 14d | 30d, Indicadores emocionais, Sono, Anotações do paciente,
//   Conclusão de tarefas, Aderência ao tratamento e o aviso de que os dados
//   são informados pelo paciente.
// Sem acesso aprovado (ou paciente externo), mostra o BlocoSemAcesso no lugar.
// Props:
//   paciente          -> perfil (usa acesso e indicadores)
//   onSolicitarAcesso -> clique em "Solicitar acesso" no bloco sem acesso
// ============================================================
import { useState } from 'react'
import BlocoSemAcesso from './BlocoSemAcesso'
import CartaoAnotacoesPaciente from './CartaoAnotacoesPaciente'
import CartaoEmocionais from './CartaoEmocionais'
import CartaoSono from './CartaoSono'
import { CartaoAderencia, CartaoConclusao } from './CartoesProgresso'
import SeletorPeriodo from './SeletorPeriodo'
import { PERIODOS } from './textosPerfil'

export default function AbaIndicadores({ paciente, onSolicitarAcesso }) {
  const [periodo, setPeriodo] = useState('7d')

  if (paciente.acesso !== 'aprovado' || !paciente.indicadores) {
    return <BlocoSemAcesso acesso={paciente.acesso} onSolicitarAcesso={onSolicitarAcesso} />
  }

  const dados = paciente.indicadores[periodo]
  const dias = PERIODOS.find((p) => p.id === periodo).dias

  return (
    <div className="flex flex-col gap-[15px]">
      <SeletorPeriodo opcoes={PERIODOS} valor={periodo} onMudar={setPeriodo} />
      <CartaoEmocionais emocionais={dados.emocionais} dias={dias} />
      <CartaoSono sono={dados.sono} />
      <CartaoAnotacoesPaciente anotacoes={dados.anotacoesPaciente} />
      <CartaoConclusao conclusao={dados.conclusao} />
      <CartaoAderencia aderencia={dados.aderencia} />

      {/* RF238: aviso sobre a origem dos dados */}
      <p
        role="note"
        className="flex items-start gap-2 rounded-xl border border-erro-borda-2 bg-erro-fundo-2 px-[17px] py-[17px] text-[12px] leading-4 text-secundaria-escura"
      >
        <span aria-hidden="true">ℹ️</span>
        Dados fornecidos pelo próprio paciente. Não substituem avaliação clínica.
      </p>
    </div>
  )
}
