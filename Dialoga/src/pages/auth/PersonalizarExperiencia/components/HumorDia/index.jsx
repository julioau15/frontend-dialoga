// ============================================================
// HumorDia (etapa 3 "Humor" de Personalizar experiência)
// "Como você está hoje?" com chips, horas de sono, relato e pensamentos.
// Regras (iguais às do banco / controller_registro_humor.js):
//   - Sentimento do dia: UMA opção só (clicar em outra troca a escolha)
//   - Sentimento, energia, humor, horas de sono e pensamentos: obrigatórios
//   - Horas de sono: só números, de 0 a 24, até 2 casas decimais
//   - Relato: opcional, com limite de caracteres
// Props:
//   valores        -> { sentimento, energia, humorDia, horasSono, relato, pensamento }
//   erros          -> mensagens de erro por campo
//   erroGeral      -> mensagem geral (ex.: falha na API)
//   enviando       -> true enquanto salva (desabilita os botões)
//   onAlterarCampo -> (campo, valor) => void
//   onSalvar       -> chamado ao enviar o formulário ("Salvar e acessar o Dialoga")
//   onAgoraNao     -> chamado ao clicar em "Agora não — ir para o início"
//   onVoltar       -> volta para a etapa anterior
// ============================================================
import { useId } from 'react'
import TextField from '../../../../../components/TextField'
import TextAreaField from '../../../../../components/TextAreaField'
import Button from '../../../../../components/Button'
import Chip from '../../../../../components/Chip'
import ilustracao from '../../../../../assets/auth/ilustracaoHumorDia.png'
import { LIMITES_PERSONALIZACAO } from '../../../../../utils/validators'

const SENTIMENTOS = ['Feliz', 'Triste', 'Ansioso', 'Irritado', 'Calmo', 'Cansado']
const ENERGIA = ['Baixa', 'Média', 'Alta']
const HUMOR = ['Muito ruim', 'Ruim', 'Neutro', 'Bom', 'Muito bom']
const PENSAMENTOS = ['Positivos', 'Negativos', 'Neutros']

// "(opcional)" pequeno ao lado do rótulo
const OPCIONAL = <span className="text-[10px] font-normal text-secundaria">(opcional)</span>

// Grupo de opções com título e erro
// (<fieldset> + <legend> = leitor de tela anuncia o grupo; aria-describedby lê o erro)
function Grupo({ titulo, erro, children, className = 'flex flex-wrap gap-2' }) {
  const id = useId()
  return (
    <fieldset className="min-w-0 p-0 m-0 border-0 text-left" aria-describedby={erro ? `${id}-erro` : undefined}>
      <legend className="mb-2 p-0 text-[11px] font-bold text-texto">{titulo}</legend>
      <div className={className}>{children}</div>
      {erro && <span id={`${id}-erro`} className="block mt-1.5 text-[11px] text-erro">{erro}</span>}
    </fieldset>
  )
}

export default function HumorDia({ valores, erros = {}, erroGeral, enviando, onAlterarCampo, onSalvar, onAgoraNao, onVoltar }) {
  return (
    <form className="flex flex-col items-center" onSubmit={onSalvar} noValidate>
      <img className="h-[150px] w-[107px] object-contain" src={ilustracao} width="107" height="150" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-center text-texto">Como você está hoje?</h1>
      <p className="mt-2 max-w-[360px] text-[13px] text-center text-secundaria">
        Registre como você está se sentindo neste momento.
      </p>

      <div className="flex flex-col gap-4 w-full mt-6">
        {/* Escolha ÚNICA: guardamos um texto, não uma lista */}
        <Grupo titulo="Sentimento do dia" erro={erros.sentimento}>
          {SENTIMENTOS.map((sentimento) => (
            <Chip
              key={sentimento}
              selecionado={valores.sentimento === sentimento}
              onClick={() => onAlterarCampo('sentimento', sentimento)}
            >
              {sentimento}
            </Chip>
          ))}
        </Grupo>

        <Grupo titulo="Energia do dia" erro={erros.energia} className="grid grid-cols-3 gap-2">
          {ENERGIA.map((nivel) => (
            <Chip key={nivel} className="w-full" selecionado={valores.energia === nivel} onClick={() => onAlterarCampo('energia', nivel)}>
              {nivel}
            </Chip>
          ))}
        </Grupo>

        <Grupo titulo="Humor do dia" erro={erros.humorDia}>
          {HUMOR.map((nivel) => (
            <Chip key={nivel} selecionado={valores.humorDia === nivel} onClick={() => onAlterarCampo('humorDia', nivel)}>
              {nivel}
            </Chip>
          ))}
        </Grupo>

        <TextField
          label="Quantas horas você dormiu?"
          name="horasSono"
          inputMode="decimal" // teclado numérico com vírgula/ponto no celular
          autoComplete="off"
          maxLength={5} // "99.99"
          placeholder="Ex: 7.5"
          value={valores.horasSono}
          onChange={(e) => onAlterarCampo('horasSono', e.target.value)} // a máscara é aplicada no hook
          erro={erros.horasSono}
          ajuda={erros.horasSono ? undefined : 'De 0 a 24 horas. Pode usar vírgula ou ponto.'}
        />

        <TextAreaField
          label={<>Conte algo importante que aconteceu hoje {OPCIONAL}</>}
          name="relato"
          placeholder="Descreva um acontecimento relevante do seu dia..."
          maxLength={LIMITES_PERSONALIZACAO.RELATO}
          value={valores.relato}
          onChange={(e) => onAlterarCampo('relato', e.target.value)}
          erro={erros.relato}
          ajuda={`${valores.relato.length}/${LIMITES_PERSONALIZACAO.RELATO} caracteres`}
        />

        <Grupo titulo="Pensamentos" erro={erros.pensamento} className="flex flex-wrap gap-x-5 gap-y-2">
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
        </Grupo>
      </div>

      {/* Erro geral: campos faltando ou falha ao salvar na API */}
      {erroGeral && (
        <p role="alert" className="w-full mt-4 text-[11px] text-center text-erro">{erroGeral}</p>
      )}

      <div className="w-full mt-6">
        <Button type="submit" carregando={enviando}>
          {enviando ? 'Salvando...' : <>Salvar e acessar o Dialoga <span aria-hidden="true">💜</span></>}
        </Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline disabled:cursor-not-allowed"
        type="button"
        onClick={onAgoraNao}
        disabled={enviando}
      >
        Agora não — ir para o início
      </button>
      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline disabled:cursor-not-allowed"
        type="button"
        onClick={onVoltar}
        disabled={enviando}
      >
        ← Voltar
      </button>
    </form>
  )
}
