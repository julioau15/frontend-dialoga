// ============================================================
// components/AvatarIniciais
// Círculo com a foto do usuário ou, sem foto, com as iniciais do nome.
// Props:
//   nome -> nome completo (as iniciais são calculadas aqui)
//   foto -> URL da foto (opcional). Se a imagem falhar, volta para as iniciais.
//   tom  -> 'lilas' (padrão) | 'rosa'
// ============================================================
import { useState } from 'react'
import { iniciais } from '../../utils/formatadores'

// Classes escritas por extenso para o Tailwind encontrá-las
const TONS = {
  lilas: 'bg-borda-forte text-primaria',
  rosa: 'bg-erro-fundo-2 text-avatar-vermelho',
}

export default function AvatarIniciais({ nome, foto = null, tom = 'lilas' }) {
  // guardo a URL que falhou: se a foto mudar, a nova URL é tentada de novo
  const [fotoComErro, setFotoComErro] = useState(null)

  if (foto && foto !== fotoComErro) {
    return (
      <img
        src={foto}
        alt={`Foto de ${nome}`}
        onError={() => setFotoComErro(foto)}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${TONS[tom]}`}
    >
      {iniciais(nome)}
    </div>
  )
}
