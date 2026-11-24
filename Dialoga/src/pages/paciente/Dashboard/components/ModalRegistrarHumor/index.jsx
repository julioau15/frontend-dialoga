// ============================================================
// ModalRegistrarHumor
// Pop-up "Como você está hoje?" do botão "Registrar humor" do Dashboard.
// Mesmos campos do formulário de humor do primeiro acesso (sentimento, energia, humor,
// horas de sono, relato e pensamentos), gravados em POST /pacientes/me/registros-humor.
// Só um registro por dia (RN10): ao abrir, confere se já existe o de hoje.
// Props:
//   aberto   -> mostra o pop-up
//   onFechar -> X, Esc, fundo escuro ou Cancelar
//   onSalvo  -> chamado depois de gravar (o Dashboard recarrega e mostra o aviso)
// ============================================================
import { useEffect, useState } from 'react'
import Button from '../../../../../components/Button'
import Chip from '../../../../../components/Chip'
import Modal from '../../../../../components/Modal'
import TextAreaField from '../../../../../components/TextAreaField'
import TextField from '../../../../../components/TextField'
import { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL, LARGURA_FORMULARIO } from '../../../../../components/Modal/estilosModal'
import { useAuth } from '../../../../../contexts/AuthContext'
import { buscarRegistroHumorDoDia, salvarRegistroHumor } from '../../../../../services/pacienteService'
import { hojeNoBrasil } from '../../../../../utils/datasAgenda'
import { LIMITES_PERSONALIZACAO, mascararHorasSono, validarHumor } from '../../../../../utils/validators'

// mesmas opções do formulário do primeiro acesso
const SENTIMENTOS = ['Feliz', 'Triste', 'Ansioso', 'Irritado', 'Calmo', 'Cansado']
const ENERGIA = ['Baixa', 'Média', 'Alta']
const HUMOR = ['Muito ruim', 'Ruim', 'Neutro', 'Bom', 'Muito bom']
const PENSAMENTOS = ['Positivos', 'Negativos', 'Neutros']

const VAZIO = { sentimento: '', energia: '', humorDia: '', horasSono: '', relato: '', pensamento: '' }

// grupo de opções com título (<fieldset> + <legend>) e a mensagem de erro embaixo
function Grupo({ titulo, erro, className = 'flex flex-wrap gap-2', children }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0 text-left">
      <legend className="mb-2 p-0 text-[13px] font-semibold text-texto">{titulo}</legend>
      <div className={className}>{children}</div>
      {erro && <p className="mt-1.5 text-[12px] text-erro">{erro}</p>}
    </fieldset>
  )
}

// formulário: montado só com o pop-up aberto (assim ele sempre começa limpo)
function Formulario({ token, onFechar, onSalvo }) {
  const [campos, setCampos] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  // 'verificando' | 'livre' | 'ja_registrado' | 'erro'
  const [situacao, setSituacao] = useState({ estado: 'verificando', mensagem: '' })

  // RN10: confere se o humor de hoje já foi registrado
  useEffect(() => {
    const controle = new AbortController()
    buscarRegistroHumorDoDia(token, hojeNoBrasil(), controle.signal)
      .then((registro) => setSituacao({ estado: registro ? 'ja_registrado' : 'livre', mensagem: '' }))
      .catch((e) => {
        if (!controle.signal.aborted) setSituacao({ estado: 'erro', mensagem: e.message })
      })
    return () => controle.abort()
  }, [token])

  const alterar = (campo, valor) => {
    setCampos((c) => ({ ...c, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
  }

  async function salvar() {
    const encontrados = validarHumor(campos)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setSalvando(true)
    try {
      await salvarRegistroHumor(token, {
        sentimento: campos.sentimento,
        energia: campos.energia,
        humor: campos.humorDia,
        padrao_pensamentos: campos.pensamento,
        horas_sono: Number(campos.horasSono),
        relato: campos.relato.trim() || null,
      })
      onSalvo()
    } catch (e) {
      // 409: o humor de hoje foi registrado enquanto o pop-up estava aberto (RN10)
      if (e.status === 409) setSituacao({ estado: 'ja_registrado', mensagem: '' })
      else setErroGeral(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const livre = situacao.estado === 'livre'

  const rodape = livre ? (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} disabled={salvando} onClick={onFechar}>Cancelar</Button>
      <Button type="button" larguraAuto className={BOTAO_PRINCIPAL} carregando={salvando} onClick={salvar}>
        {salvando ? 'Salvando...' : 'Salvar registro'}
      </Button>
    </>
  ) : (
    <Button type="button" larguraAuto className={BOTAO_PRINCIPAL} onClick={onFechar}>Fechar</Button>
  )

  return (
    <div className={AJUSTE_MODAL}>
      {/* enquanto salva, X, Esc e clique fora não fecham (senão o pop-up some e o humor é gravado mesmo assim) */}
      <Modal
        aberto
        comDivisores
        largura={LARGURA_FORMULARIO}
        titulo="Como você está hoje?"
        onFechar={onFechar}
        bloquearFechamento={salvando}
        rodape={rodape}
      >
        {situacao.estado === 'verificando' && (
          <p role="status" className="text-[14px] text-secundaria">Verificando o registro de hoje...</p>
        )}
        {situacao.estado === 'erro' && <p role="alert" className="text-[14px] text-erro">{situacao.mensagem}</p>}
        {situacao.estado === 'ja_registrado' && (
          <p role="status" className="text-[14px] leading-5 text-secundaria">
            Você já registrou seu humor hoje. Volte amanhã para um novo registro. 💜
          </p>
        )}

        {livre && (
          <div className="flex flex-col gap-4">
            <p className="-mt-1 text-[13px] text-secundaria">Registre como você está se sentindo neste momento.</p>

            <Grupo titulo="Sentimento do dia" erro={erros.sentimento}>
              {SENTIMENTOS.map((opcao) => (
                <Chip key={opcao} selecionado={campos.sentimento === opcao} onClick={() => alterar('sentimento', opcao)}>
                  {opcao}
                </Chip>
              ))}
            </Grupo>

            <Grupo titulo="Energia do dia" erro={erros.energia} className="grid grid-cols-3 gap-2">
              {ENERGIA.map((opcao) => (
                <Chip key={opcao} className="w-full" selecionado={campos.energia === opcao} onClick={() => alterar('energia', opcao)}>
                  {opcao}
                </Chip>
              ))}
            </Grupo>

            <Grupo titulo="Humor do dia" erro={erros.humorDia}>
              {HUMOR.map((opcao) => (
                <Chip key={opcao} selecionado={campos.humorDia === opcao} onClick={() => alterar('humorDia', opcao)}>
                  {opcao}
                </Chip>
              ))}
            </Grupo>

            <TextField
              label="Quantas horas você dormiu?"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Ex: 7.5"
              value={campos.horasSono}
              erro={erros.horasSono}
              onChange={(e) => alterar('horasSono', mascararHorasSono(e.target.value))}
            />

            <TextAreaField
              label={<>Conte algo importante que aconteceu hoje <span className="text-[11px] font-normal text-secundaria">(opcional)</span></>}
              placeholder="Descreva um acontecimento relevante do seu dia..."
              maxLength={LIMITES_PERSONALIZACAO.RELATO}
              value={campos.relato}
              erro={erros.relato}
              onChange={(e) => alterar('relato', e.target.value)}
            />

            <Grupo titulo="Pensamentos" erro={erros.pensamento} className="flex flex-wrap gap-x-5 gap-y-2">
              {PENSAMENTOS.map((opcao) => (
                <label key={opcao} className="flex cursor-pointer items-center gap-1.5 text-[13px] text-secundaria">
                  <input
                    className="h-3.5 w-3.5 cursor-pointer accent-primaria"
                    type="radio"
                    name="pensamento-dashboard"
                    value={opcao}
                    checked={campos.pensamento === opcao}
                    onChange={() => alterar('pensamento', opcao)}
                  />
                  {opcao}
                </label>
              ))}
            </Grupo>

            {erroGeral && <p role="alert" className="text-[12px] text-erro">{erroGeral}</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function ModalRegistrarHumor({ aberto, onFechar, onSalvo }) {
  const { auth } = useAuth()
  if (!aberto) return null
  return <Formulario token={auth?.token} onFechar={onFechar} onSalvo={onSalvo} />
}
