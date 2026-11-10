// ============================================================
// components/AcoesPerfil
// Botões do rodapé do cartão de Perfil:
//   leitura -> [ Editar perfil ]
//   edição  -> [ Cancelar ] [ Salvar alterações ]
// Props: editando, onEditar, onCancelar, comLinha (traço acima dos botões)
// ============================================================
import Button from '../Button'
import { IconeCheck, IconeX } from '../Icones'
import { IconeLapis } from '../IconesPerfil'

export default function AcoesPerfil({ editando, onEditar, onCancelar, comLinha = false }) {
  return (
    <div className={`flex gap-2 ${comLinha ? 'pt-4 border-t border-borda' : ''}`}>
      {editando ? (
        <>
          <Button type="button" variante="suave" larguraAuto onClick={onCancelar}>
            <IconeX tamanho={13} />
            Cancelar
          </Button>
          <Button type="submit" larguraAuto>
            <IconeCheck tamanho={13} />
            Salvar alterações
          </Button>
        </>
      ) : (
        // type="button": só abre a edição, não envia o formulário
        <Button type="button" larguraAuto onClick={onEditar}>
          <IconeLapis tamanho={13} />
          Editar perfil
        </Button>
      )}
    </div>
  )
}
