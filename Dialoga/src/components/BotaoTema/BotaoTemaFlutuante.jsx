// ============================================================
// components/BotaoTema/BotaoTemaFlutuante
// Botão de tema no canto superior direito das telas SEM menu lateral
// (login, cadastro, recuperar senha, termos, primeiro acesso...).
// Nas áreas logadas (/paciente, /profissional, /admin) ele some,
// porque o botão já está dentro do menu lateral.
// ============================================================
import { useLocation } from 'react-router-dom'
import BotaoTema from './index'

const AREAS_COM_MENU = ['/paciente', '/profissional', '/admin']

export default function BotaoTemaFlutuante() {
  const { pathname } = useLocation()
  const temMenu = AREAS_COM_MENU.some((area) => pathname === area || pathname.startsWith(`${area}/`))
  if (temMenu) return null

  return (
    <div className="fixed top-3 right-3 z-50">
      <BotaoTema className="border border-borda bg-superficie shadow-[0_2px_6px_var(--color-sombra)]" />
    </div>
  )
}
