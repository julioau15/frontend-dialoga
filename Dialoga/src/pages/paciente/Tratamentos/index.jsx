// ============================================================
// pages/paciente/Tratamentos
// Tratamentos do paciente, integrados à API autenticada. Rota: /paciente/tratamentos
// Frames: "Tratamento- Paciente", "Novo tratamento", "Editar tratamento", "Excluir tratamento",
//         "Tratamento adicionado", "Tratamento editado", "Tratamento Excluido"
//         e os frames "Tratamento - Mobile" correspondentes.
//   - título com a contagem ("3 tratamentos cadastrados") e "+ Novo tratamento" (RF332, RF336);
//   - cartões com nome, dosagem, frequência, horários e "Lembrete ativo" (RF333–RF335);
//   - lápis (editar) e lixeira (excluir) em cada cartão (RF337, RF338);
//   - pop-ups Novo, Editar e Excluir tratamento;
//   - toasts: verde ao incluir ("Tratamento adicionado!") e editar ("Tratamento atualizado com
//     sucesso!"), vermelho ao remover ("Tratamento removido.") (RNF123).
//   - doses de hoje em cada horário, com o botão "Tomar" (GET /pacientes/me/doses e
//     POST /pacientes/me/doses/:idHorario/confirmar), atualizadas a cada minuto;
//   - aviso com orientações e atalho "Adicionar primeiro tratamento" quando a lista está vazia.
// "Adicionar outro" mantém o pop-up aberto e mostra o toast por cima dele.
// Desktop (com o menu lateral, a partir de 1024px), Tablet e Mobile (403px).
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  confirmarDoseRequest,
  criarTratamentoRequest,
  editarTratamentoRequest,
  excluirTratamentoRequest,
  listarDosesDoDiaRequest,
  listarTratamentosRequest,
} from '../../../services/tratamentoService'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import CartaoTratamento from './components/CartaoTratamento'
import EstadoVazioTratamentos from './components/EstadoVazioTratamentos'
import ModalExcluirTratamento from './components/ModalExcluirTratamento'
import ModalTratamento from './components/ModalTratamento'
import { AJUSTE_TOAST } from './components/estilosTratamentos'
import { IconeMais } from './components/iconesTratamentos'
import { indexarDoses, textoContagem, tratamentoConfere } from '../../../utils/tratamentos'

// botão "+ Novo tratamento": 40px de altura, cantos de 12px e texto de 14px em negrito;
// nunca quebra a linha (em celulares estreitos, quem desce é a contagem embaixo do título)
const BOTAO_NOVO = 'h-10! shrink-0 gap-2! whitespace-nowrap rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

const ERRO_CONFERENCIA = 'A operação foi aceita, mas não foi possível confirmar os dados. Atualize a lista antes de tentar novamente.'

// a situação da dose muda com o relógio (futura -> pendente -> atrasada): relê a cada minuto
const INTERVALO_DOSES_MS = 60 * 1000

// Mantém lista, modais e requisições vinculados à credencial desta sessão.
function ConteudoTratamentos({ token }) {
  const [tentativa, setTentativa] = useState(0)
  const [remoto, setRemoto] = useState({
    token: null, tentativa: -1, tratamentos: [], doses: [], carregado: false,
    erro: '', processando: false, bloqueado: false, erroOperacao: '', confirmandoDose: null,
  })
  const escopoRef = useRef(null)
  // pop-up aberto: null | { tipo: 'novo' } | { tipo: 'editar', tratamento } | { tipo: 'excluir', tratamento }
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(TOAST_FECHADO)

  useEffect(() => {
    const controle = new AbortController()
    const escopo = { token, tentativa, controle, ativo: true, ocupado: false, carregado: false, bloqueado: false, versaoDoses: 0 }
    escopoRef.current = escopo

    // A listagem é a única fonte de dados, inclusive depois de uma reconciliação.
    // As doses vêm junto; se só elas falharem, a lista aparece sem os botões de confirmação.
    async function carregar() {
      try {
        const [lista, doses] = await Promise.all([
          listarTratamentosRequest(token, controle.signal),
          listarDosesDoDiaRequest(token, controle.signal).catch((erroDoses) => {
            if (controle.signal.aborted) throw erroDoses
            return []
          }),
        ])
        if (!escopo.ativo) return
        escopo.carregado = true
        setRemoto({ token, tentativa, tratamentos: lista, doses, carregado: true,
          erro: '', processando: false, bloqueado: false, erroOperacao: '', confirmandoDose: null })
      } catch (erro) {
        if (!escopo.ativo || controle.signal.aborted) return
        setRemoto({ token, tentativa, tratamentos: [], doses: [], carregado: true,
          erro: erro.message, processando: false, bloqueado: true, erroOperacao: erro.message, confirmandoDose: null })
      }
    }

    // Relê as doses em segundo plano (sem "carregando"); ignora a resposta se uma
    // confirmação começou enquanto a leitura estava em andamento.
    async function atualizarDosesPeriodicamente() {
      if (!escopo.ativo || !escopo.carregado || escopo.ocupado || document.visibilityState !== 'visible') return
      const versao = escopo.versaoDoses
      try {
        const doses = await listarDosesDoDiaRequest(token, controle.signal)
        if (!escopo.ativo || escopo.ocupado || escopo.versaoDoses !== versao) return
        setRemoto((anterior) => anterior.token === token && anterior.tentativa === tentativa
          ? { ...anterior, doses } : anterior)
      } catch {
        // falha silenciosa: mantém as doses que já estão na tela
      }
    }

    carregar()
    const intervalo = setInterval(atualizarDosesPeriodicamente, INTERVALO_DOSES_MS)
    return () => {
      escopo.ativo = false
      controle.abort()
      clearInterval(intervalo)
    }
  }, [token, tentativa])

  const atual = remoto.token === token && remoto.tentativa === tentativa
  const tratamentos = atual ? remoto.tratamentos : []
  const carregando = !atual || !remoto.carregado
  const erro = atual ? remoto.erro : ''

  // vindo do Dashboard (clique num tratamento): rola até o cartão dele, que fica em destaque
  const idDestacado = useLocation().state?.destacarTratamento ?? null
  useEffect(() => {
    if (!idDestacado || carregando) return
    document.getElementById(`tratamento-${idDestacado}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [idDestacado, carregando])
  const processando = atual && remoto.processando
  const bloqueado = carregando || !!erro || (atual && remoto.bloqueado)
  const erroOperacao = atual ? remoto.erroOperacao : ''
  const doses = atual ? remoto.doses : []
  const confirmandoDose = atual ? remoto.confirmandoDose : null
  // índice para cada cartão achar a dose de hoje de cada horário
  const indiceDoses = useMemo(() => indexarDoses(doses), [doses])

  // Só altera o estado se a operação ainda pertence à sessão e à carga atuais.
  function atualizar(escopo, transformar) {
    if (!escopo.ativo || escopoRef.current !== escopo) return
    setRemoto((anterior) => anterior.token === escopo.token && anterior.tentativa === escopo.tentativa
      ? transformar(anterior) : anterior)
  }

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // Impede novo envio antes mesmo do render que exibe o estado de carregamento.
  const recarregar = useCallback(() => {
    const escopo = escopoRef.current
    if (escopo?.ocupado) return
    if (escopo) escopo.carregado = false
    setTentativa((valor) => valor + 1)
  }, [])

  // O formulário pode ser fechado após o envio, inclusive se a conferência falhou.
  function fecharModal() {
    if (escopoRef.current?.ocupado) return
    setModal(null)
  }

  // Não oferece mutações durante carga, falha ou reconciliação pendente.
  function abrirModal(proximo) {
    const escopo = escopoRef.current
    if (!escopo?.ativo || !escopo.carregado || escopo.ocupado || escopo.bloqueado) return
    atualizar(escopo, (anterior) => ({ ...anterior, erroOperacao: '' }))
    setToast(TOAST_FECHADO)
    setModal(proximo)
  }

  // mostra o aviso (tipo 'sucesso' = verde, 'erro' = vermelho)
  const avisar = (tipo, mensagem) => setToast({ aberto: true, tipo, mensagem })

  // Relê as doses de hoje sem bloquear a tela; devolve a lista nova ou null se falhar.
  async function atualizarDoses(escopo) {
    try {
      const novas = await listarDosesDoDiaRequest(token, escopo.controle.signal)
      atualizar(escopo, (anterior) => ({ ...anterior, doses: novas }))
      return novas
    } catch {
      return null
    }
  }

  // Confirma a dose de um horário e só mostra o sucesso depois de reler as doses do dia.
  async function confirmarDose(dose) {
    const escopo = escopoRef.current
    if (!escopo?.ativo || !escopo.carregado || escopo.ocupado || escopo.bloqueado || !dose?.podeConfirmar) return
    escopo.ocupado = true
    escopo.versaoDoses += 1
    atualizar(escopo, (anterior) => ({ ...anterior, confirmandoDose: dose.idHorario }))
    setToast(TOAST_FECHADO)
    try {
      try {
        await confirmarDoseRequest(token, dose.idHorario)
      } catch (erroConfirmacao) {
        if (!escopo.ativo) return
        avisar('erro', erroConfirmacao.message || 'Não foi possível registrar a dose.')
        await atualizarDoses(escopo)
        return
      }
      if (!escopo.ativo) return

      const novas = await atualizarDoses(escopo)
      if (!escopo.ativo) return
      const confirmada = novas?.find((item) => item.idHorario === dose.idHorario)
      if (confirmada?.status === 'tomada') avisar('sucesso', 'Dose registrada!')
      else avisar('erro', 'A dose foi enviada, mas não foi possível conferir o registro. Atualize a página.')
    } finally {
      escopo.ocupado = false
      atualizar(escopo, (anterior) => ({ ...anterior, confirmandoDose: null }))
    }
  }

  // Separa falha da mutação de falha da leitura posterior; nunca repete uma gravação.
  async function executarMutacao(enviar, conferir, aoConfirmar) {
    const escopo = escopoRef.current
    if (!escopo?.ativo || !escopo.carregado || escopo.ocupado || escopo.bloqueado) return false
    escopo.ocupado = true
    atualizar(escopo, (anterior) => ({ ...anterior, processando: true, erroOperacao: '' }))
    setToast(TOAST_FECHADO)
    try {
      let resultado
      try {
        resultado = await enviar()
      } catch (erroMutacao) {
        if (!escopo.ativo) return false
        escopo.bloqueado = !!erroMutacao.resultadoIncerto
        atualizar(escopo, (anterior) => ({ ...anterior, bloqueado: escopo.bloqueado,
          erroOperacao: erroMutacao.message || 'Não foi possível concluir a operação.' }))
        return false
      }
      if (!escopo.ativo) return false

      let lista
      try {
        lista = await listarTratamentosRequest(token, escopo.controle.signal)
        if (!escopo.ativo) return false
        if (!conferir(lista, resultado)) throw new Error('Dados divergentes na conferência.')
      } catch {
        if (!escopo.ativo) return false
        escopo.bloqueado = true
        atualizar(escopo, (anterior) => ({ ...anterior, bloqueado: true, erroOperacao: ERRO_CONFERENCIA }))
        return false
      }
      atualizar(escopo, (anterior) => ({ ...anterior, tratamentos: lista, erroOperacao: '' }))
      // horários podem ter mudado: relê as doses de hoje (falha aqui não desfaz a operação)
      await atualizarDoses(escopo)
      aoConfirmar()
      return true
    } finally {
      escopo.ocupado = false
      atualizar(escopo, (anterior) => ({ ...anterior, processando: false }))
    }
  }

  // Salva o que veio do pop-up e só confirma a inclusão/edição após reler todos os campos.
  async function salvar(dados, { continuar }) {
    if (!['novo', 'editar'].includes(modal?.tipo)) return false
    const editando = modal.tipo === 'editar'
    const id = editando ? modal.tratamento.id : null
    return executarMutacao(
      async () => {
        if (id === null) return criarTratamentoRequest(token, dados)
        await editarTratamentoRequest(token, id, dados)
        return id
      },
      (lista, idSalvo) => tratamentoConfere(lista.find((item) => item.id === idSalvo), dados),
      () => {
        if (editando || !continuar) setModal(null)
        avisar('sucesso', editando ? 'Tratamento atualizado com sucesso!' : 'Tratamento adicionado!')
      },
    )
  }

  // Remove o tratamento confirmado no pop-up e exige sua ausência na nova listagem.
  async function excluir() {
    if (modal?.tipo !== 'excluir') return false
    const id = modal.tratamento.id
    return executarMutacao(
      () => excluirTratamentoRequest(token, id),
      (lista) => !lista.some((item) => item.id === id),
      () => {
        setModal(null)
        avisar('erro', 'Tratamento removido.')
      },
    )
  }

  // com o pop-up de tratamento aberto, o toast vai para dentro dele (aparece por cima do fundo escuro)
  const formularioAberto = modal?.tipo === 'novo' || modal?.tipo === 'editar'

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* conteúdo com 720px no desktop, centralizado na área ao lado do menu (Figma) */}
      <div className="mx-auto flex w-full max-w-[770px] flex-col px-6 pt-[22px] pb-12 lg:pt-[81px]">
        {/* RF332 e RF336: título e contagem à esquerda, botão à direita (também no mobile) */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-[30px] text-texto">Tratamentos</h1>
            <p className="mt-1 text-[14px] leading-5 text-secundaria">{carregando ? 'Carregando tratamentos...' : erro ? 'Não foi possível carregar os tratamentos' : textoContagem(tratamentos.length)}</p>
          </div>
          <Button type="button" larguraAuto className={BOTAO_NOVO} disabled={processando || bloqueado} onClick={() => abrirModal({ tipo: 'novo' })}>
            <IconeMais tamanho={16} />
            Novo tratamento
          </Button>
        </header>

        {carregando && <p role="status" className="mt-6 text-[14px] text-secundaria">Carregando tratamentos...</p>}
        {!carregando && (erro || remoto.bloqueado) && (
          <div role="alert" className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-4">
            <p className="text-[14px] text-erro">{erro || erroOperacao}</p>
            <Button type="button" variante="suave" larguraAuto disabled={processando} onClick={recarregar}>Tentar novamente</Button>
          </div>
        )}
        {/* lista vazia: orientações e atalho para cadastrar o primeiro tratamento */}
        {!carregando && !erro && !remoto.bloqueado && tratamentos.length === 0 && (
          <EstadoVazioTratamentos
            desabilitado={processando || bloqueado}
            onAdicionar={() => abrirModal({ tipo: 'novo' })}
          />
        )}
        {!carregando && !erro && tratamentos.length > 0 && (
          <fieldset disabled={processando || bloqueado} className="mt-6 flex min-w-0 flex-col gap-2.5 lg:gap-3.5">
            {tratamentos.map((tratamento) => (
              // vindo do Dashboard: o tratamento clicado fica em destaque (e a tela rola até ele)
              <div
                key={tratamento.id}
                id={`tratamento-${tratamento.id}`}
                className={String(tratamento.id) === String(idDestacado) ? 'rounded-2xl ring-2 ring-primaria ring-offset-2 ring-offset-fundo-suave' : ''}
              >
                <CartaoTratamento
                  tratamento={tratamento}
                  indiceDoses={indiceDoses}
                  confirmandoDose={confirmandoDose}
                  onConfirmarDose={confirmarDose}
                  onEditar={(t) => abrirModal({ tipo: 'editar', tratamento: t })}
                  onExcluir={(t) => abrirModal({ tipo: 'excluir', tratamento: t })}
                />
              </div>
            ))}
          </fieldset>
        )}
      </div>

      {formularioAberto && (
        <ModalTratamento
          key={modal.tipo === 'editar' ? `editar-${modal.tratamento.id}` : 'novo'}
          modo={modal.tipo}
          tratamento={modal.tratamento}
          toast={toast}
          onFecharToast={fecharToast}
          onFechar={fecharModal}
          onSalvar={salvar}
          processando={processando}
          bloqueado={bloqueado}
          erroOperacao={erroOperacao}
          onRecarregar={recarregar}
        />
      )}
      {modal?.tipo === 'excluir' && <ModalExcluirTratamento onFechar={fecharModal} onConfirmar={excluir} processando={processando}
          bloqueado={bloqueado} erroOperacao={erroOperacao} onRecarregar={recarregar} />}

      {/* toasts da página (com o pop-up de tratamento aberto, o toast fica dentro dele) */}
      {!formularioAberto && (
        <div className={AJUSTE_TOAST}>
          <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
        </div>
      )}
    </div>
  )
}

// Reinicia também os formulários e avisos ao trocar a credencial autenticada.
export default function Tratamentos() {
  const { auth } = useAuth()
  return <ConteudoTratamentos key={auth?.token ?? 'sem-sessao'} token={auth?.token} />
}
