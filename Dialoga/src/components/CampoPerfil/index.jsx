// ============================================================
// components/CampoPerfil
// Campo das telas de Perfil. Três modos (iguais aos do Figma):
//   'leitura'   -> caixa branca com borda clara, valor em negrito
//   'edicao'    -> borda roxa com brilho, dá para digitar
//   'bloqueado' -> fundo acinzentado + cadeado à direita (não editável)
// Props:
//   label          -> texto acima do campo (vira MAIÚSCULO pelo CSS)
//   rotuloOpcional -> texto ao lado do label, ex.: "(opcional)"
//   icone          -> elemento React mostrado à esquerda
//   modo           -> 'leitura' | 'edicao' | 'bloqueado'
//   ajuda / erro   -> textos abaixo da caixa
//   ...resto       -> value, onChange, placeholder, type, maxLength... (vão no <input>)
//
// Também exporta CampoImutavel: caixa com cadeado à esquerda e duas
// linhas (rótulo pequeno + valor), usada em "Dados imutáveis" (CRP/CPF).
// ============================================================
import { useId } from 'react'
import { IconeCadeado } from '../IconesPerfil'

const CAIXA = {
  leitura: 'bg-branco border-borda',
  edicao: 'bg-branco border-primaria shadow-[0_0_0_2px_var(--color-primaria-alfa-20)]',
  bloqueado: 'bg-fundo-suave-2 border-borda',
}

export default function CampoPerfil({ label, rotuloOpcional, icone, modo = 'leitura', ajuda, erro, ...inputProps }) {
  const id = useId()
  const editavel = modo === 'edicao'
  const descricao = [erro && `${id}-erro`, ajuda && `${id}-ajuda`].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-[0.06em] text-secundaria">
        {label}
        {rotuloOpcional && <span className="ml-1 font-normal normal-case tracking-normal"> {rotuloOpcional}</span>}
      </label>

      <div className={`flex items-center gap-2.5 h-[46px] px-3 border rounded-lg transition-[border-color,box-shadow] duration-200 ease-[ease] ${erro ? 'border-erro' : CAIXA[modo]}`}>
        {icone && <span className="flex text-secundaria">{icone}</span>}
        <input
          id={id}
          readOnly={!editavel}
          tabIndex={editavel ? undefined : -1}
          aria-invalid={!!erro}
          aria-describedby={descricao}
          className={`flex-1 min-w-0 border-0 outline-0 bg-transparent text-[14px] placeholder:text-texto-alfa-50 ${
            modo === 'bloqueado' ? 'text-secundaria font-normal cursor-default' : 'text-texto font-semibold'
          } ${editavel ? '' : 'cursor-default'}`}
          {...inputProps}
        />
        {modo === 'bloqueado' && <IconeCadeado tamanho={13} className="text-secundaria" />}
      </div>

      {ajuda && <span id={`${id}-ajuda`} className="text-[12px] text-secundaria">{ajuda}</span>}
      {erro && <span id={`${id}-erro`} className="text-[12px] text-erro">{erro}</span>}
    </div>
  )
}

export function CampoImutavel({ label, valor }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 min-h-11 bg-fundo-suave-2 border border-borda rounded-lg">
      <IconeCadeado tamanho={13} className="text-secundaria" />
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] text-secundaria">{label}</span>
        <span className="text-[14px] text-secundaria">{valor}</span>
      </div>
    </div>
  )
}
