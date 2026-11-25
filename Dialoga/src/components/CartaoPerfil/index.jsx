// ============================================================
// components/CartaoPerfil
// Cartão das telas de Perfil: faixa colorida no topo (avatar com iniciais,
// lápis de editar foto, nome, selo e "Clique na foto para alterar")
// e, embaixo, o formulário (children).
// Props:
//   tom          -> 'paciente' (degradê lavanda→rosa) | 'profissional' (degradê roxo) | 'admin' (degradê âmbar)
//   nome         -> nome completo (as iniciais são calculadas aqui)
//   selo         -> conteúdo da etiqueta embaixo do nome (texto ou elementos)
//   fotoUrl      -> foto (opcional); sem ela, ou se não carregar, aparecem as iniciais
//   onEscolherFoto -> recebe o arquivo (File) escolhido ao clicar no avatar. Sem ela, o clique não faz nada.
//   onSubmit     -> envio do formulário
// ============================================================
import { useRef, useState } from 'react'
import { IconeLapis } from '../IconesPerfil'

// Mesmas iniciais da Sidebar: primeira e última palavra do nome ("Dra. Ana Beatriz Souza" -> "DS")
function iniciaisPerfil(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Avatar sem foto: lilás com a inicial roxa, igual ao da Sidebar
const AVATAR_INICIAIS = 'bg-borda-forte text-primaria-texto'

// Classes escritas por extenso para o Tailwind encontrá-las.
// Todas as cores vêm de variebles.css. Os textos pequenos (selo e dica) foram
// escolhidos para passar no contraste WCAG AA (4,5:1) no ponto mais claro da faixa.
const TONS = {
  paciente: {
    faixa: 'bg-principal',
    lapis: 'bg-primaria bg-botao text-branco',
    nome: 'text-texto', // no Figma o nome sobre o degradê claro é escuro
    selo: 'bg-branco-alfa-80 text-primaria-fixa',
    dica: 'text-secundaria-escura',
  },
  profissional: {
    faixa: 'bg-primaria bg-hero',
    lapis: 'bg-branco text-primaria-fixa',
    nome: 'text-branco',
    selo: 'bg-preto/15 text-branco',
    dica: 'text-branco-alfa-90',
  },
  admin: {
    // Figma: degradê diagonal âmbar (alerta -> alerta-escura). Começa no alerta-escura
    // porque, sobre o alerta (#D97706), o texto branco pequeno não passa no contraste.
    faixa: 'bg-linear-to-br from-alerta-escura to-alerta-mais-escura',
    lapis: 'bg-branco text-primaria-fixa',
    nome: 'text-branco',
    selo: 'bg-preto/15 text-branco',
    dica: 'text-branco',
  },
}

export default function CartaoPerfil({ tom = 'paciente', nome, selo, fotoUrl, onEscolherFoto, onSubmit, children }) {
  const t = TONS[tom]
  const campoArquivo = useRef(null)
  // guarda QUAL foto falhou: se a foto mudar, a nova URL é tentada de novo (igual à Sidebar)
  const [fotoComErro, setFotoComErro] = useState(null)

  function aoEscolherArquivo(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo depois de cancelar
    if (arquivo) onEscolherFoto?.(arquivo)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm">
      <div className={`flex flex-col items-center gap-1.5 px-6 py-7 ${t.faixa}`}>
        <button
          type="button"
          onClick={() => campoArquivo.current?.click()}
          className="relative rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-branco"
        >
          <input ref={campoArquivo} type="file" accept="image/*" className="hidden" tabIndex={-1} onChange={aoEscolherArquivo} />
          {/* nome do botão para leitores de tela (texto oculto em vez de aria-label,
              para não conflitar com as iniciais visíveis) */}
          <span className="sr-only">Alterar foto de perfil</span>
          {fotoUrl && fotoUrl !== fotoComErro ? (
            <img
              src={fotoUrl}
              alt=""
              onError={() => setFotoComErro(fotoUrl)}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            // aria-hidden: as iniciais são decorativas (o nome completo aparece logo abaixo)
            <span aria-hidden="true" className={`grid h-20 w-20 place-items-center rounded-full text-[22px] font-extrabold ${AVATAR_INICIAIS}`}>
              {iniciaisPerfil(nome)}
            </span>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full shadow-sm ${t.lapis}`}>
            <IconeLapis tamanho={12} />
          </span>
        </button>

        <p className={`mt-1.5 text-[18px] font-extrabold text-center ${t.nome}`}>{nome}</p>
        <span className={`inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full text-[12px] font-semibold ${t.selo}`}>
          {selo}
        </span>
        <p className={`text-[12px] ${t.dica}`}>Clique na foto para alterar</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 p-5">
        {children}
      </form>
    </section>
  )
}