// ============================================================
// components/AvatarIniciais
// Círculo com as iniciais do nome (quando não há foto).
// Props:
//   nome -> nome completo (as iniciais são calculadas aqui)
//   tom  -> 'lilas' (padrão) | 'rosa'
// ============================================================
import { iniciais } from '../../utils/formatadores'

// Classes escritas por extenso para o Tailwind encontrá-las
const TONS = {
  lilas: 'bg-borda-forte text-primaria',
  rosa: 'bg-erro-fundo-2 text-avatar-vermelho',
}

export default function AvatarIniciais({ nome, tom = 'lilas' }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${TONS[tom]}`}
    >
      {iniciais(nome)}
    </div>
  )
}
