// ============================================================
// components/DocumentoLegal
// Tela de leitura de um documento (Termos de Uso, Política de Privacidade).
// Props:
//   documento -> { titulo, versao, atualizacao, blocos } (ver pasta data/)
//   outro     -> { texto, para } link para o outro documento, mostrado no fim
// Mostra o índice de seções no topo e o texto logo abaixo.
// ============================================================
import { Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../Logo'

// Transforma trechos **assim** em negrito
function Texto({ children }) {
  return children.split('**').map((parte, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-texto">{parte}</strong> : <Fragment key={i}>{parte}</Fragment>
  )
}

// "3. Profissional" -> "secao-3"
function idDaSecao(texto) {
  return `secao-${texto.split('.')[0]}`
}

export default function DocumentoLegal({ documento, outro }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Se a pessoa chegou por um link dentro do sistema, volta para a tela anterior;
  // se abriu o endereço direto, volta para o login.
  function voltar() {
    if (location.key !== 'default') navigate(-1)
    else navigate('/login')
  }

  const secoes = documento.blocos.filter((b) => b.t === 'h2')

  return (
    <main className="min-h-svh py-8 px-4 bg-fundo-suave bg-pagina">
      <div className="w-full max-w-[760px] mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="p-0 border-0 bg-transparent text-[13px] font-bold text-primaria-texto cursor-pointer hover:underline"
            onClick={voltar}
          >
            ← Voltar
          </button>
        </div>

        <article className="p-6 sm:p-8 bg-superficie border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
          <h1 className="text-[22px] font-extrabold text-texto">{documento.titulo}</h1>
          <p className="mt-1 text-[12px] text-secundaria">
            Versão {documento.versao} · Última atualização: {documento.atualizacao}
          </p>

          {/* Índice */}
          <nav aria-label="Seções do documento" className="mt-5 p-4 rounded-xl bg-fundo-suave-2">
            <p className="text-[12px] font-bold text-texto">Neste documento</p>
            <ol className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 list-none p-0">
              {secoes.map((s) => (
                <li key={s.x}>
                  <a className="text-[12px] text-primaria-texto no-underline hover:underline" href={`#${idDaSecao(s.x)}`}>{s.x}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Conteúdo */}
          <div className="mt-6 flex flex-col gap-3 text-[13px] leading-[1.6] text-secundaria">
            {documento.blocos.map((b, i) => {
              if (b.t === 'h2') {
                return <h2 key={i} id={idDaSecao(b.x)} className="mt-4 scroll-mt-4 text-[16px] font-extrabold text-texto">{b.x}</h2>
              }
              if (b.t === 'h3') {
                return <h3 key={i} className="mt-1 text-[14px] font-bold text-texto">{b.x}</h3>
              }
              if (b.t === 'ul') {
                return (
                  <ul key={i} className="m-0 pl-5 list-disc flex flex-col gap-1">
                    {b.x.map((item) => <li key={item}><Texto>{item}</Texto></li>)}
                  </ul>
                )
              }
              if (b.t === 'campo') {
                return <p key={i} className="m-0"><Texto>{b.x}</Texto></p>
              }
              return <p key={i} className="m-0"><Texto>{b.x}</Texto></p>
            })}
          </div>
        </article>

        {outro && (
          <p className="text-center text-[12px] text-secundaria">
            Veja também: <Link className="text-primaria-texto font-bold no-underline hover:underline" to={outro.para}>{outro.texto}</Link>
          </p>
        )}
      </div>
    </main>
  )
}
