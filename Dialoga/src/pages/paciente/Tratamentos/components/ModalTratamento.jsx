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
// O Figma não mostra erro de campo vazio: sem nome ou dosagem, o clique só leva o foco ao campo vazio.
// No mobile, o campo Nome cresce para 2 linhas quando o exemplo não cabe em uma (como no Figma).
// Props:
//   modo       -> 'novo' | 'editar'
//   tratamento -> tratamento que será editado (só no modo 'editar')
//   toast      -> { aberto, tipo, mensagem }: aviso mostrado por cima do pop-up ("Adicionar outro")
//   onFecharToast() -> fecha esse aviso
//   onFechar() -> fecha o pop-up
//   onSalvar(dados, { continuar }) -> devolve { nome, dosagem, frequencia, horarios, lembrete }
// ============================================================
import { useId, useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Interruptor from '../../../../components/Interruptor'
import Modal from '../../../../components/Modal'
import TextAreaField from '../../../../components/TextAreaField'
import TextField from '../../../../components/TextField'
import Toast from '../../../../components/Toast'
import { AJUSTE_MODAL, AJUSTE_TOAST, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosTratamentos'
import { IconeChevronBaixo, IconeRelogio, IconeSino } from './iconesTratamentos'
import { FREQUENCIAS, TRATAMENTO_VAZIO, vezesDe } from './tratamentosMock'

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
  if (!tratamento) return TRATAMENTO_VAZIO
  const vezes = vezesDe(tratamento.frequencia)
  return {
    nome: tratamento.nome,
    dosagem: tratamento.dosagem,
    frequencia: tratamento.frequencia || TRATAMENTO_VAZIO.frequencia,
    horarios: Array.from({ length: vezes }, (_, i) => tratamento.horarios[i] ?? ''),
    lembrete: tratamento.lembrete,
  }
}

// tira horários vazios e repetidos e deixa em ordem ("22:00", "08:00" -> "08:00", "22:00")
function limparHorarios(horarios) {
  return [...new Set(horarios.filter(Boolean))].sort()
}

export default function ModalTratamento({ modo = 'novo', tratamento, toast, onFecharToast, onFechar, onSalvar }) {
  const editando = modo === 'editar'
  const idFormulario = useId()
  const idFrequencia = useId()
  const idHorario = useId()
  const refNome = useRef(null)
  const refDosagem = useRef(null)
  const [campos, setCampos] = useState(() => estadoInicial(tratamento))

  // atualiza um campo de texto
  const alterar = (campo) => (e) => setCampos((c) => ({ ...c, [campo]: e.target.value }))

  // nome: o campo tem 2 linhas no mobile, mas não aceita quebra de linha (Enter ou texto colado)
  const alterarNome = (e) => setCampos((c) => ({ ...c, nome: e.target.value.replace(/\s*\n\s*/g, ' ') }))

  // troca a frequência e ajusta a quantidade de campos de horário (mantém os já preenchidos)
  function alterarFrequencia(e) {
    const frequencia = e.target.value
    setCampos((c) => ({
      ...c,
      frequencia,
      horarios: Array.from({ length: vezesDe(frequencia) }, (_, i) => c.horarios[i] ?? ''),
    }))
  }

  // troca o valor do horário na posição "indice"
  function alterarHorario(indice, valor) {
    setCampos((c) => ({ ...c, horarios: c.horarios.map((h, i) => (i === indice ? valor : h)) }))
  }

  // confere os obrigatórios e devolve os dados para a página.
  // continuar = true -> "Adicionar outro": limpa o formulário e mantém o pop-up aberto
  function enviar(continuar) {
    if (!campos.nome.trim()) return refNome.current?.focus()
    if (!campos.dosagem.trim()) return refDosagem.current?.focus()

    onSalvar(
      {
        nome: campos.nome.trim(),
        dosagem: campos.dosagem.trim(),
        frequencia: campos.frequencia,
        horarios: limparHorarios(campos.horarios),
        lembrete: campos.lembrete,
      },
      { continuar },
    )
    if (continuar) {
      setCampos(TRATAMENTO_VAZIO)
      refNome.current?.focus()
    }
  }

  const rodape = editando ? (
    <Button type="submit" form={idFormulario} larguraAuto className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}>
      Salvar alterações
    </Button>
  ) : (
    <>
      <Button type="button" variante="suave" larguraAuto className={`${BOTAO_CLARO} ${BOTAO_MOBILE}`} onClick={() => enviar(true)}>
        Adicionar outro
      </Button>
      {/* O rodapé fica fora do <form>; com o atributo "form" o botão continua enviando o formulário */}
      <Button type="submit" form={idFormulario} larguraAuto className={`${BOTAO_PRINCIPAL} ${BOTAO_MOBILE}`}>
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
                value={campos.frequencia}
                onChange={alterarFrequencia}
                className="h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-borda bg-branco pr-10 pl-5 text-[14px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
              >
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

          {/* Horário: um campo de hora para cada vez ao dia */}
          <fieldset aria-describedby={idHorario}>
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
                    {/* vazio e sem foco, a caixa fica limpa como no Figma (sem o "--:--" e o relógio
                        do navegador); clicar em qualquer parte abre o seletor de hora */}
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => alterarHorario(indice, e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className={`h-[38px] w-24 cursor-pointer rounded-[10px] border border-borda bg-branco px-2 text-[14px] outline-0 transition-[border-color,box-shadow] duration-200 focus:border-primaria focus:text-texto focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] [&::-webkit-calendar-picker-indicator]:hidden ${
                        hora ? 'text-texto' : 'text-transparent'
                      }`}
                    />
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* lembrete: liga/desliga (RF346) */}
          <div className="flex items-center gap-3">
            <span className={AJUSTE_INTERRUPTOR}>
              <Interruptor
                ligado={campos.lembrete}
                onAlternar={(ligado) => setCampos((c) => ({ ...c, lembrete: ligado }))}
                rotulo="Ativar lembretes e notificações"
              />
            </span>
            <span aria-hidden="true" className="flex items-center gap-2 text-[14px] text-texto">
              <IconeSino tamanho={13} className="text-secundaria" />
              Ativar lembretes e notificações
            </span>
          </div>
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
