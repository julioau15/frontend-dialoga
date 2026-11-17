// ============================================================
// ModalAnotacao
// Pop-up de anotação privada do profissional (RF221, RF222, RF310, RF311), como no Figma:
//   - "Nova anotação"    -> aberto pelo "+ Nova nota" do perfil do paciente;
//   - "Anotar — [nome]"  -> aberto pelo ícone de anotação do cartão na lista de Pacientes;
//   - "Editar anotação"  -> aberto pelo lápis da nota, já com o título e o conteúdo.
// Campos Título e Conteúdo e os botões Cancelar e "Salvar nota".
// O Figma não mostra erro de campo vazio: sem título ou sem conteúdo, o clique em
// "Salvar nota" só leva o foco ao primeiro campo vazio.
// A página troca a "key" deste componente a cada abertura, assim os campos
// sempre começam com o valor certo (sem precisar de useEffect).
// Props:
//   aberto       -> mostra ou esconde o pop-up
//   anotacao     -> nota que está sendo editada, ou null para uma nota nova
//   nomePaciente -> quando informado (lista de Pacientes), o título vira "Anotar — [nome]"
//   onFechar     -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   salvando     -> true enquanto a API grava a nota (desativa "Salvar nota", evita clique duplo)
//   erro         -> mensagem da API quando não deu para salvar (aparece embaixo do conteúdo)
//   onSalvar     -> ({ id?, titulo, conteudo }) => void, chamado em "Salvar nota"
// ============================================================
import { useId, useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { AJUSTE_MODAL_ANOTACAO, BOTAO_CANCELAR, BOTAO_CONFIRMAR } from '../../PerfilPaciente/components/estilosPerfil'
import CampoPaciente from './CampoPaciente'

const LIMITE_TITULO = 80
const LIMITE_CONTEUDO = 1000

// rótulo dos campos: 14px seminegrito, como no Figma
const ROTULO = 'mb-[5px] text-[14px] font-semibold leading-5 text-texto'

export default function ModalAnotacao({ aberto, anotacao = null, nomePaciente, salvando = false, erro = '', onFechar, onSalvar }) {
  const idFormulario = useId() // ligo o botão "Salvar nota" (que fica no rodapé) ao formulário
  const idTitulo = useId()
  const idConteudo = useId()
  const refTitulo = useRef(null)
  const refConteudo = useRef(null)
  const [titulo, setTitulo] = useState(anotacao?.titulo ?? '')
  const [conteudo, setConteudo] = useState(anotacao?.conteudo ?? '')

  let tituloModal = 'Nova anotação'
  if (anotacao) tituloModal = 'Editar anotação'
  else if (nomePaciente) tituloModal = `Anotar — ${nomePaciente}`

  // entrega a nota para a página; campo vazio só recebe o foco
  function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    if (!titulo.trim()) return refTitulo.current?.focus()
    if (!conteudo.trim()) return refConteudo.current?.focus()
    onSalvar({ id: anotacao?.id, titulo: titulo.trim(), conteudo: conteudo.trim() })
  }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CANCELAR} onClick={onFechar}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto carregando={salvando} className={BOTAO_CONFIRMAR}>
        {salvando ? 'Salvando...' : 'Salvar nota'}
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL_ANOTACAO}>
      <Modal aberto={aberto} titulo={tituloModal} onFechar={onFechar} comDivisores rodape={rodape} largura="max-w-[448px]">
        {/* -mt-1 e mb-[3px]: o Modal tem 24px de respiro; no Figma são 20px em cima e 27px embaixo */}
        <form id={idFormulario} onSubmit={enviar} noValidate className="-mt-1 mb-[3px] flex flex-col">
          <label htmlFor={idTitulo} className={ROTULO}>
            Título
          </label>
          <CampoPaciente
            id={idTitulo}
            name="titulo"
            placeholder="Título da anotação"
            maxLength={LIMITE_TITULO}
            className="h-[46px] pr-4 pl-[17px]"
            inputRef={refTitulo}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label htmlFor={idConteudo} className={`mt-[22px] ${ROTULO}`}>
            Conteúdo
          </label>
          {/* mesmo visual do CampoPaciente: contorno lilás de 1px por fora e cantos de 12px */}
          <textarea
            id={idConteudo}
            ref={refConteudo}
            name="conteudo"
            placeholder="Escreva sua anotação..."
            maxLength={LIMITE_CONTEUDO}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="h-[126px] w-full resize-none rounded-xl border-0 bg-branco px-[17px] py-[13px] text-[14px] leading-5 text-texto shadow-[0_0_0_1px_var(--color-borda)] outline-0 transition-shadow duration-200 placeholder:text-secundaria focus:shadow-[0_0_0_1px_var(--color-primaria),0_0_0_4px_var(--color-primaria-alfa-20)]"
          />
          {erro && (
            <p role="alert" className="mt-3 text-[12px] leading-4 font-semibold text-erro">
              {erro}
            </p>
          )}
        </form>
      </Modal>
    </div>
  )
}
