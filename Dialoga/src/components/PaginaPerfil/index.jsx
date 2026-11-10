// ============================================================
// components/PaginaPerfil
// Moldura da tela de Perfil: fundo lilás do Figma, título "Meu perfil",
// subtítulo e uma coluna centralizada onde entra o CartaoPerfil.
// Props:
//   subtitulo        -> texto abaixo do título
//   compensarLayout  -> true (padrão) anula o padding p-6 do LayoutComSidebar
//                       (paciente e profissional) para o fundo lilás preencher
//                       a área toda. No admin use false: o LayoutAdmin já tem
//                       o fundo e não tem padding.
// ============================================================
export default function PaginaPerfil({ subtitulo, compensarLayout = true, children }) {
  return (
    <div className={`min-h-svh bg-fundo-suave ${compensarLayout ? '-m-6' : ''}`}>
      <div className="mx-auto w-full max-w-[488px] px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-[22px] font-extrabold text-texto">Meu perfil</h1>
        <p className="mb-5 text-[12px] text-secundaria">{subtitulo}</p>
        {children}
      </div>
    </div>
  )
}
