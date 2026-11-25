// ============================================================
// ChipHorarioDose
// Chip de um horário do tratamento com a situação da dose de hoje:
//   - sem dose do dia ou 'futura' -> só o horário (como antes);
//   - 'pendente' -> horário + botão "Tomar";
//   - 'atrasada' -> horário em amarelo com "atrasada" + botão "Tomar";
//   - 'tomada'   -> horário em verde com o visto e a hora da confirmação.
// Props:
//   hora        -> horário do chip ('HH:mm')
//   nome        -> nome do tratamento (usado no rótulo acessível do botão)
//   dose        -> { idHorario, status, podeConfirmar, horaConfirmacao } | undefined
//   confirmando -> idHorario da dose sendo confirmada (null quando nenhuma)
//   onConfirmar(dose) -> confirma a dose
// ============================================================
import { IconeCheck, IconeRelogio } from './iconesTratamentos'

// chip de 22px de altura com texto de 12px (mesma medida dos chips de horário do Figma)
const CHIP = 'inline-flex h-[22px] items-center gap-1 rounded-md px-2 text-[12px] font-semibold'

// botão "Tomar" ao lado do chip, na cor principal
const BOTAO_TOMAR =
  'inline-flex h-[22px] cursor-pointer items-center rounded-md bg-primaria bg-botao px-2 text-[12px] font-bold text-branco ' +
  'transition-[filter] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

// Desenha o chip conforme a situação da dose de hoje daquele horário.
export default function ChipHorarioDose({ hora, nome, dose, confirmando = null, onConfirmar }) {
  const horaCurta = hora.slice(0, 5)

  // dose já registrada hoje: chip verde com a hora em que foi confirmada
  if (dose?.status === 'tomada') {
    return (
      <span className={`${CHIP} bg-sucesso-fundo text-sucesso-escura-texto`}>
        <IconeCheck tamanho={11} />
        {horaCurta}
        {dose.horaConfirmacao && <span className="font-normal">· tomada às {dose.horaConfirmacao}</span>}
      </span>
    )
  }

  const atrasada = dose?.status === 'atrasada'
  const estaConfirmando = confirmando !== null && confirmando === dose?.idHorario

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`${CHIP} ${atrasada ? 'bg-alerta-fundo text-alerta-escura-texto' : 'bg-borda text-texto'}`}>
        <IconeRelogio tamanho={11} className={atrasada ? '' : 'text-secundaria'} />
        {horaCurta}
        {atrasada && <span className="font-normal">· atrasada</span>}
      </span>

      {dose?.podeConfirmar && (
        <button
          type="button"
          className={BOTAO_TOMAR}
          disabled={confirmando !== null}
          aria-label={`Confirmar a dose de ${nome} das ${horaCurta}`}
          onClick={() => onConfirmar?.(dose)}
        >
          {estaConfirmando ? 'Salvando...' : 'Tomar'}
        </button>
      )}
    </span>
  )
}
