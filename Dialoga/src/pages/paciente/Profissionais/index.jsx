// ============================================================
// pages/paciente/Profissionais
// Profissionais do paciente. Só visual: dados fixos (mock), sem API. Rota: /paciente/profissionais
// Frames: "Profissionais - Paciente", "Novo profissional - Paciente" (vazio, CPF encontrado e
//         "Profissional encontrado"), "Profissional adicionado - Paciente" (toasts),
//         "Excluir profissional - Paciente" e os frames "Profissional - Mobile" correspondentes.
//   - seções "Acompanhamento atual" (Ativos) e "Histórico" (Inativos) (RF318);
//   - cartão com nome, especialidade, status, selo "Na plataforma", "Desde" e "Próx." (RF319);
//   - "+ Novo profissional" abre o pop-up com CPF, nome, e-mail e especialidade (RF320, RF321);
//     profissional fora da plataforma entra no acompanhamento atual com o toast "Profissional
//     adicionado!"; achado pelo CPF, abre o pop-up "Profissional encontrado" e só entra na
//     lista depois da confirmação dele (sem toast);
//   - lixeira abre o pop-up de exclusão; ao confirmar, o profissional vai para o fim do Histórico
//     como "Inativo" e aparece o toast "Profissional removido do acompanhamento atual." (RF326, RF327);
//   - clicar no cartão abre a tela do profissional (/paciente/profissionais/:id);
//   - o item "Profissionais" do menu já fica destacado pelo NavLink da Sidebar (RF331).
// Desktop (com o menu lateral, a partir de 1024px), Tablet e Mobile (403px).
// ============================================================
import { useCallback, useState } from 'react'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import CartaoProfissional from './components/CartaoProfissional'
import ModalExcluirProfissional from './components/ModalExcluirProfissional'
import ModalNovoProfissional from './components/ModalNovoProfissional'
import ModalProfissionalEncontrado from './components/ModalProfissionalEncontrado'
import { AJUSTE_TOAST } from './components/estilosProfissionais'
import { IconeMais } from './components/iconesProfissionais'
import { guardarProfissional, inativarProfissional, listarProfissionais } from './components/profissionaisMemoria'
import { mesAtual } from './components/profissionaisMock'

// botão "+ Novo profissional": 40px de altura, cantos de 12px e texto de 14px em negrito;
// nunca quebra a linha (no celular quem desce é o subtítulo)
const BOTAO_NOVO = 'h-10! shrink-0 gap-2! whitespace-nowrap rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

// título das seções: 14px seminegrito, em maiúsculas, como no Figma
const TITULO_SECAO = 'text-[14px] font-semibold uppercase leading-5 tracking-[0.02em] text-secundaria'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

function Profissionais() {
  // lista guardada na memória (compartilhada com a tela do profissional)
  const [profissionais, setProfissionais] = useState(listarProfissionais)
  // pop-up aberto: null | { tipo: 'novo', chave } | { tipo: 'encontrado', profissional } | { tipo: 'excluir', profissional }
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(TOAST_FECHADO)

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  const fecharModal = () => setModal(null)

  // mostra o aviso verde (os dois toasts desta tela são verdes no Figma)
  const avisar = (mensagem) => setToast({ aberto: true, tipo: 'sucesso', mensagem })

  const atuais = profissionais.filter((p) => p.status === 'ativo')
  const historico = profissionais.filter((p) => p.status === 'inativo')

  // profissional fora da plataforma: entra no fim do acompanhamento atual (desde o mês atual)
  function adicionar(dados) {
    guardarProfissional({
      id: Math.max(0, ...profissionais.map((p) => p.id)) + 1,
      nome: dados.nome,
      especialidade: dados.especialidade,
      status: 'ativo',
      naPlataforma: false,
      desde: mesAtual(),
      proximaConsulta: null,
    })
    setProfissionais(listarProfissionais())
    fecharModal()
    avisar('Profissional adicionado!')
  }

  // RF327: não apaga; o profissional vai para o fim do Histórico como "Inativo" (sem próxima consulta)
  function excluir() {
    inativarProfissional(modal.profissional.id)
    setProfissionais(listarProfissionais())
    fecharModal()
    avisar('Profissional removido do acompanhamento atual.')
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* conteúdo com 720px no desktop, centralizado na área ao lado do menu (Figma) */}
      <div className="mx-auto flex w-full max-w-[770px] flex-col px-6 pt-[21px] pb-12 lg:pt-[78px]">
        {/* título e subtítulo à esquerda, botão à direita (também no mobile) */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-[30px] text-texto">Profissionais</h1>
            <p className="mt-1 text-[14px] leading-5 text-secundaria lg:mt-0.5">Seus acompanhantes de saúde</p>
          </div>
          <Button type="button" larguraAuto className={BOTAO_NOVO} onClick={() => setModal({ tipo: 'novo', chave: Date.now() })}>
            <IconeMais tamanho={16} />
            Novo profissional
          </Button>
        </header>

        {/* RF318: acompanhamento atual (some quando não há ninguém, o Figma não tem estado vazio) */}
        {atuais.length > 0 && (
          <section aria-labelledby="titulo-atuais" className="mt-6 lg:mt-[25px]">
            <h2 id="titulo-atuais" className={TITULO_SECAO}>
              Acompanhamento atual
            </h2>
            <div className="mt-3 flex flex-col gap-2.5 lg:mt-[13px] lg:gap-3.5">
              {atuais.map((p) => (
                <CartaoProfissional key={p.id} profissional={p} onExcluir={(prof) => setModal({ tipo: 'excluir', profissional: prof })} />
              ))}
            </div>
          </section>
        )}

        {/* RF318: histórico (inativos, sem lixeira) */}
        {historico.length > 0 && (
          <section aria-labelledby="titulo-historico" className="mt-6 lg:mt-[25px]">
            <h2 id="titulo-historico" className={TITULO_SECAO}>
              Histórico
            </h2>
            <div className="mt-3 flex flex-col gap-2.5 lg:mt-[13px] lg:gap-3.5">
              {historico.map((p) => (
                <CartaoProfissional key={p.id} profissional={p} />
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
          onEncontrado={(dados) => setModal({ tipo: 'encontrado', profissional: dados })}
        />
      )}
      {modal?.tipo === 'encontrado' && <ModalProfissionalEncontrado profissional={modal.profissional} onFechar={fecharModal} />}
      {modal?.tipo === 'excluir' && (
        <ModalExcluirProfissional profissional={modal.profissional} onFechar={fecharModal} onConfirmar={excluir} />
      )}

      {/* toasts "Profissional adicionado!" e "Profissional removido do acompanhamento atual." */}
      <div className={AJUSTE_TOAST}>
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
      </div>
    </div>
  )
}

export default Profissionais
