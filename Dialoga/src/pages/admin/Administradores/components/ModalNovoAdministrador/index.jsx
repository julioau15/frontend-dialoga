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
// ============================================================
import { useId, useState } from 'react'
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'
import TextField from '../../../../../components/TextField'
import iconeNome from '../../../../../assets/auth/IconNome.png'
import iconeEmail from '../../../../../assets/auth/icon_email.png'
import iconeCadeado from '../../../../../assets/auth/icon_cadeado.png'

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

export default function ModalNovoAdministrador({ aberto, onFechar, onCriar }) {
  const idFormulario = useId() // ligo o botão "Criar" (que fica no rodapé) ao formulário
  const [valores, setValores] = useState(VALORES_INICIAIS)

  // Devolvo uma função que atualiza só o campo informado e mantém os outros
  const alterar = (campo) => (evento) => setValores((v) => ({ ...v, [campo]: evento.target.value }))

  function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    onCriar(valores)
  }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto onClick={onFechar}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto>
        Criar
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
      <form id={idFormulario} onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <TextField
          label={rotuloComIcone(iconeNome, 'Nome completo')}
          name="nome"
          autoComplete="name"
          placeholder="Nome do administrador"
          value={valores.nome}
          onChange={alterar('nome')}
        />
        <TextField
          label={rotuloComIcone(iconeEmail, 'E-mail')}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@dialoga.com.br"
          value={valores.email}
          onChange={alterar('email')}
        />
        <TextField
          label={rotuloComIcone(iconeCadeado, 'Senha provisória')}
          type="password"
          name="senha"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={valores.senha}
          onChange={alterar('senha')}
        />

        {/* Aviso lilás do Figma, com as mesmas classes de destaque usadas nos modais do admin */}
        <p className="p-3 bg-fundo-card rounded-lg text-[11.5px] leading-relaxed text-secundaria">
          O novo administrador receberá um <strong className="font-bold">e-mail com as credenciais de acesso</strong> e
          instruções para redefinir a senha no primeiro login.
        </p>
      </form>
    </Modal>
  )
}