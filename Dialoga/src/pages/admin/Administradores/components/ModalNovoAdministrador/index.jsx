// ============================================================
// ModalNovoAdministrador
// Pop-up com Nome completo, E-mail e Senha provisória, o aviso sobre o
// e-mail de acesso e os botões Cancelar e Criar.
// Nesta etapa é só layout: não valido os campos nem chamo a API.
// Props:
//   aberto   -> mostra ou esconde o pop-up
//   onFechar -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   onCriar  -> ({ nome, email, senha }) => void, chamado ao clicar em "Criar"
// A página troca a "key" deste componente a cada abertura, assim os campos
// sempre começam vazios (sem precisar de useEffect para limpar).
//   enviando  -> true enquanto o administrador é criado (trava os botões)
//   onValidar -> (valores) => { campo: 'mensagem' }, vem do hook useAdministradores
//   Se o onCriar der erro, mostro a mensagem no campo certo ou embaixo do formulário.
// ============================================================
import { useId, useState } from 'react'
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'
import TextField from '../../../../../components/TextField'
import iconeNome from '../../../../../assets/auth/IconNome.png'
import iconeEmail from '../../../../../assets/auth/icon_email.png'
import iconeCadeado from '../../../../../assets/auth/icon_cadeado.png'
import { LIMITES_ADMINISTRADOR } from '../../../../../utils/validators'

const VALORES_INICIAIS = { nome: '', email: '', senha: '' }

// Rótulo com o ícone ao lado do texto, como no Figma.
// Reaproveito os mesmos ícones do Login e do Cadastro.
// Deixo esta função fora do componente principal: se ficasse dentro,
// ela seria recriada a cada render (regra do React).
function rotuloComIcone(icone, texto) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img className="w-3.5 h-3.5 object-contain" src={icone} alt="" />
      {texto}
    </span>
  )
}

export default function ModalNovoAdministrador({ aberto, enviando = false, onFechar, onValidar, onCriar }) {
    const idFormulario = useId() // ligo o botão "Criar" (que fica no rodapé) ao formulário
    const [valores, setValores] = useState(VALORES_INICIAIS)
    const [erros, setErros] = useState({}) // erro de cada campo
    const [erroGeral, setErroGeral] = useState('') // erro que não é de um campo (ex.: falha na API)
  
    // Atualizo só o campo digitado e apago o erro dele enquanto a pessoa corrige
    const alterar = (campo) => (evento) => {
      const valor = evento.target.value
      setValores((v) => ({ ...v, [campo]: valor }))
      setErros((e) => ({ ...e, [campo]: undefined }))
      setErroGeral('')
    }
  
    async function enviar(evento) {
      evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
  
      // 1) valido antes de chamar o service
      const encontrados = onValidar(valores)
      setErros(encontrados)
      if (Object.keys(encontrados).length > 0) return
  
      // 2) crio; quando dá certo, a página fecha o pop-up e mostra o toast
      try {
        await onCriar(valores)
      } catch (erro) {
        // Erro de um campo (ex.: e-mail repetido) aparece embaixo dele; o resto, embaixo do formulário
        if (erro.campo) setErros({ [erro.campo]: erro.message })
        else setErroGeral(erro.message)
      }
    }
  
    const rodape = (
      <>
        {/* RF08: Cancelar fecha sem criar */}
        <Button type="button" variante="suave" larguraAuto disabled={enviando} onClick={onFechar}>
          Cancelar
        </Button>
        {/* RF09. O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
        <Button type="submit" form={idFormulario} larguraAuto carregando={enviando}>
          {enviando ? 'Criando...' : 'Criar'}
        </Button>
      </>
    )
  
    return (
      <Modal
        aberto={aberto}
        titulo="Novo administrador"
        onFechar={onFechar}
        comDivisores
        rodape={rodape}
        largura="max-w-[384px]"
      >
        {/* RF06: os três campos do cadastro */}
        <form id={idFormulario} onSubmit={enviar} noValidate className="flex flex-col gap-4">
          <TextField
            label={rotuloComIcone(iconeNome, 'Nome completo')}
            name="nome"
            autoComplete="name"
            placeholder="Nome do administrador"
            maxLength={LIMITES_ADMINISTRADOR.NOME}
            value={valores.nome}
            onChange={alterar('nome')}
            erro={erros.nome}
          />
          <TextField
            label={rotuloComIcone(iconeEmail, 'E-mail')}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="email@dialoga.com.br"
            maxLength={LIMITES_ADMINISTRADOR.EMAIL}
            value={valores.email}
            onChange={alterar('email')}
            erro={erros.email}
          />
          <TextField
            label={rotuloComIcone(iconeCadeado, 'Senha provisória')}
            type="password"
            name="senha"
            autoComplete="new-password"
            placeholder={`Mínimo ${LIMITES_ADMINISTRADOR.SENHA_MIN} caracteres`}
            maxLength={LIMITES_ADMINISTRADOR.SENHA_MAX}
            value={valores.senha}
            onChange={alterar('senha')}
            erro={erros.senha}
          />
  
          {/* RF07: aviso sobre o e-mail com as credenciais */}
          <p className="p-3 bg-fundo-card rounded-lg text-[11.5px] leading-relaxed text-secundaria">
            O envio automático por e-mail ainda não está disponível. <strong className="font-bold">Informe as credenciais de acesso</strong> ao
            novo administrador.
          </p>
  
          {erroGeral && <p role="alert" className="text-[11px] text-erro">{erroGeral}</p>}
        </form>
      </Modal>
    )
  }