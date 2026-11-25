// ============================================================
// PerfilEmAnalise
// Card mostrado depois que o profissional envia o cadastro:
// avisa que o perfil está em análise pela equipe.
// Só layout: nenhuma lógica aqui.
// Props:
//   onCiente -> função chamada ao clicar em "Ciente"
// ============================================================
import { Link } from 'react-router-dom'
import Button from '../../../../../components/Button'
import ilustracao from '../../../../../assets/auth/iconAnalisePerfilProfissional.png'

export default function PerfilEmAnalise({ onCiente }) {
  return (
    <section className="flex flex-col items-center p-6 bg-superficie border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)] text-center">
      <img className="w-[156px] h-[110px]" src={ilustracao} alt="" />

      <h1 className="mt-3 max-w-[280px] text-[20px] font-extrabold leading-tight text-texto">
        Seu perfil foi enviado para análise
      </h1>
      <p className="mt-2 text-[13px] text-secundaria">
        Nossa equipe está revisando suas informações para validar seu cadastro. Você receberá um e-mail com o
        resultado em breve.
      </p>

      <div className="w-full mt-5">
        <Button type="button" onClick={onCiente}>Ciente</Button>
      </div>

      <p className="mt-4 text-[12px] text-secundaria">
        Voltar para o{' '}
        <Link className="text-primaria-texto font-bold no-underline hover:underline" to="/login">login</Link>
      </p>
    </section>
  )
}
