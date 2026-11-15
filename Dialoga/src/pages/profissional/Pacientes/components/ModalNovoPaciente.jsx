// ============================================================
// ModalNovoPaciente
// Pop-up "Adicionar paciente" (RF303 e RF304), só visual (sem API).
// Layout do Figma ("Novo paciente - Profissional" e frame mobile):
//   - "Buscar paciente cadastrado na plataforma": campo por nome e campo por e-mail;
//   - "Ou cadastrar pelo nome (externo)": nome completo + "Para organização interna e uso na agenda.";
//   - rodapé com "Cancelar" e "Adicionar".
// O Figma não tem o estado com resultados; a busca funciona como um dropdown (BuscaPlataforma):
//   - ao escrever no nome ou no e-mail, a lista abre colada embaixo daquele campo, por cima
//     do resto do pop-up, com os pacientes da plataforma que combinam (os já vinculados não aparecem);
//   - escolher um paciente preenche os dois campos (nome e e-mail) e mostra ✓ no campo;
//     escrever de novo em qualquer um deles desfaz a escolha;
//   - escolher um paciente da plataforma limpa o nome externo, e digitar o nome externo
//     desfaz a escolha (vale um dos dois cadastros por vez).
// "Adicionar" fica com a aparência do Figma o tempo todo; sem paciente escolhido e sem
// nome externo, o clique só leva o foco ao campo "Nome do paciente...".
// A página troca a "key" deste componente a cada abertura, assim os campos
// sempre começam vazios (sem precisar de useEffect para limpar).
// Props:
//   aberto              -> mostra ou esconde o pop-up
//   pacientesPlataforma -> [{ id, nome, email }] usados na busca
//   idsVinculados       -> Set com os ids dos pacientes que já estão na lista
//   onFechar            -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   onAdicionar         -> ({ id?, nome, email, origem }) => void, chamado ao clicar em "Adicionar"
// ============================================================
import { useId, useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { textoParaBusca } from '../../../../utils/formatadores'
import BuscaPlataforma from './BuscaPlataforma'
import CampoPaciente from './CampoPaciente'

const LIMITE_NOME = 100 // tamanho máximo do nome no cadastro externo

// O Modal compartilhado não muda; o contêiner só ajusta as medidas do Figma:
//   largura de 352px no mobile (403px), título de 16px em negrito,
//   cabeçalho com 63px de altura e o X de 18px (traço 1.8) alinhado ao Figma
const AJUSTE_MODAL = [
  '[&_dialog]:w-[calc(100%-51px)]',
  '[&_dialog>div>div:first-child]:py-[19px]',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:mt-0 [&_h2+button]:mr-[3px]',
  '[&_h2+button_svg]:h-[18px] [&_h2+button_svg]:w-[18px] [&_h2+button_svg]:[stroke-width:1.8]',
].join(' ')

// botões do rodapé: 44px de altura, cantos de 12px e texto de 14px em negrito
const BOTAO_RODAPE = 'h-11! rounded-xl! text-[14px]! font-bold!'
// "Cancelar": contorno lilás de 2px por fora, como no Figma
const BOTAO_CANCELAR = `${BOTAO_RODAPE} border-0! px-[18px]! shadow-[0_0_0_2px_var(--color-borda)]`
const BOTAO_ADICIONAR = `${BOTAO_RODAPE} px-5! shadow-sm`

// campo do nome externo: 46px de altura (os campos com lupa ficam no BuscaPlataforma)
const CAMPO_SEM_LUPA = 'h-[46px] pl-[17px] pr-4'

export default function ModalNovoPaciente({ aberto, pacientesPlataforma, idsVinculados, onFechar, onAdicionar }) {
  const idFormulario = useId() // ligo o botão "Adicionar" (que fica no rodapé) ao formulário
  const idPlataforma = useId()
  const idExterno = useId()
  const idAjuda = useId()
  const refNome = useRef(null)
  const [buscaNome, setBuscaNome] = useState('')
  const [buscaEmail, setBuscaEmail] = useState('')
  const [selecionado, setSelecionado] = useState(null) // paciente da plataforma escolhido
  const [nomeExterno, setNomeExterno] = useState('')

  // pacientes da plataforma que ainda não estão na lista do profissional
  const disponiveis = pacientesPlataforma.filter((p) => !idsVinculados.has(p.id))

  // resultados de cada campo (ignoram maiúsculas/acentos): um busca pelo nome, o outro pelo e-mail
  const termoNome = textoParaBusca(buscaNome.trim())
  const termoEmail = textoParaBusca(buscaEmail.trim())
  const resultadosNome = disponiveis.filter((p) => textoParaBusca(p.nome).includes(termoNome))
  const resultadosEmail = disponiveis.filter((p) => textoParaBusca(p.email).includes(termoEmail))

  // ao escrever de novo na busca, a escolha anterior deixa de valer
  function alterarBuscaNome(texto) {
    setBuscaNome(texto)
    setSelecionado(null)
  }

  function alterarBuscaEmail(texto) {
    setBuscaEmail(texto)
    setSelecionado(null)
  }

  // escolher um paciente preenche nome e e-mail e limpa o nome externo
  function escolherPaciente(paciente) {
    setSelecionado(paciente)
    setBuscaNome(paciente.nome)
    setBuscaEmail(paciente.email)
    setNomeExterno('')
  }

  // digitar o nome externo desmarca o paciente da plataforma
  function alterarNomeExterno(evento) {
    setNomeExterno(evento.target.value)
    setSelecionado(null)
  }

  // monta o paciente e entrega para a página (que fecha o pop-up e mostra o toast)
  function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    const nome = nomeExterno.trim().replace(/\s+/g, ' ')
    if (selecionado) {
      onAdicionar({ ...selecionado, origem: 'plataforma' })
    } else if (nome) {
      onAdicionar({ nome, email: null, origem: 'externo' })
    } else {
      refNome.current?.focus() // nada escolhido nem digitado: volta para a busca por nome
    }
  }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CANCELAR} onClick={onFechar}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto className={BOTAO_ADICIONAR}>
        Adicionar
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL}>
      <Modal aberto={aberto} titulo="Adicionar paciente" onFechar={onFechar} comDivisores rodape={rodape} largura="max-w-[448px]">
        {/* -my-1: o Modal tem 24px de respiro; no Figma são 20px em cima e embaixo */}
        <form id={idFormulario} onSubmit={enviar} noValidate className="-my-1 flex flex-col">
          {/* RF303: paciente com conta no Dialoga (por nome ou e-mail) */}
          <div role="group" aria-labelledby={idPlataforma} className="flex flex-col gap-2">
            <p id={idPlataforma} className="mb-[-3px] text-[14px] font-semibold leading-5 text-texto">
              Buscar paciente cadastrado na plataforma
            </p>
            <BuscaPlataforma
              rotulo="Nome do paciente"
              placeholder="Nome do paciente..."
              inputRef={refNome}
              valor={buscaNome}
              onMudarValor={alterarBuscaNome}
              resultados={resultadosNome}
              selecionadoId={selecionado?.id ?? null}
              onEscolher={escolherPaciente}
            />
            <BuscaPlataforma
              rotulo="E-mail do paciente"
              placeholder="Ou buscar por e-mail..."
              valor={buscaEmail}
              onMudarValor={alterarBuscaEmail}
              resultados={resultadosEmail}
              selecionadoId={selecionado?.id ?? null}
              onEscolher={escolherPaciente}
            />
          </div>

          {/* RF304: paciente sem conta, cadastrado só pelo nome */}
          <label htmlFor={idExterno} className="mt-[17px] mb-[5px] text-[14px] font-semibold leading-5 text-texto">
            Ou cadastrar pelo nome (externo)
          </label>
          <CampoPaciente
            id={idExterno}
            name="nomeExterno"
            placeholder="Nome completo do paciente"
            maxLength={LIMITE_NOME}
            className={CAMPO_SEM_LUPA}
            aria-describedby={idAjuda}
            value={nomeExterno}
            onChange={alterarNomeExterno}
          />
          <p id={idAjuda} className="mt-1 text-[12px] leading-4 text-secundaria">
            Para organização interna e uso na agenda.
          </p>
        </form>
      </Modal>
    </div>
  )
}
