// ============================================================
// ModalNovoPaciente
// Pop-up "Adicionar paciente" (RF303 e RF304), ligado à API.
// Layout do Figma ("Novo paciente - Profissional" e frame mobile):
//   - "Buscar paciente cadastrado na plataforma": campo por nome e campo por e-mail;
//   - "Ou cadastrar pelo nome (externo)": nome completo + "Para organização interna e uso na agenda.";
//   - rodapé com "Cancelar" e "Adicionar".
// O Figma não tem o estado com resultados; a busca funciona como um dropdown (BuscaPlataforma):
//   - ao escrever no nome ou no e-mail (2+ letras, depois de 300 ms parado), a lista abre colada
//     embaixo daquele campo, por cima do resto do pop-up, com os pacientes da plataforma que
//     combinam, buscados na API (os já vinculados ou com pedido pendente não aparecem);
//   - escolher um paciente preenche os dois campos (nome e e-mail) e mostra ✓ no campo;
//     escrever de novo em qualquer um deles desfaz a escolha;
//   - escolher um paciente da plataforma limpa o nome externo, e digitar o nome externo
//     desfaz a escolha (vale um dos dois cadastros por vez).
// "Adicionar" fica com a aparência do Figma o tempo todo; sem paciente escolhido e sem
// nome externo, o clique só leva o foco ao campo "Nome do paciente...".
// Ao adicionar, a página envia o pedido de vínculo; se a API recusar, a mensagem aparece
// dentro do pop-up (ele continua aberto) e o botão fica desativado enquanto envia.
// Nome externo: obrigatório, 3 a 100 caracteres e só letras (validarNomeExterno); o erro aparece
// no mesmo aviso vermelho do pop-up e o foco vai para o campo.
// A página troca a "key" deste componente a cada abertura, assim os campos
// sempre começam vazios (sem precisar de useEffect para limpar).
// Props:
//   aberto              -> mostra ou esconde o pop-up
//   token               -> credencial da sessão, usada na busca de pacientes
//   idsVinculados       -> Set com os ids dos pacientes que já estão na lista
//   onFechar            -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   onAdicionar         -> async ({ id?, nome, email, origem }) => void, chamado ao clicar em "Adicionar";
//                          se lançar Error, a mensagem aparece no pop-up
// ============================================================
import { useId, useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { useBuscaPaciente } from '../../../../hooks/useBuscaPaciente'
import BuscaPlataforma from './BuscaPlataforma'
import CampoPaciente from './CampoPaciente'
import { validarNomeExterno } from '../../../../utils/pacientesExternos'

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

// resultado da API -> opção da lista suspensa
const paraOpcao = (p) => ({ id: p.id, nome: p.nome_completo, email: p.email ?? '' })

// o que a lista mostra quando ainda não há resultado (null = "Nenhum paciente encontrado")
function avisoDaBusca(busca) {
  if (busca.erro) return busca.erro
  if (busca.carregando) return 'Buscando pacientes...'
  if (busca.termoCurto) return 'Digite pelo menos 2 letras.'
  return null
}

export default function ModalNovoPaciente({ aberto, token, idsVinculados, onFechar, onAdicionar }) {
  const idFormulario = useId() // ligo o botão "Adicionar" (que fica no rodapé) ao formulário
  const idPlataforma = useId()
  const idExterno = useId()
  const idAjuda = useId()
  const refNome = useRef(null)
  const refExterno = useRef(null) // campo do nome externo (recebe o foco quando o nome é inválido)
  const [buscaNome, setBuscaNome] = useState('')
  const [buscaEmail, setBuscaEmail] = useState('')
  const [selecionado, setSelecionado] = useState(null) // paciente da plataforma escolhido
  const [nomeExterno, setNomeExterno] = useState('')
  const [enviando, setEnviando] = useState(false) // pedido em andamento na API
  const [erro, setErro] = useState('') // mensagem da API ao adicionar

  // um campo busca pelo nome, o outro pelo e-mail; a API procura o texto nos dois.
  // Com um paciente escolhido a busca para (os campos já estão preenchidos com os dados dele).
  const buscaNomeApi = useBuscaPaciente(selecionado ? '' : buscaNome, token)
  const buscaEmailApi = useBuscaPaciente(selecionado ? '' : buscaEmail, token)

  // quem já está na lista (inclusive pedido pendente) não aparece de novo
  const resultadosNome = buscaNomeApi.resultados.filter((p) => !idsVinculados.has(p.id)).map(paraOpcao)
  const resultadosEmail = buscaEmailApi.resultados.filter((p) => !idsVinculados.has(p.id)).map(paraOpcao)

  // ao escrever de novo na busca, a escolha anterior deixa de valer
  function alterarBuscaNome(texto) {
    setBuscaNome(texto)
    setSelecionado(null)
    setErro('')
  }

  function alterarBuscaEmail(texto) {
    setBuscaEmail(texto)
    setSelecionado(null)
    setErro('')
  }

  // escolher um paciente preenche nome e e-mail e limpa o nome externo
  function escolherPaciente(paciente) {
    setSelecionado(paciente)
    setBuscaNome(paciente.nome)
    setBuscaEmail(paciente.email)
    setNomeExterno('')
    setErro('')
  }

  // digitar o nome externo desmarca o paciente da plataforma
  function alterarNomeExterno(evento) {
    setNomeExterno(evento.target.value)
    setSelecionado(null)
    setErro('')
  }

  // monta o paciente e entrega para a página (que envia o pedido e fecha o pop-up)
  async function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    if (enviando) return

    const nome = nomeExterno.trim().replace(/\s+/g, ' ')
    if (!selecionado && !nome) {
      refNome.current?.focus() // nada escolhido nem digitado: volta para a busca por nome
      return
    }

    // cadastro externo: valida o nome antes de gravar
    const erroNome = selecionado ? '' : validarNomeExterno(nome)
    if (erroNome) {
      setErro(erroNome)
      refExterno.current?.focus()
      return
    }

    setErro('')
    setEnviando(true)
    try {
      await onAdicionar(selecionado ? { ...selecionado, origem: 'plataforma' } : { nome, email: null, origem: 'externo' })
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CANCELAR} onClick={onFechar}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto carregando={enviando} className={BOTAO_ADICIONAR}>
        {enviando ? 'Adicionando...' : 'Adicionar'}
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
              aviso={avisoDaBusca(buscaNomeApi)}
              selecionadoId={selecionado?.id ?? null}
              onEscolher={escolherPaciente}
            />
            <BuscaPlataforma
              rotulo="E-mail do paciente"
              placeholder="Ou buscar por e-mail..."
              valor={buscaEmail}
              onMudarValor={alterarBuscaEmail}
              resultados={resultadosEmail}
              aviso={avisoDaBusca(buscaEmailApi)}
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
            inputRef={refExterno}
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

          {/* erro devolvido pela API ao adicionar (ex.: vínculo já existe) */}
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
