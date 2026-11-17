// ============================================================
// pages/profissional/Pacientes
// Lista de pacientes do profissional e pop-up "Adicionar paciente", ligadas à API.
// Rota: /profissional/pacientes
// Frames: "Pacientes - Profissional", "Filtro ativo", "Filtro inativo", "Novo paciente"
//         e os frames "Pacientes profissional - mobile" correspondentes.
//   - título "Pacientes", total de ativos e botão "+ Novo paciente" (RF299, RF302);
//   - busca por nome (sem diferenciar maiúsculas/acentos) e filtro Todos | Ativos | Inativos (RF300, RF301);
//   - cartão do paciente com avatar, nome, selo "Plataforma", "Desde", próxima consulta,
//     status e ícone de anotação (RF306);
//   - pop-up "Adicionar paciente" (RF303, RF304): busca o paciente na plataforma e envia o pedido
//     de vínculo. Na API o paciente precisa aceitar antes, então a tela continua na lista, com o
//     toast "Solicitação enviada!" e o paciente aparece como "Pendente" (no Figma o perfil abria direto);
//   - cartão abre o perfil do paciente; o ícone de anotação abre o pop-up "Anotar — [nome]",
//     grava a nota na API e mostra o toast "Nota adicionada!" (card 1.6.4.3.1.3);
//   - ao voltar do perfil depois de "Remover paciente", mostra o aviso "Paciente removido.".
// Os dados vêm do hook usePacientesProfissional; o perfil (ainda sem API) lê a cópia em pacientesMemoria.
// Estados: carregando, erro (com "Tentar novamente") e lista vazia.
// Busca e filtro valem juntos. Desktop (a partir de 1024px, com o menu lateral),
// Tablet e Mobile (403px): Tablet segue o layout do mobile.
// ============================================================
import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import { IconeMais } from '../../../components/IconesAgenda'
import { useAuth } from '../../../contexts/AuthContext'
import { usePacientesProfissional } from '../../../hooks/usePacientesProfissional'
import { textoParaBusca } from '../../../utils/formatadores'
import CampoPaciente from './components/CampoPaciente'
import FiltroPilulas from './components/FiltroPilulas'
import ItemPaciente from './components/ItemPaciente'
import ModalAnotacao from './components/ModalAnotacao'
import ModalNovoPaciente from './components/ModalNovoPaciente'
import { FILTROS_STATUS } from './components/statusPaciente'

// botão "+ Novo paciente": 40px de altura, cantos de 12px e texto de 14px em negrito
const BOTAO_NOVO = 'h-10! gap-2! rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

// O Toast compartilhado não muda; o contêiner só ajusta as medidas do Figma:
// 44px de altura, cantos de 12px, texto de 14px e o ✓ de 16px (traço 1.8).
// A cor continua a do componente (verde escuro "sucesso-escura"): o verde do Figma
// (#059669) com texto branco não passa no contraste mínimo (AA) de acessibilidade.
const AJUSTE_TOAST =
  '[&>div]:h-11 [&>div]:rounded-xl [&>div]:py-0 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'

// "1 paciente ativo" ou "4 pacientes ativos"
function textoAtivos(quantidade) {
  return quantidade === 1 ? '1 paciente ativo' : `${quantidade} pacientes ativos`
}

function Pacientes() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuth()
  // lista vinda da API (recarrega ao abrir a tela, então já vem sem o paciente removido)
  const lista = usePacientesProfissional(auth?.token)
  const { pacientes, carregando, erro } = lista
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [chaveModal, setChaveModal] = useState(0) // troco a key do pop-up para ele abrir sempre limpo
  const [notaPara, setNotaPara] = useState(null) // paciente do pop-up "Anotar" (null = fechado)
  const [chaveNota, setChaveNota] = useState(0) // troco a key do pop-up para ele abrir sempre vazio
  const [respondendoId, setRespondendoId] = useState(null) // paciente cujo pedido está sendo respondido
  const [salvandoNota, setSalvandoNota] = useState(false) // nota sendo gravada na API
  const [erroNota, setErroNota] = useState('') // mensagem da API mostrada dentro do pop-up
  // toast: começa aberto quando o perfil mandou um aviso (ex.: "Paciente removido.")
  const [toast, setToast] = useState(() => ({
    aberto: Boolean(location.state?.aviso),
    tipo: location.state?.tipoAviso ?? 'sucesso',
    mensagem: location.state?.aviso ?? '',
  }))

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  // Também limpa o aviso da navegação, para ele não voltar ao recarregar a página.
  const fecharToast = useCallback(() => {
    setToast((t) => ({ ...t, aberto: false }))
    navigate(location.pathname, { replace: true, state: null })
  }, [navigate, location.pathname])

  const totalAtivos = pacientes.filter((p) => p.status === 'ativo').length

  // ids já vinculados: não aparecem na busca do pop-up
  const idsVinculados = new Set(pacientes.map((p) => p.id))

  // busca por nome + filtro de status, juntos (a lista é pequena; o React Compiler já memoriza)
  const termo = textoParaBusca(busca.trim())
  const visiveis = pacientes.filter(
    (p) => (!termo || textoParaBusca(p.nome).includes(termo)) && (filtro === 'todos' || p.status === filtro),
  )

  // "+ Novo paciente": abre o pop-up sempre vazio
  function abrirModal() {
    setChaveModal((n) => n + 1)
    setModalAberto(true)
  }

  // pop-up "Adicionar paciente": envia o pedido de vínculo à API e fecha o pop-up.
  // Se a API recusar, o erro volta para o pop-up (ele mostra a mensagem e continua aberto).
  async function adicionarPaciente(novo) {
    await lista.adicionar(novo)
    setModalAberto(false)
    setToast({ aberto: true, tipo: 'sucesso', mensagem: 'Solicitação enviada! O paciente precisa aceitar o vínculo.' })
  }

  // ícone de anotação do cartão: abre o pop-up "Anotar — [nome]" daquele paciente
  function abrirNota(paciente) {
    setChaveNota((n) => n + 1)
    setErroNota('')
    setNotaPara(paciente)
  }

  // Aceitar / Recusar o pedido que o paciente fez
  async function responderPedido(paciente, aceitar) {
    setRespondendoId(paciente.id)
    try {
      await lista.responderPedido(paciente, aceitar)
      setToast(
        aceitar
          ? { aberto: true, tipo: 'sucesso', mensagem: `${paciente.nome} agora é seu paciente!` }
          : { aberto: true, tipo: 'erro', mensagem: 'Pedido recusado.' },
      )
    } catch (e) {
      setToast({ aberto: true, tipo: 'erro', mensagem: e.message })
    } finally {
      setRespondendoId(null)
    }
  }

  // grava a nota na API, fecha o pop-up e mostra o toast; se falhar, o erro aparece no pop-up
  async function salvarNota(dados) {
    setSalvandoNota(true)
    setErroNota('')
    try {
      await lista.salvarAnotacao(notaPara.id, dados)
      setNotaPara(null)
      setToast({ aberto: true, tipo: 'sucesso', mensagem: 'Nota adicionada!' })
    } catch (e) {
      setErroNota(e.message)
    } finally {
      setSalvandoNota(false)
    }
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* conteúdo com 850px no desktop, centralizado na área ao lado do menu (Figma) */}
      <div className="mx-auto flex w-full max-w-[898px] flex-col px-6 pt-[21px] pb-12 lg:pt-[54px]">
        {/* RF299 e RF302: título e total à esquerda, botão à direita (também no mobile) */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-[30px] text-texto">Pacientes</h1>
            <p className="mt-1 min-h-5 text-[14px] leading-5 text-secundaria">{carregando || erro ? '' : textoAtivos(totalAtivos)}</p>
          </div>
          <Button type="button" larguraAuto className={BOTAO_NOVO} onClick={abrirModal} disabled={carregando || Boolean(erro)}>
            <IconeMais tamanho={16} className="[stroke-width:1.8]" />
            Novo paciente
          </Button>
        </header>

        {/* RF300 e RF301: busca por nome e filtro na mesma linha.
            mx-px: o contorno de 1px por fora dos campos encosta na borda dos cartões */}
        <div className="mx-px mt-5 flex items-center gap-[11px]">
          <div role="search" className="min-w-0 flex-1">
            {/* mobile/tablet: lupa mais perto da borda e margem menor à direita,
                para caber "Buscar paciente..." inteiro em 403px (frame mobile) */}
            <CampoPaciente
              comLupa
              rotulo="Buscar paciente por nome"
              type="search"
              name="busca"
              placeholder="Buscar paciente..."
              className="h-[42px] gap-1 pr-1.5 pl-[9px] lg:gap-3 lg:pr-3 lg:pl-[13px]"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <FiltroPilulas rotulo="Filtrar por status" opcoes={FILTROS_STATUS} valor={filtro} onMudar={setFiltro} />
        </div>

        {/* contagem lida pelos leitores de tela a cada busca ou filtro */}
        <p aria-live="polite" className="sr-only">
          {carregando || erro
            ? ''
            : visiveis.length === 1
              ? '1 paciente encontrado'
              : `${visiveis.length} pacientes encontrados`}
        </p>

        {carregando ? (
          <p role="status" className="pt-16 text-center text-[13px] text-secundaria">
            Carregando pacientes...
          </p>
        ) : erro ? (
          // a API não respondeu: mensagem do back (ou de conexão) e nova tentativa
          <div role="alert" className="flex flex-col items-center pt-16 text-center">
            <p className="text-[15px] font-bold text-texto">Não foi possível carregar os pacientes</p>
            <p className="mt-2 text-[13px] text-secundaria">{erro}</p>
            <Button type="button" variante="contorno" larguraAuto className="mt-5" onClick={lista.recarregar}>
              Tentar novamente
            </Button>
          </div>
        ) : visiveis.length > 0 ? (
          <ul aria-label="Lista de pacientes" className="mt-[15px] flex flex-col gap-2.5">
            {visiveis.map((paciente) => (
              <ItemPaciente
                key={paciente.id}
                paciente={paciente}
                onAnotacao={abrirNota}
                onResponder={responderPedido}
                ocupado={respondendoId === paciente.id}
              />
            ))}
          </ul>
        ) : (
          // sem pacientes, ou busca/filtro sem resultado (não há frame no Figma: segue o estado vazio da tela Tarefas)
          <div className="flex flex-col items-center pt-16 text-center">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-2xl border border-borda bg-fundo-suave-2 text-[26px] shadow-[0_2px_6px_var(--color-sombra)]"
            >
              🔍
            </span>
            {pacientes.length === 0 ? (
              <>
                <p className="mt-5 text-[15px] font-bold text-texto">Você ainda não tem pacientes</p>
                <p className="mt-2 text-[13px] text-secundaria">Use o botão &quot;Novo paciente&quot; para enviar um pedido de vínculo.</p>
              </>
            ) : (
              <>
                <p className="mt-5 text-[15px] font-bold text-texto">Nenhum paciente encontrado</p>
                <p className="mt-2 text-[13px] text-secundaria">Tente buscar por outro nome ou mudar o filtro.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* RF303 e RF304 */}
      <ModalNovoPaciente
        key={chaveModal}
        aberto={modalAberto}
        token={auth?.token}
        idsVinculados={idsVinculados}
        onFechar={() => setModalAberto(false)}
        onAdicionar={adicionarPaciente}
      />

      {/* pop-up "Anotar — [nome]" aberto pelo ícone de anotação do cartão */}
      <ModalAnotacao
        key={`nota-${chaveNota}`}
        aberto={notaPara !== null}
        nomePaciente={notaPara?.nome}
        salvando={salvandoNota}
        erro={erroNota}
        onFechar={() => setNotaPara(null)}
        onSalvar={salvarNota}
      />

      {/* avisos "Nota adicionada!" e "Paciente removido." */}
      <div className={AJUSTE_TOAST}>
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
      </div>
    </div>
  )
}

export default Pacientes
