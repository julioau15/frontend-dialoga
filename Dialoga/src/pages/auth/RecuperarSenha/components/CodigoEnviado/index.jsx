// ============================================================
// CodigoEnviado (passo 2 da recuperação de senha)
// Aviso de e-mail enviado, 4 caixas do código, botão
// "Redefinir senha", link "Enviar novamente" e "Trocar e-mail".
// Props:
//   valor       -> código digitado (string, até 4 dígitos)
//   onAlterar   -> recebe o novo código completo (string)
//   erro        -> erro de validação do campo
//   erroGeral   -> erro vindo da API
//   mensagem    -> aviso de sucesso (ex.: código reenviado)
//   carregando  -> true enquanto a API responde
//   onSubmit    -> chamado ao enviar o formulário
//   onReenviar  -> chamado ao clicar em "Enviar novamente"
//   onVoltar    -> chamado ao clicar em "Trocar e-mail"
// ============================================================
import { useRef } from 'react'
import Button from '../../../../../components/Button'

const QUANTIDADE_DIGITOS = 4

// Check verde (herda a cor do texto)
const IconeCheck = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export default function CodigoEnviado({
  valor = '',
  onAlterar,
  erro,
  erroGeral,
  mensagem,
  carregando = false,
  onSubmit,
  onReenviar,
  onVoltar,
}) {
  const refs = useRef([])

  // true enquanto o foco é movido pelo próprio componente (avanço automático).
  // Sem isso, o onFocus da caixa seguinte lê o código ANTIGO (ainda sem o dígito
  // recém-digitado) e devolve o foco para a primeira caixa vazia.
  const movendoFoco = useRef(false)

  const focar = (indice) => {
    movendoFoco.current = true
    refs.current[indice]?.focus()
    movendoFoco.current = false
  }

  // Digitou (ou apagou) em uma caixa
  function aoDigitar(indice, e) {
    const digito = e.target.value.replace(/\D/g, '').slice(-1)

    if (!digito) {
      // apagou o dígito desta caixa
      onAlterar(valor.slice(0, indice) + valor.slice(indice + 1))
      return
    }

    const novo = (valor.slice(0, indice) + digito + valor.slice(indice + 1)).slice(0, QUANTIDADE_DIGITOS)
    onAlterar(novo)
    if (indice < QUANTIDADE_DIGITOS - 1) focar(indice + 1)
  }

  // Backspace em caixa vazia volta para a anterior e apaga o dígito dela
  function aoPressionar(indice, e) {
    if (e.key === 'Backspace' && !valor[indice] && indice > 0) {
      e.preventDefault()
      onAlterar(valor.slice(0, indice - 1))
      focar(indice - 1)
    }
    if (e.key === 'ArrowLeft' && indice > 0) focar(indice - 1)
    if (e.key === 'ArrowRight' && indice < valor.length) focar(indice + 1)
  }

  // Colar o código inteiro (ex.: copiado do e-mail)
  function aoColar(e) {
    e.preventDefault()
    const digitos = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, QUANTIDADE_DIGITOS)
    if (!digitos) return
    onAlterar(digitos)
    focar(Math.min(digitos.length, QUANTIDADE_DIGITOS - 1))
  }

  // Impede pular caixas: o foco vai para a primeira vazia
  function aoFocar(indice) {
    if (movendoFoco.current) return
    if (indice > valor.length) focar(valor.length)
  }

  return (
    <form className="flex flex-col items-center text-center" onSubmit={onSubmit} noValidate>
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-sucesso-fundo text-sucesso">
        {IconeCheck}
      </span>

      <h1 className="mt-4 text-[20px] font-extrabold text-texto">E-mail enviado!</h1>
      <p className="mt-2 max-w-[280px] text-[12px] text-secundaria">
        Verifique sua caixa de entrada. O código para redefinir a senha expirará em 10 minutos.
      </p>

      {/* Caixas do código */}
      <div
        className="flex gap-4 mt-6"
        role="group"
        aria-label="Código de verificação"
        onPaste={aoColar}
      >
        {Array.from({ length: QUANTIDADE_DIGITOS }, (_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="w-14 h-11 text-center bg-branco border border-borda rounded-lg text-[18px] font-bold leading-[normal] text-texto outline-0 transition-[border-color,box-shadow] duration-200 ease-[ease] focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoComplete="one-time-code"
            aria-label={`Dígito ${i + 1}`}
            value={valor[i] ?? ''}
            onChange={(e) => aoDigitar(i, e)}
            onKeyDown={(e) => aoPressionar(i, e)}
            onFocus={() => aoFocar(i)}
            disabled={carregando}
          />
        ))}
      </div>

      {/* Mensagens: erro do campo, erro da API ou aviso de sucesso */}
      {(erro || erroGeral) && (
        <p className="mt-3 text-[12px] text-erro" role="alert">
          {erro || erroGeral}
        </p>
      )}
      {mensagem && <p className="mt-3 text-[12px] text-sucesso">{mensagem}</p>}

      <div className="w-full mt-6">
        <Button type="submit" disabled={carregando}>
          {carregando ? 'Verificando...' : 'Redefinir senha'}
        </Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[11px] text-secundaria cursor-pointer hover:underline disabled:opacity-50"
        type="button"
        onClick={onReenviar}
        disabled={carregando}
      >
        Enviar novamente
      </button>

      <button
        className="mt-2 p-0 border-0 bg-transparent text-[11px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onVoltar}
      >
        Trocar e-mail
      </button>
    </form>
  )
}