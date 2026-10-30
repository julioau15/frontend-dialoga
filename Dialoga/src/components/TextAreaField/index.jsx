// ============================================================
// components/TextAreaField
// Campo de texto de várias linhas, com o mesmo visual do TextField.
// Props:
//   label -> texto (ou elemento) do rótulo
//   erro  -> mensagem de erro (deixa a borda vermelha)
//   ajuda -> texto de apoio abaixo do campo (opcional)
//   ...resto (value, onChange, placeholder, rows...) vai direto no <textarea>
// ============================================================
import { useId } from 'react'

export default function TextAreaField({ label, erro, ajuda, ...textareaProps }) {
  const id = useId() // id único que liga o label ao textarea
  const descricao = [erro && `${id}-erro`, ajuda && `${id}-ajuda`].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-texto" htmlFor={id}>{label}</label>

      <textarea
        id={id}
        rows={3}
        className={`w-full min-h-[88px] px-3 py-2.5 bg-branco border rounded-lg resize-none outline-0 text-[12px] font-normal leading-normal text-texto placeholder:text-texto-alfa-50 transition-[border-color,box-shadow] duration-200 ease-[ease] focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] ${erro ? 'border-erro' : 'border-borda'}`}
        aria-invalid={!!erro}
        aria-describedby={descricao}
        {...textareaProps}
      />

      {ajuda && <span id={`${id}-ajuda`} className="text-[10px] text-secundaria">{ajuda}</span>}

      {erro && <span id={`${id}-erro`} className="text-[11px] text-erro">{erro}</span>}
    </div>
  )
}
