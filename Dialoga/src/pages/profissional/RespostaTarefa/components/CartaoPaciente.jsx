// ============================================================
// CartaoPaciente
// Cartão do paciente no topo da tela de resposta (RF297, RF298), como no Figma
// "Respostas de tarefa - Profissional": avatar grande com anel lilás, nome e selo de status.
// No lugar de "Psicologia Clínica / Toque na foto para ver o perfil" do Figma ficam
// o e-mail, o telefone e o link "Ver perfil do paciente" (exigidos pela task).
// E-mail e telefone só aparecem quando a API os devolve (depois que o vínculo é aceito).
// A foto também abre o perfil.
// Mobile: o selo desce para baixo do nome e "Ver perfil do paciente" vira um botão
// de largura total no fim do cartão.
// Props: paciente ({ id, nome, email, telefone }), status ({ rotulo, tom }), onVerPerfil()
// ============================================================
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeEmail, IconeTelefone } from '../../../../components/Icones'
import AvatarPaciente from '../../AcompanhamentoTarefas/components/AvatarPaciente'
import { BOTAO_CLARO } from '../../NovaTarefa/components/estilos'

// linha de contato com ícone (e-mail ou telefone), clicável
function Contato({ href, icone, children }) {
  return (
    <a
      href={href}
      className="flex min-w-0 items-center gap-1.5 rounded-md text-[11.5px] text-secundaria hover:text-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      {icone}
      <span className="truncate">{children}</span>
    </a>
  )
}

export default function CartaoPaciente({ paciente, status, onVerPerfil }) {
  return (
    <Card as="section" aria-labelledby="titulo-paciente" className="flex flex-col gap-4 p-5 sm:py-[22px]">
      <div className="flex items-center gap-4">
        {/* a foto (iniciais) também abre o perfil */}
        <button
          type="button"
          onClick={onVerPerfil}
          aria-label={`Abrir o perfil de ${paciente.nome}`}
          className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primaria"
        >
          <AvatarPaciente paciente={paciente} tamanho="grande" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 id="titulo-paciente" className="truncate text-[16px] font-bold leading-snug text-texto">{paciente.nome}</h2>
          <div className="mt-0.5 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:gap-x-4">
            {paciente.email && (
              <Contato href={`mailto:${paciente.email}`} icone={<IconeEmail tamanho={12} className="shrink-0" />}>{paciente.email}</Contato>
            )}
            {paciente.telefone && (
              <Contato href={`tel:${paciente.telefone.replace(/\D/g, '')}`} icone={<IconeTelefone tamanho={12} className="shrink-0" />}>
                {paciente.telefone}
              </Contato>
            )}
          </div>
          <button
            type="button"
            onClick={onVerPerfil}
            className="mt-0.5 hidden cursor-pointer rounded-md text-[11.5px] font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:inline"
          >
            Ver perfil do paciente
          </button>
          {/* mobile: selo abaixo do nome */}
          <div className="mt-2 sm:hidden">
            <Selo tom={status.tom}>{status.rotulo}</Selo>
          </div>
        </div>

        {/* tablet/desktop: selo à direita, como no Figma */}
        <div className="hidden self-center sm:block">
          <Selo tom={status.tom}>{status.rotulo}</Selo>
        </div>
      </div>

      {/* mobile: botão de largura total, no padrão das outras telas do profissional */}
      <button type="button" onClick={onVerPerfil} className={`${BOTAO_CLARO} w-full sm:hidden`}>
        Ver perfil do paciente
      </button>
    </Card>
  )
}
