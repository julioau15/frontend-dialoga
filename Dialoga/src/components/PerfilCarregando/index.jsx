// ============================================================
// components/PerfilCarregando
// Tela de Perfil enquanto os dados chegam (esqueleto) ou quando a busca falha
// (mensagem + "Tentar novamente").
// Props: erro (texto; vazio = ainda carregando), onTentarNovamente,
//        subtitulo e compensarLayout (iguais aos do PaginaPerfil)
// ============================================================
import Button from '../Button'
import PaginaPerfil from '../PaginaPerfil'

export default function PerfilCarregando({ erro, onTentarNovamente, subtitulo, compensarLayout }) {
  return (
    <PaginaPerfil subtitulo={subtitulo} compensarLayout={compensarLayout}>
      {erro ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-5">
          <p className="text-[14px] text-erro">{erro}</p>
          <Button type="button" variante="suave" larguraAuto className="h-10" onClick={onTentarNovamente}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div role="status" aria-label="Carregando perfil" className="overflow-hidden rounded-xl border border-borda bg-branco shadow-sm">
          <div className="h-[190px] animate-pulse bg-fundo-suave-2" />
          <div className="flex flex-col gap-5 p-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[46px] animate-pulse rounded-lg bg-fundo-suave-2" />
            ))}
          </div>
        </div>
      )}
    </PaginaPerfil>
  )
}
