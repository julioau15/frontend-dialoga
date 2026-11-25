// ============================================================
// pages/paciente/Profissionais
// Profissionais do paciente, integrada com a API (hook useProfissionaisPaciente). Rota: /paciente/profissionais
// Frames: "Profissionais - Paciente", "Novo profissional - Paciente" (vazio, CPF encontrado e
//         "Profissional encontrado"), "Profissional adicionado - Paciente" (toasts),
//         "Excluir profissional - Paciente" e os frames "Profissional - Mobile" correspondentes.
//   - seções "Acompanhamento atual" (Ativos e Pendentes) e "Histórico" (Inativos) (RF318);
//   - cartão com nome, especialidade, status, selo "Na plataforma", "Desde" e "Próx." (RF319);
//   - "+ Novo profissional" abre o pop-up com CPF, nome, e-mail e especialidade (RF320, RF321);
//     profissional fora da plataforma entra no acompanhamento atual com o toast "Profissional
//     adicionado!"; achado pelo CPF, o vínculo é pedido na API, abre o pop-up "Profissional
//     encontrado" e ele aparece como "Pendente" até confirmar (RN100);
//   - solicitação recebida (o profissional convidou o paciente): aparece primeiro no acompanhamento
//     atual, com o selo "Solicitação recebida" e os botões "Aceitar" (vira Ativo, toast verde
//     "Solicitação aceita!") e "Recusar" (vai para o Histórico, toast vermelho "Solicitação recusada.");
//   - lixeira abre o pop-up de exclusão; ao confirmar, o vínculo vira "Inativo" (não é apagado,
//     RN101), o profissional vai para o Histórico e aparece o toast "Profissional removido do
//     acompanhamento atual." (RF326, RF327); falha da API mostra o toast vermelho;
//   - enquanto carrega: "Carregando profissionais..."; erro: mensagem e "Tentar novamente";
//     lista vazia: aviso para adicionar o primeiro profissional;
//   - clicar no cartão abre a tela do profissional (/paciente/profissionais/:id);
//   - o item "Profissionais" do menu já fica destacado pelo NavLink da Sidebar (RF331).
// Desktop (com o menu lateral, a partir de 1024px), Tablet e Mobile (403px).
// ============================================================
import { useCallback, useRef, useState } from 'react'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Toast from '../../../components/Toast'
import useProfissionaisPaciente from '../../../hooks/useProfissionaisPaciente'
import { chaveProfissional } from './components/profissionaisMemoria'
import CartaoProfissional from './components/CartaoProfissional'
import ModalExcluirProfissional from './components/ModalExcluirProfissional'
import ModalNovoProfissional from './components/ModalNovoProfissional'
import ModalProfissionalEncontrado from './components/ModalProfissionalEncontrado'
import { AJUSTE_TOAST } from './components/estilosProfissionais'
import { IconeMais } from './components/iconesProfissionais'

// botão "+ Novo profissional": 40px de altura, cantos de 12px e texto de 14px em negrito;
// nunca quebra a linha (no celular quem desce é o subtítulo)
const BOTAO_NOVO = 'h-10! shrink-0 gap-2! whitespace-nowrap rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

// título das seções: 14px seminegrito, em maiúsculas, como no Figma
const TITULO_SECAO = 'text-[14px] font-semibold uppercase leading-5 tracking-[0.02em] text-secundaria'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

function Profissionais() {
  // lista da API (e os fora da plataforma) e as ações; o hook fala com o service
  const { profissionais, ocupado, carregando, erro, recarregar, buscarPorCpf, adicionarExterno, vincular, remover, aceitar, recusar } =
    useProfissionaisPaciente()
  // pop-up aberto: null | { tipo: 'novo', chave } | { tipo: 'encontrado', profissional } | { tipo: 'excluir', profissional }
  const operacao = useRef(false)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(TOAST_FECHADO)
  const [excluindo, setExcluindo] = useState(false)
  const [respondendo, setRespondendo] = useState(null) // chave do vínculo cuja solicitação está sendo respondida

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  const fecharModal = () => setModal(null)

  // mostra o aviso (verde de sucesso, como no Figma, ou vermelho de erro)
  const avisar = (mensagem, tipo = 'sucesso') => setToast({ aberto: true, tipo, mensagem })

  // acompanhamento atual: solicitações recebidas primeiro, depois ativos e pendentes
  const naoInativos = profissionais.filter((p) => p.status !== 'inativo')
  const atuais = [...naoInativos.filter((p) => p.recebida), ...naoInativos.filter((p) => !p.recebida)]
  const historico = profissionais.filter((p) => p.status === 'inativo')

  // ids da plataforma que já estão no acompanhamento (o pop-up não deixa adicionar de novo)
  const idsVinculados = new Set(atuais.filter((p) => p.naPlataforma).map((p) => p.id))

  // profissional fora da plataforma: entra no fim do acompanhamento atual (desde o mês atual)
  async function adicionar(dados) {
    await adicionarExterno(dados) // lança erro se não conseguir salvar (o pop-up mostra)
    fecharModal()
    avisar('Profissional adicionado!')
  }

  // profissional da plataforma: pede o vínculo na API e abre o "Profissional encontrado"
  async function pedirVinculo(profissional) {
    await vincular(profissional) // lança erro com a mensagem da API (o pop-up mostra)
    setModal({ tipo: 'encontrado', profissional })
  }

  // RF327/RN101: não apaga; o profissional vai para o Histórico como "Inativo"
  async function excluir() {
    if (operacao.current) return
    operacao.current = true
    setExcluindo(true)
    try {
      await remover(modal.profissional)
      avisar('Profissional removido do acompanhamento atual.')
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      operacao.current = false
      setExcluindo(false)
      fecharModal()
    }
  }

  // responde a solicitação recebida: aceitar (vira Ativo) ou recusar (vai para o Histórico)
  async function responder(profissional, aceitou) {
    if (operacao.current) return
    operacao.current = true
    setRespondendo(chaveProfissional(profissional))
    try {
      if (aceitou) {
        await aceitar(profissional)
        avisar('Solicitação aceita!')
      } else {
        await recusar(profissional)
        avisar('Solicitação recusada.', 'erro') // vermelho, como o "Solicitação recusada." dos Relatórios
      }
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      operacao.current = false
      setRespondendo(null)
    }
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave bg-pagina">
      {/* conteúdo com 720px no desktop, centralizado na área ao lado do menu (Figma) */}
      <div className="mx-auto flex w-full max-w-[770px] flex-col px-6 pt-[21px] pb-12 lg:pt-[78px]">
        {/* título e subtítulo à esquerda, botão à direita (também no mobile) */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-[30px] text-texto">Profissionais</h1>
            <p className="mt-1 text-[14px] leading-5 text-secundaria lg:mt-0.5">Seus acompanhantes de saúde</p>
          </div>
          <Button type="button" larguraAuto className={BOTAO_NOVO} disabled={ocupado || carregando || !!erro || respondendo !== null || excluindo} onClick={() => setModal({ tipo: 'novo', chave: Date.now() })}>
            <IconeMais tamanho={16} />
            Novo profissional
          </Button>
        </header>

        {/* carregando, erro ao carregar e lista vazia (o Figma não tem esses estados) */}
        {carregando && (
          <p role="status" className="mt-8 text-center text-[14px] text-secundaria">
            Carregando profissionais...
          </p>
        )}
        {!carregando && erro && (
          <Card className="mt-6 flex flex-col items-center gap-3 px-5 py-8 text-center">
            <p role="alert" className="text-[14px] text-texto">
              {erro}
            </p>
            <Button type="button" variante="suave" larguraAuto onClick={recarregar}>
              Tentar novamente
            </Button>
          </Card>
        )}
        {!carregando && !erro && profissionais.length === 0 && (
          <Card className="mt-6 px-5 py-8 text-center">
            <p className="text-[14px] font-semibold text-texto">Você ainda não tem profissionais.</p>
            <p className="mt-1 text-[13px] text-secundaria">Use "Novo profissional" para adicionar quem acompanha você.</p>
          </Card>
        )}

        {/* RF318: acompanhamento atual (some quando não há ninguém, o Figma não tem estado vazio) */}
        {!carregando && !erro && atuais.length > 0 && (
          <section aria-labelledby="titulo-atuais" className="mt-6 lg:mt-[25px]">
            <h2 id="titulo-atuais" className={TITULO_SECAO}>
              Acompanhamento atual
            </h2>
            <div className="mt-3 flex flex-col gap-2.5 lg:mt-[13px] lg:gap-3.5">
              {atuais.map((p) => (
                <CartaoProfissional
                  key={chaveProfissional(p)}
                  profissional={p}
                  onExcluir={(prof) => setModal({ tipo: 'excluir', profissional: prof })}
                  onAceitar={(prof) => responder(prof, true)}
                  onRecusar={(prof) => responder(prof, false)}
                  respondendo={respondendo === chaveProfissional(p)}
                  desabilitado={ocupado || respondendo !== null || excluindo}
                />
              ))}
            </div>
          </section>
        )}

        {/* RF318: histórico (inativos, sem lixeira) */}
        {!carregando && !erro && historico.length > 0 && (
          <section aria-labelledby="titulo-historico" className="mt-6 lg:mt-[25px]">
            <h2 id="titulo-historico" className={TITULO_SECAO}>
              Histórico
            </h2>
            <div className="mt-3 flex flex-col gap-2.5 lg:mt-[13px] lg:gap-3.5">
              {historico.map((p) => (
                <CartaoProfissional key={chaveProfissional(p)} profissional={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {modal?.tipo === 'novo' && (
        <ModalNovoProfissional
          key={modal.chave}
          onFechar={fecharModal}
          onAdicionar={adicionar}
          onEncontrado={pedirVinculo}
          onBuscarCpf={buscarPorCpf}
          idsVinculados={idsVinculados}
        />
      )}
      {modal?.tipo === 'encontrado' && <ModalProfissionalEncontrado profissional={modal.profissional} onFechar={fecharModal} />}
      {modal?.tipo === 'excluir' && (
        <ModalExcluirProfissional
          profissional={modal.profissional}
          excluindo={excluindo}
          onFechar={() => !excluindo && fecharModal()}
          onConfirmar={excluir}
        />
      )}

      {/* toasts "Profissional adicionado!" e "Profissional removido do acompanhamento atual." */}
      <div className={AJUSTE_TOAST}>
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
      </div>
    </div>
  )
}

export default Profissionais
