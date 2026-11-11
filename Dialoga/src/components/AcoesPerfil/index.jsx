// ============================================================
// components/AcoesPerfil
// Botões do rodapé do cartão de Perfil:
//   leitura -> [ Editar perfil ]
//   edição  -> [ Cancelar ] [ Salvar alterações ]
// Props: editando, salvando (desabilita os botões enquanto a API responde),
//        onEditar, onCancelar, comLinha (traço acima dos botões)
// No mobile (< 640px), Cancelar e Salvar dividem a linha inteira (frames mobile).
// ============================================================
import Button from '../Button'
import { IconeCheck, IconeX } from '../Icones'
import { IconeLapis } from '../IconesPerfil'

export default function AcoesPerfil({ editando, salvando = false, onEditar, onCancelar, comLinha = false }) {
  return (
    <div className={`flex gap-2 ${comLinha ? 'pt-4 border-t border-borda' : ''}`}>
      {editando ? (
        <>
          <Button type="button" variante="suave" larguraAuto className="h-11 text-[14px] max-sm:flex-1" onClick={onCancelar} disabled={salvando}>
            <IconeX tamanho={13} />
            Cancelar
          </Button>
          <Button type="submit" larguraAuto carregando={salvando} className="h-11 text-[14px] max-sm:flex-1">
            <IconeCheck tamanho={13} />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </>
      ) : (
        // type="button": só abre a edição, não envia o formulário
        <Button type="button" larguraAuto className="h-11 text-[14px]" onClick={onEditar}>
          <IconeLapis tamanho={13} />
          Editar perfil
        </Button>
      )}
    </div>
  )
}
