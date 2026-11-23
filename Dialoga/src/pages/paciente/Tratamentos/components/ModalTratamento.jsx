// ============================================================
// ModalTratamento
// Pop-ups "Novo tratamento" (RF339–RF347) e "Editar tratamento" (RF349, RF355), como no Figma.
// Os dois usam o mesmo formulário:
//   - "Nome do medicamento / tratamento *" e "Dosagem *" (obrigatórios, com exemplo — RNF121, RNF122);
//   - "Frequência" (Uma a Quatro vezes ao dia);
//   - "Horário": um campo de hora para cada vez ao dia (Duas vezes ao dia = Horário 1 e Horário 2);
//   - "Ativar lembretes e notificações" (liga/desliga).
// Rodapé:
//   modo 'novo'   -> "Adicionar outro" (salva, mostra o toast e limpa o formulário) e "Salvar"
//   modo 'editar' -> só "Salvar alterações" (o Figma não tem "Cancelar"; fecha pelo X)
// Valida campos e horários sem descartar valores; o foco vai para o primeiro erro.
// No mobile, o campo Nome cresce para 2 linhas quando o exemplo não cabe em uma (como no Figma).
// Props:
//   modo       -> 'novo' | 'editar'
//   tratamento -> tratamento que será editado (só no modo 'editar')
//   toast      -> { aberto, tipo, mensagem }: aviso mostrado por cima do pop-up ("Adicionar outro")
//   onFecharToast() -> fecha esse aviso
//   onFechar() -> fecha o pop-up
//   onSalvar(dados, { continuar }) -> async; true somente após gravação conferida
//   processando / bloqueado -> envio em andamento / reconciliação pendente
//   erroOperacao -> mensagem da operação exibida dentro do dialog
//   onRecarregar -> consulta a lista antes de permitir novo envio
// ============================================================
import { useEffect, useId, useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Interruptor from '../../../../components/Interruptor'
import Modal from '../../../../components/Modal'
import TextAreaField from '../../../../components/TextAreaField'
import TextField from '../../../../components/TextField'
import Toast from '../../../../components/Toast'
import { AJUSTE_MODAL, AJUSTE_TOAST, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosTratamentos'
import { IconeChevronBaixo, IconeRelogio, IconeSino } from './iconesTratamentos'
import { FREQUENCIAS, TRATAMENTO_VAZIO, frequenciaDoRegistro, validarTratamento, vezesDe } from '../../../../utils/tratamentos'

const LIMITE_TEXTO = 150 // tamanho das colunas nome_medicamento e dosagem no banco

// rótulo dos campos (14px seminegrito) e caixa de 46px com cantos de 12px, como no Figma.
// O TextField e o TextAreaField compartilhados não mudam: o contêiner só ajusta as medidas.
const ROTULO = '[&_label]:text-[14px] [&_label]:font-semibold [&_label]:leading-5'
const AJUSTE_TEXTO = `${ROTULO} [&>div>div]:h-[46px] [&>div>div]:rounded-xl [&>div>div]:px-4 [&_input]:text-[14px] [&_input]:placeholder:text-secundaria`
const AJUSTE_AREA = `${ROTULO} [&_textarea]:min-h-[46px] [&_textarea]:rounded-xl [&_textarea]:px-4 [&_textarea]:text-[14px] [&_textarea]:leading-5 [&_textarea]:[field-sizing:content] [&_textarea]:placeholder:text-secundaria`

// interruptor de 40x24px, como no Figma (o Interruptor compartilhado tem 36x20px);
// flex: o contêiner não soma a altura de uma linha de texto à da chave
const AJUSTE_INTERRUPTOR = 'flex [&>button]:h-6 [&>button]:w-10 [&>button>span]:h-5 [&>button>span]:w-5'

// no mobile os botões do rodapé destes dois pop-ups têm 32px de altura (frames mobile do Figma)
const BOTAO_MOBILE = 'max-sm:h-8!'

// asterisco vermelho dos campos obrigatórios
const Obrigatorio = ({ children }) => (
  <>
    {children} <span className="text-erro" aria-hidden="true">*</span>
  </>
)

// copia o tratamento para o formulário (editar) ou começa com os valores do Figma (novo)
function estadoInicial(tratamento) {
  if (!tratamento) return { ...TRATAMENTO_VAZIO, horarios: [...TRATAMENTO_VAZIO.horarios] }
  // Preserva a sequência e todos os campos, com precisão de hora e minuto no formulário.
  return {
    nome: tratamento.nome,
    dosagem: tratamento.dosagem,
    // registros antigos ("1x ao dia", "à noite") viram uma das opções da lista
    frequencia: frequenciaDoRegistro(tratamento.frequencia, tratamento.horarios.length),
    horarios: tratamento.horarios.length ? tratamento.horarios.map((hora) => hora.slice(0, 5)) : [''],
    lembrete: tratamento.lembrete,
  }
}

export default function ModalTratamento({ modo = 'novo', tratamento, toast, onFecharToast, onFechar, onSalvar,
  processando = false, bloqueado = false, erroOperacao = '', onRecarregar }) {
  const editando = modo === 'editar'
  const idFormulario = useId()
  const idFrequencia = useId()
  const idHorario = useId()
  const idErroHorario = useId()
  const refNome = useRef(null)
  const refDosagem = useRef(null)
  const refFrequencia = useRef(null)
  const refPrimeiroHorario = useRef(null)
  const envioRef = useRef(false)
  const focoNomeRef = useRef(false)
  const [campos, setCampos] = useState(() => estadoInicial(tratamento))
  // os erros só aparecem depois de salvar (ou ao corrigir um campo): na edição o pop-up abre limpo
  const [erros, setErros] = useState({})
  const [avisoHorarios, setAvisoHorarios] = useState('')
  const desabilitado = processando || bloqueado

  // Aguarda o campo ser habilitado no DOM antes de focar após "Adicionar outro".
  useEffect(() => {
    if (focoNomeRef.current && !desabilitado) {
      focoNomeRef.current = false
      refNome.current?.focus()
    }
  }, [campos, desabilitado])

  // atualiza um campo de texto
  const alterar = (campo) => (e) => {
    if (desabilitado || envioRef.current) return
    setCampos((c) => ({ ...c, [campo]: e.target.value }))
    setErros((anteriores) => ({ ...anteriores, [campo]: undefined }))
  }

  // nome: o campo tem 2 linhas no mobile, mas não aceita quebra de linha (Enter ou texto colado)
  const alterarNome = (e) => {
    if (desabilitado || envioRef.current) return
    setCampos((c) => ({ ...c, nome: e.target.value.replace(/\s*\n\s*/g, ' ') }))
    setErros((anteriores) => ({ ...anteriores, nome: undefined }))
  }

  // troca a frequência e ajusta a quantidade de campos de horário (mantém os já preenchidos)
  function alterarFrequencia(e) {
    if (desabilitado || envioRef.current) return
    const frequencia = e.target.value
    if (campos.horarios.length > vezesDe(frequencia)) {
      setAvisoHorarios('A frequência foi reduzida. Revise os horários restantes antes de salvar.')
    } else {
      setAvisoHorarios('')
    }
    setErros((anteriores) => ({ ...anteriores, frequencia: undefined, horarios: undefined }))
    setCampos((c) => ({
      ...c,
      frequencia,
      horarios: Array.from({ length: vezesDe(frequencia) }, (_, i) => c.horarios[i] ?? ''),
    }))
  }

  // Formata a digitação em HH:mm e mantém cada horário na sua posição.
  function alterarHorario(indice, valor) {
    if (desabilitado || envioRef.current) return
    const digitos = valor.replace(/\D/g, '').slice(0, 4)
    const horario = digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos
    setErros((anteriores) => ({ ...anteriores, horarios: undefined }))
    setCampos((c) => ({ ...c, horarios: c.horarios.map((h, i) => (i === indice ? horario : h)) }))
  }

  // Valida sem perder dados e só limpa após persistência confirmada.
  // continuar = true -> "Adicionar outro": limpa o formulário e mantém o pop-up aberto
  async function enviar(continuar) {
    if (desabilitado || envioRef.current) return
    const novosErros = validarTratamento(campos)
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) {
      if (novosErros.nome) refNome.current?.focus()
      else if (novosErros.dosagem) refDosagem.current?.focus()
      else if (novosErros.frequencia) refFrequencia.current?.focus()
      else if (novosErros.horarios) refPrimeiroHorario.current?.focus()
      return
    }
    envioRef.current = true
    try {
      const sucesso = await onSalvar({ ...campos, nome: campos.nome.trim(),
        dosagem: campos.dosagem.trim(), horarios: [...campos.horarios] }, { continuar })
      if (sucesso && continuar) {
        focoNomeRef.current = true
        setCampos({ ...TRATAMENTO_VAZIO, horarios: [...TRATAMENTO_VAZIO.horarios] })
        setErros({})
        setAvisoHorarios('')
      }
    } finally {
      envioRef.current = false
    }
  }

  const rodape = editando ? (
    <Button type="submit" form={idFormulario} larguraAuto disabled={desabilitado} className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}>
      Salvar alterações
    </Button>
  ) : (
    <>
      <Button type="button" variante="suave" larguraAuto className={`${BOTAO_CLARO} ${BOTAO_MOBILE}`} disabled={desabilitado} onClick={() => enviar(true)}>
        Adicionar outro
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto disabled={desabilitado} className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}>
        Salvar
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL}>
      <Modal
        aberto
        comDivisores
        largura="max-w-[448px]"
        titulo={editando ? 'Editar tratamento' : 'Novo tratamento'}
        onFechar={onFechar}
        bloquearFechamento={processando}
        rodape={rodape}
      >
        {/* -my-1: o Modal tem 24px de respiro; no Figma são 20px em cima e embaixo */}
        <form
          id={idFormulario}
          noValidate
          className="-my-1 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault() // não deixo a página recarregar ao enviar o formulário
            enviar(false)
          }}
        >
          {/* 46px de altura (12px de respiro + 1 linha + borda); sem nada digitado, no mobile o
              respiro diminui para o exemplo caber em 2 linhas na mesma altura (como no Figma) */}
          <div className={`${AJUSTE_AREA} ${campos.nome ? '[&_textarea]:py-3' : '[&_textarea]:py-0.5 sm:[&_textarea]:py-3'}`}>
            <TextAreaField
              ref={refNome}
              label={<Obrigatorio>Nome do medicamento / tratamento</Obrigatorio>}
              placeholder="Ex: Fluoxetina, Terapia cognitivo-comportamental"
              rows={1}
              required
              maxLength={LIMITE_TEXTO}
              erro={erros.nome}
              disabled={desabilitado}
              value={campos.nome}
              onChange={alterarNome}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault() // Enter salva, como nos outros campos (não quebra a linha)
                  enviar(false)
                }
              }}
            />
          </div>

          <div className={AJUSTE_TEXTO}>
            <TextField
              ref={refDosagem}
              label={<Obrigatorio>Dosagem</Obrigatorio>}
              placeholder="Ex: 50mg, 1 comprimido"
              required
              maxLength={LIMITE_TEXTO}
              autoComplete="off"
              erro={erros.dosagem}
              disabled={desabilitado}
              value={campos.dosagem}
              onChange={alterar('dosagem')}
            />
          </div>

          {/* Frequência: lista nativa com o mesmo visual dos outros campos e a setinha do Figma */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={idFrequencia} className="text-[14px] font-semibold leading-5 text-texto">
              Frequência
            </label>
            <div className="relative">
              <select
                id={idFrequencia}
                ref={refFrequencia}
                disabled={desabilitado}
                aria-invalid={!!erros.frequencia}
                aria-describedby={erros.frequencia ? `${idFrequencia}-erro` : undefined}
                value={campos.frequencia}
                onChange={alterarFrequencia}
                className="h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-borda bg-branco pr-10 pl-5 text-[14px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
              >
                {!FREQUENCIAS.some((f) => f.rotulo === campos.frequencia) && (
                  <option value={campos.frequencia}>{campos.frequencia || 'Frequência não informada'}</option>
                )}
                {FREQUENCIAS.map((f) => (
                  <option key={f.rotulo} value={f.rotulo}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
              <IconeChevronBaixo
                tamanho={14}
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 [stroke-width:2.2] text-texto"
              />
            </div>
          </div>

          {erros.frequencia && <p id={`${idFrequencia}-erro`} className="text-[12px] text-erro">{erros.frequencia}</p>}

          {/* Horário: um campo de hora para cada vez ao dia */}
          <fieldset disabled={desabilitado} aria-describedby={erros.horarios ? idErroHorario : undefined}>
            <legend id={idHorario} className="flex items-center gap-1.5 text-[14px] font-semibold leading-5 text-texto">
              <IconeRelogio tamanho={12} className="text-secundaria" />
              Horário
            </legend>
            <div className="mt-1.5 flex flex-col gap-2">
              {campos.horarios.map((hora, indice) => {
                const rotulo = campos.horarios.length === 1 ? 'Horário' : `Horário ${indice + 1}`
                return (
                  <label key={indice} className="flex items-center gap-[27px] text-[12px] text-secundaria">
                    <span className="min-w-[41px] shrink-0 whitespace-nowrap">{rotulo}</span>
                    {/* Digitação direta com teclado numérico no celular, sem seletor nativo. */}
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="hh:mm"
                      maxLength={5}
                      disabled={desabilitado}
                      ref={indice === 0 ? refPrimeiroHorario : undefined}
                      aria-invalid={!!erros.horarios}
                      value={hora}
                      onChange={(e) => alterarHorario(indice, e.target.value)}
                      className="h-[38px] w-24 rounded-[10px] border border-borda bg-branco px-2 text-[14px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 placeholder:text-secundaria focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
                    />
                  </label>
                )
              })}
            </div>
            {erros.horarios && <p id={idErroHorario} className="mt-1.5 text-[12px] text-erro">{erros.horarios}</p>}
            {avisoHorarios && <p role="status" className="mt-1.5 text-[12px] text-secundaria">{avisoHorarios}</p>}
          </fieldset>

          {/* lembrete: liga/desliga (RF346) */}
          <div className="flex items-center gap-3">
            <span className={AJUSTE_INTERRUPTOR}>
              <Interruptor
                ligado={campos.lembrete}
                desabilitado={desabilitado}
                onAlternar={(ligado) => { if (!desabilitado && !envioRef.current) setCampos((c) => ({ ...c, lembrete: ligado })) }}
                rotulo="Ativar lembretes e notificações"
              />
            </span>
            <span aria-hidden="true" className="flex items-center gap-2 text-[14px] text-texto">
              <IconeSino tamanho={13} className="text-secundaria" />
              Ativar lembretes e notificações
            </span>
          </div>
          {erros.lembrete && <p className="text-[12px] text-erro">{erros.lembrete}</p>}
          {erroOperacao && <p role="alert" className="text-[12px] text-erro">{erroOperacao}</p>}
          {bloqueado && erroOperacao && onRecarregar && (
            <Button type="button" variante="suave" larguraAuto disabled={processando} onClick={onRecarregar}>Atualizar lista</Button>
          )}
        </form>

        {/* aviso do "Adicionar outro": fica dentro do pop-up para aparecer por cima do fundo escuro */}
        {toast && (
          <div className={AJUSTE_TOAST}>
            <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={onFecharToast} />
          </div>
        )}
      </Modal>
    </div>
  )
}
