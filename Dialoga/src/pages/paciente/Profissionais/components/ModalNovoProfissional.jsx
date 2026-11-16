// ============================================================
// ModalNovoProfissional
// Pop-up "Novo profissional" (RF320, RF321), só visual (sem API), como no Figma
// ("Novo profissional - Paciente" e "Novo profissional - Paciente-1"):
//   - "CPF (opcional)" com máscara 000.000.000-00 e a ajuda "O CPF é usado para verificar...";
//   - "Nome completo *", "E-mail (opcional)" e "Especialidade *" (campo de texto; com o profissional
//     achado pelo CPF, vira uma lista com as especialidades cadastradas por ele);
//   - botões Cancelar e Salvar.
// Busca por CPF: com os 11 números de um profissional da plataforma, a ajuda dá lugar ao
// cartão verde do profissional (nome, especialidade e ✓) e nome, e-mail e especialidade
// são preenchidos. Ao salvar, a página abre o pop-up "Profissional encontrado".
// O Figma não tem campo de foto (combinado com a equipe: segue o Figma) e não mostra erro
// de campo vazio: sem nome ou especialidade, o clique em "Salvar" só leva o foco ao campo vazio.
// A página troca a "key" deste componente a cada abertura, assim os campos sempre começam vazios.
// Props:
//   onFechar()             -> X, fundo escuro, Esc ou Cancelar
//   onAdicionar(dados)     -> { cpf, nome, email, especialidade } (profissional fora da plataforma)
//   onEncontrado(dados)    -> o mesmo, quando o CPF é de um profissional da plataforma
// ============================================================
import { useId, useRef, useState } from 'react'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Button from '../../../../components/Button'
import { IconeCheck } from '../../../../components/Icones'
import Modal from '../../../../components/Modal'
import TextField from '../../../../components/TextField'
import { doisPrimeirosNomes } from '../../../../utils/formatadores'
import { AJUSTE_CAMPO, AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosProfissionais'
import { IconeChevronBaixo } from './iconesProfissionais'
import { PROFISSIONAL_VAZIO, buscarPorCpf, mascararCpf } from './profissionaisMock'

const LIMITE_NOME = 100

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

export default function ModalNovoProfissional({ onFechar, onAdicionar, onEncontrado }) {
  const idFormulario = useId() // liga o botão "Salvar" (no rodapé) ao formulário
  const idEspecialidade = useId()
  const refNome = useRef(null)
  const refEspecialidade = useRef(null)
  const [dados, setDados] = useState(PROFISSIONAL_VAZIO)

  // profissional da plataforma com o CPF digitado (undefined enquanto não acha)
  const encontrado = buscarPorCpf(dados.cpf)

  // atualiza um campo de texto
  const alterar = (campo) => (e) => setDados((d) => ({ ...d, [campo]: e.target.value }))

  // CPF com máscara; ao achar um profissional da plataforma, preenche nome, e-mail e especialidade
  function alterarCpf(e) {
    const cpf = mascararCpf(e.target.value)
    const achado = buscarPorCpf(cpf)
    setDados((d) => (achado ? { cpf, nome: achado.nome, email: achado.email, especialidade: achado.especialidade } : { ...d, cpf }))
  }

  // confere os obrigatórios e entrega os dados para a página
  function enviar(evento) {
    evento.preventDefault() // não deixo a página recarregar ao enviar o formulário
    if (!dados.nome.trim()) return refNome.current?.focus()
    if (!dados.especialidade.trim()) return refEspecialidade.current?.focus()
    const limpos = { ...dados, nome: dados.nome.trim(), email: dados.email.trim(), especialidade: dados.especialidade.trim() }
    if (encontrado) onEncontrado(limpos)
    else onAdicionar(limpos)
  }

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={`${BOTAO_CLARO} ${BOTAO_MOBILE}`} onClick={onFechar}>
        Cancelar
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}>
        Salvar
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL}>
      <Modal aberto comDivisores largura="max-w-[448px]" titulo="Novo profissional" onFechar={onFechar} rodape={rodape}>
        {/* -my-1: o Modal tem 24px de respiro; no Figma são 20px em cima e embaixo */}
        <form id={idFormulario} noValidate onSubmit={enviar} className="-my-1 flex flex-col gap-5">
          <div className="flex flex-col">
            {/* a ajuda some quando o profissional é encontrado (o cartão verde fica no lugar) */}
            <div className={AJUSTE_CAMPO}>
              <TextField
                label="CPF (opcional)"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={dados.cpf}
                onChange={alterarCpf}
                ajuda={encontrado ? undefined : 'O CPF é usado para verificar se o profissional tem cadastro na plataforma.'}
              />
            </div>

            {/* profissional da plataforma achado pelo CPF ("Novo profissional - Paciente-1") */}
            {encontrado && (
              <div
                role="status"
                className="mt-[11px] -mb-1.5 flex items-center gap-3.5 rounded-xl border border-sucesso-borda bg-sucesso-fundo px-3.5 py-3"
              >
                <div className={AJUSTE_AVATAR}>
                  <AvatarIniciais nome={doisPrimeirosNomes(encontrado.nome).join(' ')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[14px] font-semibold leading-5 text-texto">{encontrado.nome}</p>
                  <p className="text-[12px] leading-4 text-secundaria">{encontrado.especialidade}</p>
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
              maxLength={LIMITE_NOME}
              value={dados.nome}
              onChange={alterar('nome')}
            />
          </div>

          <div className={AJUSTE_CAMPO}>
            <TextField
              label="E-mail (opcional)"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="off"
              value={dados.email}
              onChange={alterar('email')}
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
                maxLength={LIMITE_NOME}
                value={dados.especialidade}
                onChange={alterar('especialidade')}
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
