// ============================================================
// pages/paciente/PerfilProfissional
// Tela de um profissional do paciente, aberta pelo cartão da tela Profissionais.
// Só visual: dados fixos (mock), sem API. Rota: /paciente/profissionais/:id
// Frame: "Profissional histórico - Paciente" (só desktop no Figma).
//   - nome e "Especialista em [especialidade] · [registro]";
//   - cartão do perfil (avatar, nome, modalidades, especialidades e próxima consulta disponível);
//   - "Tarefas ativas" e "Tratamentos vinculados", cada um com o link "Ver todas/todos";
//   - botão "Voltar" (volta para a lista de Profissionais).
// Desktop (a partir de 1280px): duas colunas com as larguras do Figma (627px e 470px, 48px entre
// elas). Em telas maiores que o frame (ex.: 1920px) o bloco não estica: fica com a largura do
// Figma e centralizado na área ao lado do menu. Abaixo de 1280px, Tablet e Mobile (sem frame, combinado com a equipe):
// uma coluna na mesma ordem (perfil, tarefas, tratamentos e Voltar).
// id inexistente mostra "Profissional não encontrado".
// ============================================================
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CartaoLista from './components/CartaoLista'
import CartaoPerfil from './components/CartaoPerfil'
import { IconeAtividade, IconeCirculoCheck } from './components/iconesPerfilProfissional'
import { buscarPerfilProfissional } from './components/perfilProfissionalMock'

// botão "Voltar": pílula de 38px, texto de 14px em negrito (como no Figma)
const BOTAO_VOLTAR = 'h-[38px]! rounded-full! pr-[25px]! pl-6! text-[14px]! font-bold! shadow-sm max-xl:w-full!'

function PerfilProfissional() {
  const { id } = useParams()
  const navigate = useNavigate()
  const perfil = buscarPerfilProfissional(id)

  // volta para a lista de profissionais
  const voltar = () => navigate('/paciente/profissionais')

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* no desktop: 1145px de conteúdo (627 + 48 + 470), como no frame de 1440px; no mobile, 16px nas laterais */}
      <div className="mx-auto w-full max-w-[770px] px-4 pt-4 pb-10 sm:px-6 sm:pt-[21px] sm:pb-12 xl:max-w-[1184px] xl:pt-[30px] xl:pr-[21px] xl:pl-[18px]">
        {!perfil ? (
          <Card className="mt-2 px-5 py-10 text-center">
            <h1 className="text-[16px] font-bold text-texto">Profissional não encontrado</h1>
            <p className="mt-1 text-[13px] text-secundaria">Ele pode ter sido removido da sua lista.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-[15px] xl:grid xl:grid-cols-[627fr_470fr] xl:gap-x-12 xl:gap-y-0">
            {/* coluna da esquerda: título, perfil e tarefas */}
            <div className="flex min-w-0 flex-col gap-3 sm:gap-[15px] xl:gap-0">
              <header className="xl:px-[21px]">
                <h1 className="break-words text-[20px] font-extrabold leading-7 sm:text-[24px] sm:leading-[30px] text-texto">{perfil.nome}</h1>
                <p className="mt-0.5 text-[13px] leading-5 text-secundaria sm:mt-1 sm:text-[14px] xl:mt-1.5">
                  Especialista em {perfil.especialidade}
                  {perfil.registro && ` · ${perfil.registro}`}
                </p>
              </header>

              <div className="xl:mt-[38px]">
                <CartaoPerfil perfil={perfil} />
              </div>

              <div className="xl:mt-[56px]">
                <CartaoLista
                  titulo="Tarefas ativas"
                  subtitulo="Acompanhe as atividades práticas recomendadas pelo profissional para este período."
                  itens={perfil.tarefas}
                  icone={<IconeCirculoCheck tamanho={22} />}
                  textoVazio="Nenhuma tarefa ativa com este profissional."
                  link={{ para: '/paciente/tarefas', rotulo: 'Ver todas as tarefas' }}
                />
              </div>
            </div>

            {/* coluna da direita: tratamentos (no desktop começa na altura do cartão do perfil) */}
            <div className="min-w-0 xl:pt-[99px]">
              <CartaoLista
                titulo="Tratamentos vinculados"
                subtitulo="Acompanhe os planos e intervenções atuais com este profissional."
                itens={perfil.tratamentos}
                icone={<IconeAtividade tamanho={18} />}
                textoVazio="Nenhum tratamento vinculado a este profissional."
                link={{ para: '/paciente/tratamentos', rotulo: 'Ver todos os tratamentos' }}
                tituloInteiro
                className="xl:min-h-[641px] xl:pb-[34px]"
              />
            </div>
          </div>
        )}

        {/* Voltar: no canto direito no desktop, na largura toda no mobile e no tablet */}
        <div className="mt-5 flex justify-end sm:mt-6 xl:mt-[26px] xl:mr-[30px]">
          <Button type="button" larguraAuto className={BOTAO_VOLTAR} onClick={voltar}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PerfilProfissional
