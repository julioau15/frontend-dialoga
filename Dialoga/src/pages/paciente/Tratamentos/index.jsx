// ============================================================
// pages/paciente/Tratamentos
// Tratamentos do paciente. Só visual: dados fixos (mock), sem API. Rota: /paciente/tratamentos
// Frames: "Tratamento- Paciente", "Novo tratamento", "Editar tratamento", "Excluir tratamento",
//         "Tratamento adicionado", "Tratamento editado", "Tratamento Excluido"
//         e os frames "Tratamento - Mobile" correspondentes.
//   - título com a contagem ("3 tratamentos cadastrados") e "+ Novo tratamento" (RF332, RF336);
//   - cartões com nome, dosagem, frequência, horários e "Lembrete ativo" (RF333–RF335);
//   - lápis (editar) e lixeira (excluir) em cada cartão (RF337, RF338);
//   - pop-ups Novo, Editar e Excluir tratamento;
//   - toasts: verde ao incluir ("Tratamento adicionado!") e editar ("Tratamento atualizado com
//     sucesso!"), vermelho ao remover ("Tratamento removido.") (RNF123).
// "Adicionar outro" mantém o pop-up aberto e mostra o toast por cima dele.
// Desktop (com o menu lateral, a partir de 1024px), Tablet e Mobile (403px).
// ============================================================
import { useCallback, useState } from 'react'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import CartaoTratamento from './components/CartaoTratamento'
import ModalExcluirTratamento from './components/ModalExcluirTratamento'
import ModalTratamento from './components/ModalTratamento'
import { AJUSTE_TOAST } from './components/estilosTratamentos'
import { IconeMais } from './components/iconesTratamentos'
import { TRATAMENTOS_MOCK, textoContagem } from './components/tratamentosMock'

// botão "+ Novo tratamento": 40px de altura, cantos de 12px e texto de 14px em negrito;
// nunca quebra a linha (em celulares estreitos, quem desce é a contagem embaixo do título)
const BOTAO_NOVO = 'h-10! shrink-0 gap-2! whitespace-nowrap rounded-xl! px-4! text-[14px]! font-bold! shadow-sm'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

function Tratamentos() {
  const [tratamentos, setTratamentos] = useState(TRATAMENTOS_MOCK)
  // pop-up aberto: null | { tipo: 'novo' } | { tipo: 'editar', tratamento } | { tipo: 'excluir', tratamento }
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(TOAST_FECHADO)

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  const fecharModal = () => setModal(null)

  // mostra o aviso (tipo 'sucesso' = verde, 'erro' = vermelho)
  const avisar = (tipo, mensagem) => setToast({ aberto: true, tipo, mensagem })

  // salva o que veio do pop-up: atualiza (editar) ou inclui no fim da lista (novo)
  function salvar(dados, { continuar }) {
    if (modal?.tipo === 'editar') {
      const id = modal.tratamento.id
      setTratamentos((lista) => lista.map((t) => (t.id === id ? { ...t, ...dados } : t)))
      fecharModal()
      avisar('sucesso', 'Tratamento atualizado com sucesso!')
      return
    }
    setTratamentos((lista) => [...lista, { id: Math.max(0, ...lista.map((t) => t.id)) + 1, ...dados }])
    if (!continuar) fecharModal() // "Adicionar outro" mantém o pop-up aberto
    avisar('sucesso', 'Tratamento adicionado!')
  }

  // remove o tratamento confirmado no pop-up "Excluir tratamento"
  function excluir() {
    const id = modal.tratamento.id
    setTratamentos((lista) => lista.filter((t) => t.id !== id))
    fecharModal()
    avisar('erro', 'Tratamento removido.')
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
            <p className="mt-1 text-[14px] leading-5 text-secundaria">{textoContagem(tratamentos.length)}</p>
          </div>
          <Button type="button" larguraAuto className={BOTAO_NOVO} onClick={() => setModal({ tipo: 'novo' })}>
            <IconeMais tamanho={16} />
            Novo tratamento
          </Button>
        </header>

        {tratamentos.length > 0 && (
          <div className="mt-6 flex flex-col gap-2.5 lg:gap-3.5">
            {tratamentos.map((tratamento) => (
              <CartaoTratamento
                key={tratamento.id}
                tratamento={tratamento}
                onEditar={(t) => setModal({ tipo: 'editar', tratamento: t })}
                onExcluir={(t) => setModal({ tipo: 'excluir', tratamento: t })}
              />
            ))}
          </div>
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
        />
      )}
      {modal?.tipo === 'excluir' && <ModalExcluirTratamento onFechar={fecharModal} onConfirmar={excluir} />}

      {/* toasts da página (com o pop-up de tratamento aberto, o toast fica dentro dele) */}
      {!formularioAberto && (
        <div className={AJUSTE_TOAST}>
          <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
        </div>
      )}
    </div>
  )
}

export default Tratamentos
