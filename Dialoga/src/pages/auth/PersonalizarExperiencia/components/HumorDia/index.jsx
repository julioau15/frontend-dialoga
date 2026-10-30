// ============================================================
// HumorDia (etapa 3 "Humor" de Personalizar experiência)
// Só layout: "Como você está hoje?" com chips, horas de sono, relato e pensamentos.
// Props:
//   valores        -> { sentimentos[], energia, humorDia, horasSono, relato, pensamento }
//   onAlterarCampo -> (campo, valor) => void
//   onSalvar       -> chamado ao enviar o formulário ("Salvar e acessar o Dialoga")
//   onAgoraNao     -> chamado ao clicar em "Agora não — ir para o início"
//   onVoltar       -> volta para a etapa anterior
// ============================================================
import TextField from '../../../../../components/TextField'
import TextAreaField from '../../../../../components/TextAreaField'
import Button from '../../../../../components/Button'
import Chip from '../../../../../components/Chip'
import ilustracao from '../../../../../assets/auth/ilustracaoHumorDia.png'

const SENTIMENTOS = ['Feliz', 'Triste', 'Ansioso', 'Irritado', 'Calmo', 'Cansado']
const ENERGIA = ['Baixa', 'Média', 'Alta']
const HUMOR = ['Muito ruim', 'Ruim', 'Neutro', 'Bom', 'Muito bom']
const PENSAMENTOS = ['Positivos', 'Negativos', 'Neutros']

// "(opcional)" pequeno ao lado do rótulo
const OPCIONAL = <span className="text-[10px] font-normal text-secundaria">(opcional)</span>

// Grupo de opções com título (<fieldset> + <legend> = leitor de tela anuncia o grupo)
function Grupo({ titulo, children, className = 'flex flex-wrap gap-2' }) {
  return (
    <fieldset className="min-w-0 p-0 m-0 border-0 text-left">
      <legend className="mb-2 p-0 text-[11px] font-bold text-texto">{titulo}</legend>
      <div className={className}>{children}</div>
    </fieldset>
  )
}

export default function HumorDia({ valores, onAlterarCampo, onSalvar, onAgoraNao, onVoltar }) {
  // Sentimento aceita mais de um: clicar de novo desmarca
  const alternarSentimento = (sentimento) => {
    const lista = valores.sentimentos.includes(sentimento)
      ? valores.sentimentos.filter((s) => s !== sentimento)
      : [...valores.sentimentos, sentimento]
    onAlterarCampo('sentimentos', lista)
  }

  return (
    <form className="flex flex-col items-center" onSubmit={onSalvar} noValidate>
      <img className="h-[150px] w-[107px] object-contain" src={ilustracao} width="107" height="150" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-center text-texto">Como você está hoje?</h1>
      <p className="mt-2 max-w-[360px] text-[13px] text-center text-secundaria">
        Registre como você está se sentindo neste momento.
      </p>

      <div className="flex flex-col gap-4 w-full mt-6">
        <Grupo titulo="Sentimento do dia">
          {SENTIMENTOS.map((sentimento) => (
            <Chip key={sentimento} selecionado={valores.sentimentos.includes(sentimento)} onClick={() => alternarSentimento(sentimento)}>
              {sentimento}
            </Chip>
          ))}
        </Grupo>

        <Grupo titulo="Energia do dia" className="grid grid-cols-3 gap-2">
          {ENERGIA.map((nivel) => (
            <Chip key={nivel} className="w-full" selecionado={valores.energia === nivel} onClick={() => onAlterarCampo('energia', nivel)}>
              {nivel}
            </Chip>
          ))}
        </Grupo>

        <Grupo titulo="Humor do dia">
          {HUMOR.map((nivel) => (
            <Chip key={nivel} selecionado={valores.humorDia === nivel} onClick={() => onAlterarCampo('humorDia', nivel)}>
              {nivel}
            </Chip>
          ))}
        </Grupo>

        <TextField
          label="Quantas horas você dormiu?"
          name="horasSono"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Ex: 7.5"
          value={valores.horasSono}
          onChange={(e) => onAlterarCampo('horasSono', e.target.value)}
        />

        <TextAreaField
          label={<>Conte algo importante que aconteceu hoje {OPCIONAL}</>}
          name="relato"
          placeholder="Descreva um acontecimento relevante do seu dia..."
          value={valores.relato}
          onChange={(e) => onAlterarCampo('relato', e.target.value)}
        />

        <fieldset className="min-w-0 p-0 m-0 border-0 text-left">
          <legend className="mb-2 p-0 text-[11px] font-bold text-texto">Pensamentos</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {PENSAMENTOS.map((opcao) => (
              <label key={opcao} className="flex items-center gap-1.5 text-[11px] text-secundaria cursor-pointer">
                <input
                  className="w-3.5 h-3.5 accent-primaria cursor-pointer"
                  type="radio"
                  name="pensamento"
                  value={opcao}
                  checked={valores.pensamento === opcao}
                  onChange={() => onAlterarCampo('pensamento', opcao)}
                />
                {opcao}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="w-full mt-6">
        <Button type="submit">Salvar e acessar o Dialoga <span aria-hidden="true">💜</span></Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onAgoraNao}
      >
        Agora não — ir para o início
      </button>
      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onVoltar}
      >
        ← Voltar
      </button>
    </form>
  )
}
