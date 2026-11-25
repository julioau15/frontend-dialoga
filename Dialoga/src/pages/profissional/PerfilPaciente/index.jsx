// ============================================================
// pages/profissional/PerfilPaciente
// Perfil do paciente na visão do profissional (acompanhamento do paciente).
// Dados da API pelo hook usePerfilPaciente. Rota: /profissional/pacientes/:id
// Frames: "Paciente com aceite", "Paciente com aceite indicadores", "Paciente com aceite
//         hitorico de tarefas", "Nova nota perfil", "Solicitar acesso", "Acesso solicitado"
//         e os frames "Pacientes profissional - mobile" correspondentes.
//   - "Voltar à lista" e cabeçalho com nome, status, "Na plataforma", e-mail, telefone,
//     "Desde" e próxima sessão (RF214–RF217, RF220);
//   - resumo: sessões, tarefas enviadas e taxa de resposta (RF218, RF308);
//   - abas Anotações, Indicadores e Histórico de tarefas (RF219, RF309);
//   - anotações privadas: nova, editar, excluir e "Sem anotações" (RF221, RF222, RF310, RF311);
//   - indicadores com período, faixas, sono, registros do paciente, tarefas e aderência
//     (RF228–RF238, RF314, RF316);
//   - sem acesso: "Solicitar acesso", confirmação e "Solicitação enviada" (RF223–RF226, RF312, RF313);
//   - remover paciente com confirmação (RF315): volta para a lista com o aviso.
// Ao chegar aqui depois de "Adicionar paciente", mostra o toast "Paciente adicionado!".
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useCallback, useState } from 'react'
import Button from '../../../components/Button'
import { usePerfilPaciente } from '../../../hooks/usePerfilPaciente'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AbasSegmentadas from '../../../components/AbasSegmentadas'
import Card from '../../../components/Card'
import Toast from '../../../components/Toast'
import BotaoVoltar from '../NovaTarefa/components/BotaoVoltar'
import ModalAnotacao from '../Pacientes/components/ModalAnotacao'
import AbaAnotacoes from './components/AbaAnotacoes'
import AbaHistorico from './components/AbaHistorico'
import AbaIndicadores from './components/AbaIndicadores'
import CabecalhoPaciente from './components/CabecalhoPaciente'
import CartoesResumo from './components/CartoesResumo'
import ModalConfirmacao from './components/ModalConfirmacao'
import { AJUSTE_TOAST } from './components/estilosPerfil'
import { ABAS_PERFIL } from './components/textosPerfil'

const ID_PAINEL = 'painel-perfil-paciente'

// Abas do Figma: largura toda (também no desktop), emoji visível no mobile, texto de 12px
// seminegrito e, no mobile, "Histórico de tarefas" quebra em 2 linhas sem cortar.
// O AbasSegmentadas compartilhado não muda: o contêiner só ajusta as medidas.
const AJUSTE_ABAS = [
  '[&>div]:gap-0 [&>div]:p-0.5 md:[&>div]:w-full',
  '[&_button]:h-auto [&_button]:min-h-8 [&_button]:px-2 [&_button]:py-1.5 [&_button]:text-[12px] [&_button]:font-semibold [&_button]:leading-4',
  '[&_button>span]:inline-flex',
].join(' ')

// moldura da página: fundo lilás e conteúdo com 722px no desktop, centralizado (Figma).
// "fora" recebe os pop-ups e o toast, que ficam fora da coluna (para não somar espaços do gap)
function Moldura({ children, fora }) {
  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave bg-pagina">
      <div className="mx-auto flex w-full max-w-[770px] flex-col gap-[15px] px-6 pt-6 pb-12 lg:pt-[24px]">{children}</div>
      {fora}
    </div>
  )
}

// conteúdo do perfil de um paciente (a página troca a "key" quando o id muda)
function Perfil({ id }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dados = usePerfilPaciente(id)
  const { perfil, anotacoes } = dados

  // aba inicial: "Anotações", ou a que a tela anterior pediu (ex.: voltar da resposta -> "Histórico")
  const [aba, setAba] = useState(location.state?.aba ?? 'anotacoes')
  const [notaAberta, setNotaAberta] = useState(null) // { anotacao } enquanto o pop-up de nota está aberto
  const [chaveNota, setChaveNota] = useState(0) // troco a key do pop-up para ele abrir sempre com os dados certos
  const [paraExcluir, setParaExcluir] = useState(null) // nota escolhida na lixeira
  const [confirmarAcesso, setConfirmarAcesso] = useState(false)
  const [confirmarRemocao, setConfirmarRemocao] = useState(false)
  // toast: começa aberto quando a lista mandou um aviso (ex.: "Paciente adicionado!")
  const [toast, setToast] = useState(() => ({
    aberto: Boolean(location.state?.aviso),
    tipo: 'sucesso',
    mensagem: location.state?.aviso ?? '',
  }))

  // O Toast usa esta função dentro de um useEffect; com o useCallback o tempo do aviso não reinicia.
  // Também limpa o aviso da navegação, para ele não voltar ao recarregar a página.
  const fecharToast = useCallback(() => {
    setToast((t) => ({ ...t, aberto: false }))
    navigate(location.pathname, { replace: true, state: null })
  }, [navigate, location.pathname])

  // volta para a lista de pacientes (com um aviso opcional para ela mostrar)
  function voltar(state) {
    navigate('/profissional/pacientes', state ? { state } : undefined)
  }

  if (dados.carregando || dados.erro) {
    return (
      <Moldura>
        <div className="mb-[6px]">
          <BotaoVoltar onClick={() => voltar()}>Voltar à lista</BotaoVoltar>
        </div>
        {dados.carregando ? (
          <p role="status" className="text-[13px] text-secundaria">Carregando perfil...</p>
        ) : (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-4">
            <p className="text-[13px] text-erro-texto">{dados.erro}</p>
            <Button type="button" variante="suave" larguraAuto onClick={dados.recarregar}>
              Tentar novamente
            </Button>
          </div>
        )}
      </Moldura>
    )
  }

  // paciente inexistente (id errado na URL)
  if (!perfil) {
    return (
      <Moldura>
        <div className="mb-[6px]">
          <BotaoVoltar onClick={() => voltar()}>Voltar à lista</BotaoVoltar>
        </div>
        <Card className="px-5 py-10 text-center">
          <p className="text-[14px] font-bold text-texto">Paciente não encontrado</p>
          <p className="mt-1 text-[12px] text-secundaria">Ele pode ter sido removido da sua lista.</p>
        </Card>
      </Moldura>
    )
  }

  const paciente = perfil

  // mostra um aviso no toast
  function avisar(mensagem, tipo = 'sucesso') {
    setToast({ aberto: true, tipo, mensagem })
  }

  // abre o pop-up de nota: sem argumento = nova; com a nota = editar
  function abrirNota(anotacao = null) {
    setChaveNota((n) => n + 1)
    setNotaAberta({ anotacao })
  }

  // salva na API (criando ou editando), atualiza a lista e mostra o toast
  async function salvarNota(nota) {
    try {
      await dados.salvarNota(nota)
      setNotaAberta(null)
      avisar(nota.id != null ? 'Nota atualizada!' : 'Nota adicionada!')
    } catch (erro) {
      avisar(erro.message, 'erro')
    }
  }

  // confirma a exclusão da nota escolhida na lixeira
  async function confirmarExclusao() {
    try {
      await dados.excluirNota(paraExcluir)
      setParaExcluir(null)
      avisar('Nota removida.', 'erro')
    } catch (erro) {
      avisar(erro.message, 'erro')
    }
  }

  // RF225 e RF226: envia o pedido ao paciente e mostra "Solicitação enviada"
  async function enviarSolicitacao() {
    try {
      const acesso = await dados.solicitarAcesso()
      setConfirmarAcesso(false)
      avisar(acesso === 'aprovado' ? 'O paciente já autorizou o acesso aos indicadores.' : 'Solicitação de acesso enviada ao paciente.')
    } catch (erro) {
      setConfirmarAcesso(false)
      avisar(erro.message, 'erro')
    }
  }

  // RF315: encerra o vínculo e volta para a lista com o aviso
  async function confirmarRemocaoPaciente() {
    try {
      await dados.remover()
      setConfirmarRemocao(false)
      voltar({ aviso: 'Paciente removido.', tipoAviso: 'erro' })
    } catch (erro) {
      setConfirmarRemocao(false)
      avisar(erro.message, 'erro')
    }
  }

  const abas = ABAS_PERFIL.map((a) => ({ ...a, icone: <span aria-hidden="true">{a.emoji}</span> }))

  // pop-ups e toast (ficam fora da coluna do conteúdo)
  const fora = (
    <>
      <ModalAnotacao
        key={chaveNota}
        aberto={notaAberta !== null}
        anotacao={notaAberta?.anotacao ?? null}
        onFechar={() => setNotaAberta(null)}
        onSalvar={salvarNota}
      />

      <ModalConfirmacao
        aberto={paraExcluir !== null}
        titulo="Excluir anotação"
        rotuloConfirmar="Excluir"
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      >
        Esta anotação será removida permanentemente.
      </ModalConfirmacao>

      <ModalConfirmacao
        aberto={confirmarAcesso}
        titulo="Solicitar acesso aos indicadores"
        rotuloConfirmar="Enviar solicitação"
        variante="primario"
        onCancelar={() => setConfirmarAcesso(false)}
        onConfirmar={enviarSolicitacao}
      >
        Será enviada uma notificação para <strong>{paciente.nome}</strong> solicitando autorização para visualizar seus
        indicadores de humor, sono e aderência ao tratamento.
      </ModalConfirmacao>

      <ModalConfirmacao
        aberto={confirmarRemocao}
        titulo="Remover paciente"
        rotuloConfirmar="Remover"
        onCancelar={() => setConfirmarRemocao(false)}
        onConfirmar={confirmarRemocaoPaciente}
      >
        <strong>{paciente.nome}</strong> sairá da sua lista de pacientes e você deixará de acompanhar os dados dele.
      </ModalConfirmacao>

      <div className={AJUSTE_TOAST}>
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
      </div>
    </>
  )

  return (
    <Moldura fora={fora}>
      <div className="mb-[6px]">
        <BotaoVoltar onClick={() => voltar()}>Voltar à lista</BotaoVoltar>
      </div>

      <CabecalhoPaciente
        paciente={paciente}
        onSolicitarAcesso={() => setConfirmarAcesso(true)}
        onRemover={() => setConfirmarRemocao(true)}
      />

      <CartoesResumo resumo={paciente.resumo} />

      <div className={AJUSTE_ABAS}>
        <AbasSegmentadas abas={abas} ativa={aba} onMudar={setAba} />
      </div>

      <div id={ID_PAINEL} role="tabpanel" aria-label={ABAS_PERFIL.find((a) => a.id === aba).rotulo}>
        {aba === 'anotacoes' && (
          <AbaAnotacoes anotacoes={anotacoes} onNova={() => abrirNota()} onEditar={abrirNota} onExcluir={setParaExcluir} />
        )}
        {aba === 'indicadores' && <AbaIndicadores paciente={paciente} onSolicitarAcesso={() => setConfirmarAcesso(true)} />}
        {aba === 'historico' && <AbaHistorico paciente={paciente} onSolicitarAcesso={() => setConfirmarAcesso(true)} />}
      </div>
    </Moldura>
  )
}

function PerfilPaciente() {
  const { id } = useParams()
  // key: ao trocar de paciente pela URL, o perfil começa do zero (aba, notas e pop-ups)
  return <Perfil key={id} id={id} />
}

export default PerfilPaciente
