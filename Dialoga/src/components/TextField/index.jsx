// ============================================================
// components/TextField
// Campo de formulário completo: label + caixa com ícone + input + erro.
// Props:
//   label -> texto acima do campo
//   icone -> imagem (import de um .png/.svg) OU elemento React (ex.: <svg>) mostrado à esquerda
//   acao  -> elemento à direita (ex.: botão de mostrar senha)
//   erro  -> mensagem de erro (deixa a borda vermelha)
//   ajuda -> texto de apoio abaixo do campo (opcional; texto ou elemento React)
//   ...resto (type, value, onChange, placeholder...) vai direto no <input>
// ============================================================
import { useId } from 'react'

export default function TextField({ label, icone, acao, erro, ajuda, ...inputProps }) {
  const id = useId() // id único que liga o label ao input
  // ids dos textos que descrevem o campo (erro e/ou ajuda), para leitores de tela
  const descricao = [erro && `${id}-erro`, ajuda && `${id}-ajuda`].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-texto" htmlFor={id}>{label}</label>

      <div className={`flex items-center gap-2 h-10 px-3 bg-superficie border rounded-lg transition-[border-color,box-shadow] duration-200 ease-[ease] focus-within:border-primaria focus-within:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] ${erro ? 'border-erro' : 'border-borda'}`}>
        {icone && (typeof icone === 'string'
          ? <img className="w-4 h-4 object-contain" src={icone} alt="" />
          : <span className="w-4 h-4">{icone}</span>)}
        <input
          id={id}
          className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-[12px] font-normal leading-[normal] text-texto placeholder:text-texto-alfa-50"
          aria-invalid={!!erro}
          aria-describedby={descricao}
          {...inputProps}
        />
        {acao}
      </div>

      {ajuda && <span id={`${id}-ajuda`} className="text-[10px] text-secundaria">{ajuda}</span>}

      {erro && <span id={`${id}-erro`} className="text-[11px] text-erro-texto">{erro}</span>}
    </div>
  )
}
