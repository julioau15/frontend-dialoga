// ============================================================
// campos (Nova tarefa)
// Rótulo e campo de texto no tamanho do Figma da Nova tarefa
// (rótulo 13px; campo de 46px, ou 66px quando tem várias linhas).
// Rotulo     -> props: htmlFor, obrigatorio (asterisco vermelho), opcional ("(opcional)")
// CampoTexto -> props: rotulo, obrigatorio, opcional, erro, multilinha (vira <textarea>)
//               ...resto (value, onChange, placeholder, maxLength...) vai direto no campo
// ============================================================
import { useId } from 'react'
import { CAIXA } from './estilos'

export function Rotulo({ htmlFor, obrigatorio = false, opcional = false, children }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-texto">
      {children}
      {obrigatorio && <span className="text-erro" aria-hidden="true"> *</span>}
      {opcional && <span className="font-normal text-secundaria"> (opcional)</span>}
    </label>
  )
}

export function CampoTexto({ rotulo, obrigatorio, opcional, erro, multilinha = false, ...props }) {
  const id = useId()
  const Tag = multilinha ? 'textarea' : 'input'

  return (
    <div className="flex flex-col gap-2">
      <Rotulo htmlFor={id} obrigatorio={obrigatorio} opcional={opcional}>{rotulo}</Rotulo>
      <Tag
        id={id}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`${CAIXA} ${multilinha ? 'h-[66px] resize-none py-3 leading-snug' : 'h-[46px]'} ${erro ? 'border-erro' : 'border-borda'}`}
        {...props}
      />
      {erro && <span id={`${id}-erro`} className="text-[11px] text-erro">{erro}</span>}
    </div>
  )
}
