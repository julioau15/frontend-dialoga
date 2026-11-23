// ============================================================
// pages/profissional/RespostaTarefa
// Tela de resposta de uma tarefa enviada (RF297, RF298).
// Ligada à API (hook useRespostaTarefa); o :id da rota é o id do envio (tbl_tarefa_destinatario).
// Rota: /profissional/tarefas/acompanhamento/:id
//   - "Voltar ao acompanhamento" (ou "Voltar ao perfil", quando aberta pelo Histórico de
//     tarefas do perfil do paciente: volta para o perfil, na aba Histórico);
//   - cartão do paciente: avatar, nome, e-mail, telefone, "Ver perfil do paciente" e status;
//   - cartão da tarefa: nome, descrição e última modificação;
//   - "Respostas (N)": perguntas e respostas (sem resposta = "Ainda não respondida").
// id inexistente mostra o aviso "Resposta não encontrada"; falha na API mostra o erro com "Tentar novamente".
//
// Layout (o Figma só tem esta tela no desktop: "Respostas de tarefa - Profissional"):
//   - Desktop (lg, ≥1024px): igual ao Figma, uma coluna de 720px com o cartão do paciente
//     em cima, depois a tarefa e as respostas. E-mail, telefone e "Ver perfil do paciente"
//     (exigidos pela task) ficam no cartão do paciente, no lugar de
//     "Psicologia Clínica / Toque na foto para ver o perfil"; a foto também abre o perfil.
//   - Adaptação para tablet (768px) e mobile (403px), seguindo as telas de Tarefas e
//     Nova tarefa: mesma largura de conteúdo (até 768px), mesmos paddings (24px nas laterais)
//     e cartões; tudo empilhado na mesma ordem (paciente primeiro, depois a tarefa
//     e as perguntas e respostas). No mobile o nome da tarefa cai de 20px para 18px,
//     o selo de status desce para baixo do nome do paciente, o e-mail e o telefone ficam
//     um embaixo do outro e "Ver perfil do paciente" vira um botão de largura total.
// ============================================================
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import { Atividade } from '../../../components/Icones'
import BotaoVoltar from '../NovaTarefa/components/BotaoVoltar'
import { useAuth } from '../../../contexts/AuthContext'
import { useRespostaTarefa } from '../../../hooks/useAcompanhamentoTarefas'
import { formatarDataBR } from '../../../utils/formatadores'
import { statusDe } from '../AcompanhamentoTarefas/components/statusAcompanhamento'
import CartaoPaciente from './components/CartaoPaciente'
import RespostaPergunta from './components/RespostaPergunta'

const ROTA_ACOMPANHAMENTO = '/profissional/tarefas/acompanhamento'

function RespostaTarefa() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { auth } = useAuth()
  const { item, carregando, erro, recarregar } = useRespostaTarefa(auth?.token, id)
  // aberta pelo "Histórico de tarefas" do perfil do paciente: volta para o perfil, já na aba Histórico;
  // aberta pelo Acompanhamento (ou pela lista de Tarefas): volta para o Acompanhamento
  const voltarPara = location.state?.voltarPara
  // texto do botão: quem abriu a tela pode mandar o seu (ex.: "Voltar ao dashboard")
  const rotuloVoltar = location.state?.rotuloVoltar ?? (voltarPara ? 'Voltar ao perfil' : 'Voltar ao acompanhamento')
  const voltar = () => (voltarPara ? navigate(voltarPara, { state: { aba: 'historico' } }) : navigate(ROTA_ACOMPANHAMENTO))

  // "Ver perfil do paciente" (e a foto): abre o perfil do paciente (idPerfil = id na lista de Pacientes)
  function verPerfil() {
    if (item.paciente.idPerfil != null) navigate(`/profissional/pacientes/${item.paciente.idPerfil}`)
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-4 px-6 pt-6 pb-10 sm:pb-12">
        <BotaoVoltar onClick={voltar}>{rotuloVoltar}</BotaoVoltar>

        {carregando ? (
          <p role="status" className="mt-1 py-10 text-center text-[13px] text-secundaria">Carregando resposta...</p>
        ) : erro ? (
          <Card as="section" role="alert" className="mt-1 flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[13px] text-erro">{erro}</p>
            <Button type="button" variante="suave" larguraAuto className="h-[42px]! rounded-xl! px-4! text-[14px]! font-bold!" onClick={recarregar}>
              Tentar novamente
            </Button>
          </Card>
        ) : !item ? (
          <Card as="section" className="mt-1 px-5 py-10 text-center">
            <h1 className="text-[16px] font-bold text-texto">Resposta não encontrada</h1>
            <p className="mt-2 text-[13px] text-secundaria">Essa tarefa não existe ou foi removida.</p>
          </Card>
        ) : (
          <>
            {/* o Figma não mostra título de página; o h1 fica só para leitores de tela */}
            <h1 className="sr-only">Resposta da tarefa {item.tarefa.titulo}</h1>

            <div className="mt-1">
              <CartaoPaciente paciente={item.paciente} status={statusDe(item.status)} onVerPerfil={verPerfil} />
            </div>

            <Card as="section" aria-labelledby="titulo-tarefa" className="px-5 py-6">
              <h2 id="titulo-tarefa" className="text-[18px] font-extrabold leading-snug text-texto sm:text-[20px]">{item.tarefa.titulo}</h2>
              {item.tarefa.descricao && <p className="mt-1.5 text-[13px] leading-relaxed text-secundaria">{item.tarefa.descricao}</p>}
              <p className="mt-4 text-[11px] text-secundaria">
                Última modificação: <strong className="font-bold text-texto">{formatarDataBR(item.ultimaModificacao)}</strong>
              </p>
            </Card>

            <section aria-labelledby="titulo-respostas" className="flex flex-col gap-3">
              <h2 id="titulo-respostas" className="mt-1 flex items-center gap-2 text-[13px] font-bold text-texto">
                <Atividade className="h-3.5 w-3.5 text-primaria" />
                Respostas ({item.respostas.length})
              </h2>
              {item.respostas.map((resposta, i) => (
                <RespostaPergunta key={i} numero={i + 1} item={resposta} />
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default RespostaTarefa
