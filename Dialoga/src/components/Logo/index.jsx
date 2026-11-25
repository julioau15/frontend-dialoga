// ============================================================
// components/Logo
// Logo do Dialoga. Prop: className (classes extras, ex.: "mx-auto").
// Para trocar a imagem, substitua assets/auth/logo-dialoga.png
// ============================================================
import logo from '../../assets/auth/logo-dialoga.png'

export default function Logo({ className = '' }) {
  return <img className={`logo-tema block w-[309px] h-[105px] ${className}`} src={logo} alt="Dialoga" />
}
