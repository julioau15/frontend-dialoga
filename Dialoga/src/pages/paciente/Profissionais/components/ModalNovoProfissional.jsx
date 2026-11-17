// ============================================================
// ModalNovoProfissional
// Pop-up "Novo profissional" (RF320, RF321), como no Figma; quem chama a API é a página (pelas props)
// ("Novo profissional - Paciente" e "Novo profissional - Paciente-1"):
//   - "CPF (opcional)" com máscara 000.000.000-00 e a ajuda "O CPF é usado para verificar...";
//   - "Nome completo *", "E-mail (opcional)" e "Especialidade *" (campo de texto; com o profissional
//     achado pelo CPF, vira uma lista com as especialidades cadastradas por ele);
//   - botões Cancelar e Salvar.
// Busca por CPF (RF320): com os 11 números de um CPF válido, o pop-up consulta a API
// ("Verificando CPF..."). Achando um profissional da plataforma, a ajuda dá lugar ao cartão
// verde (nome, especialidade e ✓) e nome, e-mail e especialidade são preenchidos; ao salvar,
// o vínculo é pedido e a página abre o pop-up "Profissional encontrado".
// Validações (validarNovoProfissional): CPF válido quando preenchido, nome obrigatório sem
// números e com até 100 caracteres, e-mail no formato certo quando preenchido e especialidade
// obrigatória. O erro aparece embaixo do campo e o foco vai para o primeiro campo com erro.
// Profissional que já está no acompanhamento (ativo ou pendente) não pode ser adicionado de novo.
// Falha da API ao salvar: a mensagem aparece em cima dos botões e o pop-up continua aberto.
// A página troca a "key" deste componente a cada abertura, assim os campos sempre começam vazios.
// Props:
//   onFechar()                  -> X, fundo escuro, Esc ou Cancelar
//   onAdicionar(dados)          -> async; { cpf, nome, email, especialidade } (fora da plataforma)
//   onEncontrado(profissional)  -> async; { id, nome, ... } do profissional da plataforma
//   onBuscarCpf(cpf, signal)    -> async; profissional da plataforma com o CPF, ou null
//   idsVinculados               -> Set com os ids da plataforma já no acompanhamento atual
// ============================================================
import { useEffect, useId, useRef, useState } from 'react'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Button from '../../../../components/Button'
import { IconeCheck } from '../../../../components/Icones'
import Modal from '../../../../components/Modal'
import TextField from '../../../../components/TextField'
import { doisPrimeirosNomes, semTitulo } from '../../../../utils/formatadores'
import { AJUSTE_CAMPO, AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosProfissionais'
import { IconeChevronBaixo } from './iconesProfissionais'
import { cpfValido, LIMITES_PROFISSIONAL, limparCpf, validarNovoProfissional } from '../../../../utils/validators'
import { PROFISSIONAL_VAZIO, mascararCpf } from './profissionaisMock'

// no mobile e no tablet os botões do rodapé deste pop-up têm 32px de altura (frame "Novo profissional - Mobile")
const BOTAO_MOBILE = 'max-lg:h-8!'

// avatar de 40px com as iniciais de 14px no cartão do profissional encontrado
const AJUSTE_AVATAR = 'shrink-0 [&>div]:h-10 [&>div]:w-10 [&>div]:text-[14px]'

// asterisco vermelho dos campos obrigatórios
const Obrigatorio = ({ children }) => (
  <>
    {children} <span className="text-erro" aria-hidden="true">*</span>
  </>
)

export default function ModalNovoProfissional({ onFechar, onAdicionar, onEncontrado, onBuscarCpf, idsVinculados }) {
  const idFormulario = useId() // liga o botão "Salvar" (no rodapé) ao formulário
  const idEspecialidade = useId()
  const refCpf = useRef(null)
  const refNome = useRef(null)
  const refEmail = useRef(null)
  const refEspecialidade = useRef(null)
  const envio = useRef(false)
  const buscaCpf = useRef(null) // AbortController da busca de CPF em andamento
  const [dados, setDados] = useState(PROFISSIONAL_VAZIO)
  const [erros, setErros] = useState({})
  const [encontrado, setEncontrado] = useState(null) // profissional da plataforma com o CPF digitado
  const [verificando, setVerificando] = useState(false) // busca de CPF em andamento
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

  // fechou o pop-up no meio da busca: cancela a requisição
  useEffect(() => () => buscaCpf.current?.abort(), [])

  // atualiza um campo de texto e apaga o erro dele
  const alterar = (campo) => (e) => {
    setDados((d) => ({ ...d, [campo]: e.target.value }))
    setErros((er) => ({ ...er, [campo]: undefined }))
  }

  // CPF com máscara; com os 11 números de um CPF válido, procura o profissional na API.
  // Achando, preenche nome, e-mail e especialidade (a primeira cadastrada por ele).
  async function alterarCpf(e) {
    const cpf = mascararCpf(e.target.value)
    buscaCpf.current?.abort()
    buscaCpf.current = null
    setVerificando(false)
    setDados((d) => ({ ...d, cpf }))
    setErros((er) => ({ ...er, cpf: undefined }))
    setErroEnvio('')
    setEncontrado(null)
    if (limparCpf(cpf).length !== 11) return
    if (!cpfValido(cpf)) {
      setErros((er) => ({ ...er, cpf: 'CPF inválido.' }))
      return
    }
    const controle = new AbortController()
    buscaCpf.current = controle
    setVerificando(true)
    try {
      const achado = await onBuscarCpf(cpf, controle.signal)
      if (controle.signal.aborted || buscaCpf.current !== controle || !achado) return
      const jaVinculado = [...idsVinculados].some((id) => String(id) === String(achado.id))
      if (jaVinculado) {
        setErros((er) => ({ ...er, cpf: 'Este profissional já está no seu acompanhamento.' }))
        return
      }
      setEncontrado(achado)
      setDados({ cpf, nome: achado.nome, email: achado.email ?? '', especialidade: achado.especialidades[0] })
      setErros({})
    } catch (erro) {
      if (!controle.signal.aborted && buscaCpf.current === controle) {
        setErros((er) => ({ ...er, cpf: erro.message }))
      }
    } finally {
      if (buscaCpf.current === controle) {
        buscaCpf.current = null
        setVerificando(false)
      }
    }
  }

  // valida, mostra os erros e entrega os dados para a página (que chama a API)
  async function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    if (buscaCpf.current || envio.current || verificando || enviando) return

    const novosErros = validarNovoProfissional(dados)
    if (erros.cpf) novosErros.cpf = erros.cpf // CPF inválido ou já vinculado continua valendo
    setErros(novosErros)

    // leva o foco ao primeiro campo com erro, na ordem do formulário
    const primeiro = [
      ['cpf', refCpf],
      ['nome', refNome],
      ['email', refEmail],
      ['especialidade', refEspecialidade],
    ].find(([campo]) => novosErros[campo])
    if (primeiro) return primeiro[1].current?.focus()

    const limpos = { ...dados, nome: dados.nome.trim(), email: dados.email.trim(), especialidade: dados.especialidade.trim() }
    envio.current = true
    setEnviando(true)
    setErroEnvio('')
    try {
      if (encontrado) await onEncontrado(encontrado)
      else await onAdicionar(limpos)
    } catch (erro) {
      setErroEnvio(erro.message)
    } finally {
      envio.current = false
      setEnviando(false)
    }
  }

  const fechar = () => { if (!envio.current) onFechar() }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={`${BOTAO_CLARO} ${BOTAO_MOBILE}`} onClick={fechar} disabled={enviando}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button
        type="submit"
        form={idFormulario}
        larguraAuto
        carregando={enviando || verificando}
        className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}
      >
        {enviando ? 'Salvando...' : 'Salvar'}
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL} onCancel={(e) => { if (envio.current) e.preventDefault() }}>
      <Modal aberto comDivisores largura="max-w-[448px]" titulo="Novo profissional" onFechar={fechar} rodape={rodape}>
        {/* -my-1: o Modal tem 24px de respiro; no Figma são 20px em cima e embaixo */}
        <form id={idFormulario} noValidate onSubmit={enviar}>
          <fieldset disabled={enviando} className="-my-1 flex min-w-0 flex-col gap-5">
          <div className="flex flex-col">
            {/* a ajuda some quando o profissional é encontrado (o cartão verde fica no lugar) */}
            <div className={AJUSTE_CAMPO}>
              <TextField
                ref={refCpf}
                label="CPF (opcional)"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={dados.cpf}
                onChange={alterarCpf}
                erro={erros.cpf}
                ajuda={
                  encontrado || erros.cpf
                    ? undefined
                    : verificando
                      ? 'Verificando CPF...'
                      : 'O CPF é usado para verificar se o profissional tem cadastro na plataforma.'
                }
              />
            </div>

            {/* profissional da plataforma achado pelo CPF ("Novo profissional - Paciente-1") */}
            {encontrado && (
              <div
                role="status"
                className="mt-[11px] -mb-1.5 flex items-center gap-3.5 rounded-xl border border-sucesso-borda bg-sucesso-fundo px-3.5 py-3"
              >
                <div className={AJUSTE_AVATAR}>
                  <AvatarIniciais nome={doisPrimeirosNomes(semTitulo(encontrado.nome)).join(' ')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[14px] font-semibold leading-5 text-texto">{encontrado.nome}</p>
                  <p className="text-[12px] leading-4 text-secundaria">{encontrado.especialidades.join(', ')}</p>
                </div>
                <IconeCheck tamanho={16} className="text-sucesso-escura [stroke-width:1.8]" />
                <span className="sr-only">Profissional encontrado na plataforma</span>
              </div>
            )}
          </div>

          <div className={AJUSTE_CAMPO}>
            <TextField
              ref={refNome}
              label={<Obrigatorio>Nome completo</Obrigatorio>}
              placeholder="Nome do profissional"
              required
              autoComplete="off"
              maxLength={LIMITES_PROFISSIONAL.NOME}
              value={dados.nome}
              onChange={alterar('nome')}
              erro={erros.nome}
            />
          </div>

          <div className={AJUSTE_CAMPO}>
            <TextField
              ref={refEmail}
              label="E-mail (opcional)"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="off"
              maxLength={LIMITES_PROFISSIONAL.EMAIL}
              value={dados.email}
              onChange={alterar('email')}
              erro={erros.email}
            />
          </div>

          {/* Especialidade: profissional achado pelo CPF -> lista com as especialidades cadastradas
              por ele; senão, campo de texto livre */}
          {encontrado ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={idEspecialidade} className="text-[14px] font-semibold leading-5 text-texto">
                <Obrigatorio>Especialidade</Obrigatorio>
              </label>
              <div className="relative">
                <select
                  id={idEspecialidade}
                  ref={refEspecialidade}
                  required
                  value={dados.especialidade}
                  onChange={alterar('especialidade')}
                  className="h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-borda bg-branco pr-10 pl-4 text-[14px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
                >
                  {encontrado.especialidades.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
                <IconeChevronBaixo
                  tamanho={14}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-texto [stroke-width:2.2]"
                />
              </div>
            </div>
          ) : (
            <div className={AJUSTE_CAMPO}>
              <TextField
                ref={refEspecialidade}
                label={<Obrigatorio>Especialidade</Obrigatorio>}
                placeholder="Ex: Psicologia Clínica, Psiquiatria, TCC"
                required
                autoComplete="off"
                maxLength={LIMITES_PROFISSIONAL.ESPECIALIDADE}
                value={dados.especialidade}
                onChange={alterar('especialidade')}
                erro={erros.especialidade}
              />
            </div>
          )}

          {/* erro da API ao salvar (o pop-up continua aberto para tentar de novo) */}
          {erroEnvio && (
            <p role="alert" className="-mt-2 rounded-xl border border-erro-borda bg-erro-fundo px-3.5 py-2.5 text-[13px] leading-5 text-erro">
              {erroEnvio}
            </p>
          )}
          </fieldset>
        </form>
      </Modal>
    </div>
  )
}
