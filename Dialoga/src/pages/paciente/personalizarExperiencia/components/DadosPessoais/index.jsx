// ============================================================
// DadosPessoais (etapa 1 "Pessoal" de Personalizar experiência)
// Só layout: ilustração, título, 2 campos opcionais, botão e "Pular".
// Props:
//   valores        -> { apelido, dataNascimento }
//   nomeCompleto   -> nome completo mostrado abaixo do 1º campo
//   onAlterarCampo -> (campo, valor) => void
//   onContinuar    -> chamado ao enviar o formulário
//   onPular        -> chamado ao clicar em "Pular por enquanto"
// ============================================================
import TextField from '../../../../../components/TextField'
import Button from '../../../../../components/Button'
import iconeNome from '../../../../../assets/auth/IconNome.png'
import ilustracao from '../../../../../assets/auth/ilustracaoPersonalizarExperiencia.png'

// "(opcional)" pequeno ao lado do rótulo
const OPCIONAL = <span className="text-[10px] font-normal text-secundaria">(opcional)</span>

// Calendário (herda a cor do texto)
const IconeCalendario = (
  <svg className="text-secundaria" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

export default function DadosPessoais({ valores, nomeCompleto, onAlterarCampo, onContinuar, onPular }) {
  return (
    <form className="flex flex-col items-center" onSubmit={onContinuar} noValidate>
      <img className="h-[150px] w-[106px] object-contain" src={ilustracao} width="106" height="150" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-center text-texto">Vamos personalizar sua experiência</h1>
      <p className="mt-2 max-w-[360px] text-[13px] text-center text-secundaria">
        Algumas informações ajudarão o Dialoga a oferecer uma experiência mais adequada para você.
      </p>

      <div className="flex flex-col gap-4 w-full mt-6">
        <TextField
          label={<>Como devemos chamar você? {OPCIONAL}</>}
          name="apelido"
          autoComplete="nickname"
          placeholder="Digite como prefere ser chamado"
          icone={iconeNome}
          value={valores.apelido}
          onChange={(e) => onAlterarCampo('apelido', e.target.value)}
          ajuda={<>Seu nome completo é <strong className="font-bold text-texto">{nomeCompleto}</strong>.</>}
        />

        <TextField
          label={<>Data de nascimento {OPCIONAL}</>}
          name="dataNascimento"
          autoComplete="bday"
          inputMode="numeric"
          maxLength={10}
          placeholder="dd/mm/aaaa"
          icone={IconeCalendario}
          value={valores.dataNascimento}
          onChange={(e) => onAlterarCampo('dataNascimento', e.target.value)}
        />
      </div>

      <div className="w-full mt-8">
        <Button type="submit">Continuar →</Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onPular}
      >
        Pular por enquanto
      </button>
    </form>
  )
}
