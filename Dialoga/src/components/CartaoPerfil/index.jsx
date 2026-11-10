// ============================================================
// components/CartaoPerfil
// Cartão das telas de Perfil: faixa colorida no topo (avatar com iniciais,
// lápis de editar foto, nome, selo e "Clique na foto para alterar")
// e, embaixo, o formulário (children).
// Props:
//   tom          -> 'paciente' (degradê lavanda→rosa) | 'profissional' (roxo) | 'admin' (laranja)
//   nome         -> nome completo (as iniciais são calculadas aqui)
//   selo         -> conteúdo da etiqueta embaixo do nome (texto ou elementos)
//   fotoUrl      -> foto (opcional); sem ela aparecem as iniciais
//   onTrocarFoto -> clique no avatar (opcional; a troca de foto ainda não está ligada)
//   onSubmit     -> envio do formulário
// ============================================================
import { doisPrimeirosNomes } from '../../utils/formatadores'
import { IconeLapis } from '../IconesPerfil'

// Classes escritas por extenso para o Tailwind encontrá-las.
// O laranja do admin ainda não existe em variebles.css (valores avulsos).
// No Figma as iniciais são as dos dois primeiros nomes ("Carlos Eduardo Mendes" -> "CE")
const iniciaisPerfil = (nome) => doisPrimeirosNomes(nome).map((parte) => parte[0]).join('').toUpperCase()

const TONS = {
  paciente: {
    faixa: 'bg-principal',
    avatar: 'bg-branco text-primaria',
    lapis: 'bg-primaria text-branco',
    selo: 'bg-branco-alfa-80 text-primaria',
    dica: 'text-secundaria',
  },
  profissional: {
    faixa: 'bg-linear-to-b from-primaria to-primaria-escura',
    avatar: 'bg-branco-alfa-20 border-2 border-branco-alfa-40 text-branco',
    lapis: 'bg-branco text-primaria',
    selo: 'bg-branco-alfa-20 text-branco',
    dica: 'text-branco-alfa-70',
  },
  admin: {
    faixa: 'bg-linear-to-b from-[#C97A33] to-[#A85A27]',
    avatar: 'bg-branco-alfa-20 border-2 border-branco-alfa-40 text-branco',
    lapis: 'bg-branco text-primaria',
    selo: 'bg-branco-alfa-20 text-branco',
    dica: 'text-branco-alfa-70',
  },
}

export default function CartaoPerfil({ tom = 'paciente', nome, selo, fotoUrl, onTrocarFoto, onSubmit, children }) {
  const t = TONS[tom]

  return (
    <section className="overflow-hidden rounded-xl border border-borda bg-branco shadow-sm">
      <div className={`flex flex-col items-center gap-1.5 px-6 py-7 ${t.faixa}`}>
        <button
          type="button"
          onClick={onTrocarFoto}
          aria-label="Alterar foto de perfil"
          className="relative rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-branco"
        >
          {fotoUrl ? (
            <img src={fotoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className={`grid h-20 w-20 place-items-center rounded-full text-[22px] font-extrabold ${t.avatar}`}>
              {iniciaisPerfil(nome)}
            </span>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full shadow-sm ${t.lapis}`}>
            <IconeLapis tamanho={12} />
          </span>
        </button>

        <p className="mt-1.5 text-[18px] font-extrabold text-branco text-center">{nome}</p>
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
