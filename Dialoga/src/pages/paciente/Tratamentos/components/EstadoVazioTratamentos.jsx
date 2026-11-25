// ============================================================
// EstadoVazioTratamentos
// Aviso exibido quando o paciente ainda não tem tratamentos cadastrados:
// explica para que serve a tela e oferece o atalho para cadastrar o primeiro.
// Props:
//   onAdicionar() -> abre o pop-up "Novo tratamento"
//   desabilitado  -> bloqueia o botão durante carga ou envio
// ============================================================
import { useId } from 'react'
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import Icone from '../../../../components/Icone'
import { IconeCheck, IconeMais } from './iconesTratamentos'

// o que o paciente consegue fazer depois de cadastrar um tratamento
const BENEFICIOS = [
  'Cadastre o nome, a dosagem e os horários de cada medicamento.',
  'Receba um lembrete em Notificações na hora de cada dose.',
  'Confirme as doses tomadas e acompanhe o seu dia.',
]

// mesmo formato do botão "+ Novo tratamento" do cabeçalho
const BOTAO_ADICIONAR = 'mt-6 h-10! gap-2! whitespace-nowrap rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

// Cartão com orientações e o botão para cadastrar o primeiro tratamento.
export default function EstadoVazioTratamentos({ onAdicionar, desabilitado = false }) {
  const idTitulo = useId()

  return (
    <Card as="section" aria-labelledby={idTitulo} className="mt-6 flex flex-col items-center px-6 py-10 text-center">
      <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-fundo-card text-primaria-texto">
        <Icone nome="remedio" tamanho={26} />
      </span>

      <h2 id={idTitulo} className="mt-4 text-[16px] font-bold leading-6 text-texto">
        Você ainda não tem tratamentos
      </h2>
      <p className="mt-1 max-w-[420px] text-[14px] leading-5 text-secundaria">
        Organize seus medicamentos em um só lugar.
      </p>

      <ul className="mt-4 flex max-w-[420px] flex-col gap-2 text-left">
        {BENEFICIOS.map((texto) => (
          <li key={texto} className="flex items-start gap-2 text-[14px] leading-5 text-texto">
            <IconeCheck tamanho={16} className="mt-0.5 text-sucesso-escura-texto" />
            {texto}
          </li>
        ))}
      </ul>

      <Button type="button" larguraAuto className={BOTAO_ADICIONAR} disabled={desabilitado} onClick={onAdicionar}>
        <IconeMais tamanho={16} />
        Adicionar primeiro tratamento
      </Button>
    </Card>
  )
}
