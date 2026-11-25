// ============================================================
// LoginHero (painel esquerdo do login)
// A ilustração e o texto formam um "palco" com proporção fixa
// (igual ao Figma). O palco sempre PREENCHE o painel, e o texto
// é posicionado em % do palco, então fica no mesmo lugar em relação
// às pessoas em qualquer tamanho de tela.
// A largura do painel é controlada em pages/auth/Login/index.jsx (grid-cols).
// Para trocar a imagem, substitua assets/auth/ilustracao-login.png
// (se a proporção mudar, ajuste --proporcao-num e o aspect-[915/1024] aqui
// e o 0.8936 no Login/index.jsx)
// ============================================================
import ilustracao from '../../../../../assets/auth/ilustracao-login.png'

export default function LoginHero() {
  return (
    /* Painel esquerdo: mede o próprio tamanho (container-type:size) para o palco se ajustar.
          --proporcao-num = largura / altura da ilustração (915 / 1024).
          O fundo lilás só aparece enquanto a imagem carrega. */
    <section
      className="relative overflow-hidden bg-[#E7DBF5] dark:bg-fundo-card [container-type:size] [--proporcao-num:0.8936] [@media(max-width:900px)]:hidden"
      aria-label="Apresentação do Dialoga"
    >
      {/* Palco: cobre o painel todo (como "cover"), mantendo a proporção da arte */}
      <div className="absolute top-1/2 left-1/2 w-[max(100cqw,calc(100cqh_*_var(--proporcao-num)))] aspect-[915/1024] -translate-x-1/2 -translate-y-1/2 [container-type:inline-size]">
        {/* Imagem decorativa, por isso alt vazio */}
        {/* no tema escuro a arte colorida é escurecida para combinar com o resto da tela */}
        <img className="block w-full h-full dark:brightness-[.4] dark:saturate-[.9]" src={ilustracao} alt="" />

        <div className="absolute top-[14.5%] inset-x-0 px-[4%] text-center">
          <h1 className="text-[length:clamp(15px,4.7cqw,42px)] font-extrabold leading-[1.2] text-texto">
            Acompanhe suas emoções.<br />Compartilhe o que importa.
          </h1>
          <p className="mt-[1.8cqw] text-[length:clamp(11px,2cqw,18px)] leading-[1.4] text-secundaria dark:text-texto">
            Um espaço seguro para você se conhecer,<br />refletir e cuidar da sua saúde mental.
          </p>
        </div>
      </div>
    </section>
  )
}