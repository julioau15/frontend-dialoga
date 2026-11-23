// ============================================================
// pages/paciente/PerfilProfissional
// Tela de um profissional do paciente, aberta pelo cartão da tela Profissionais.
// Dados do acompanhamento recuperados da API ou do armazenamento local. Rota: /paciente/profissionais/:id
// Frame: "Profissional histórico - Paciente" (só desktop no Figma).
//   - nome e "Especialista em [especialidade] · [registro]";
//   - cartão do perfil (avatar, nome, modalidades, especialidades e próxima consulta disponível);
//   - "Tarefas ativas" (as deste profissional que ainda não foram concluídas) e
//     "Tratamentos vinculados" (só quando o paciente autorizou 'Tratamentos' para este
//     profissional em Relatórios), cada um com o link "Ver todas/todos";
//   - botão "Voltar" (volta para a lista de Profissionais).
// Desktop (a partir de 1280px): duas colunas com as larguras do Figma (627px e 470px, 48px entre
// elas). Em telas maiores que o frame (ex.: 1920px) o bloco não estica: fica com a largura do
// Figma e centralizado na área ao lado do menu. Abaixo de 1280px, Tablet e Mobile (sem frame, combinado com a equipe):
// uma coluna na mesma ordem (perfil, tarefas, tratamentos e Voltar).
// id inexistente mostra "Profissional não encontrado".
// ============================================================
import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { listarMeusProfissionais } from '../../../services/profissionaisPacienteService'
import { lerExternos, selecionarProfissional } from '../Profissionais/components/profissionaisMemoria'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CartaoLista from './components/CartaoLista'
import CartaoPerfil from './components/CartaoPerfil'
import { IconeAtividade, IconeCirculoCheck } from './components/iconesPerfilProfissional'
import { buscarPerfilProfissional } from '../../../services/perfilProfissionalService'

// botão "Voltar": pílula de 38px, texto de 14px em negrito (como no Figma)
const BOTAO_VOLTAR = 'h-[38px]! rounded-full! pr-[25px]! pl-6! text-[14px]! font-bold! shadow-sm max-xl:w-full!'

function PerfilProfissional() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [params] = useSearchParams()
  const idVinculo = params.get('vinculo')
  const [tentativa, setTentativa] = useState(0)
  const [resultado, setResultado] = useState(null)
  const chave = JSON.stringify([id, idVinculo, auth?.id, auth?.token, tentativa])
  const atual = resultado?.chave === chave ? resultado : null
  const perfil = atual?.perfil
  useEffect(() => {
    const controle = new AbortController()
    async function carregar() {
      try {
        const lista = id.startsWith('externo-')
          ? lerExternos(auth?.id)
          : await listarMeusProfissionais(auth?.token, controle.signal)
        const basico = selecionarProfissional(lista, id, idVinculo)
        const perfil = await buscarPerfilProfissional(auth?.token, basico, controle.signal)
        if (!controle.signal.aborted) setResultado({ chave, perfil })
      } catch (erro) {
        if (!controle.signal.aborted) setResultado({ chave, erro: erro.message })
      }
    }
    carregar()
    return () => controle.abort()
  }, [id, idVinculo, auth?.id, auth?.token, chave])

  // volta para a lista de profissionais
  const voltar = () => navigate('/paciente/profissionais')

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* no desktop: 1145px de conteúdo (627 + 48 + 470), como no frame de 1440px; no mobile, 16px nas laterais */}
      <div className="mx-auto w-full max-w-[770px] px-4 pt-4 pb-10 sm:px-6 sm:pt-[21px] sm:pb-12 xl:max-w-[1184px] xl:pt-[30px] xl:pr-[21px] xl:pl-[18px]">
        {!atual ? (
          <p role="status" className="mt-8 text-center text-[14px] text-secundaria">Carregando profissional...</p>
        ) : atual.erro ? (
          <Card className="mt-2 px-5 py-10 text-center">
            <p role="alert">{atual.erro}</p>
            <Button type="button" onClick={() => setTentativa((v) => v + 1)}>Tentar novamente</Button>
          </Card>
        ) : !perfil ? (
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
                  textoVazio="Nenhuma tarefa ativa deste profissional."
                  link={{ para: '/paciente/tarefas', rotulo: 'Ver todas as tarefas' }}
                />
              </div>
            </div>

            {/* coluna da direita: tratamentos (no desktop começa na altura do cartão do perfil).
                Só aparece quando o paciente compartilhou os tratamentos com este profissional. */}
            {perfil.tratamentosCompartilhados && (
              <div className="min-w-0 xl:pt-[99px]">
                <CartaoLista
                  titulo="Tratamentos vinculados"
                  subtitulo="Tratamentos que você compartilhou com este profissional."
                  itens={perfil.tratamentos}
                  icone={<IconeAtividade tamanho={18} />}
                  textoVazio="Você ainda não cadastrou tratamentos."
                  link={{ para: '/paciente/tratamentos', rotulo: 'Ver todos os tratamentos' }}
                  tituloInteiro
                  className="xl:min-h-[641px] xl:pb-[34px]"
                />
              </div>
            )}
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
