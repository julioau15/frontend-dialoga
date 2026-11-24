// ============================================================
// ModalDisponibilidade
// Pop-up "Adicionar disponibilidade" / "Editar disponibilidade" (frame: Adicionar disponibilidade - Profissional).
// Props:
//   onFechar  -> fecha o pop-up (X, fundo escuro, Esc ou Cancelar)
//   onSalvar  -> recebe { dias: [0..6], inicio, fim, repetir, data } (async; enquanto salva o pop-up trava)
//   erroGeral -> mensagem de conflito (horário já ocupado) ou erro da API, vinda da página
//   inicial   -> item da lista para editar ({ dia, inicio, fim, tipo, data }) ou null para adicionar
//   hoje      -> 'AAAA-MM-DD' (a data específica não pode ser antes de hoje)
// "Repetir semanalmente" ligado: escolhe os dias da semana. Desligado: escolhe uma data específica.
// Obrigatórios: dia(s) ou data, início e fim (fim depois do início).
// ============================================================
import { useState } from 'react'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import Interruptor from '../../../../components/Interruptor'
import { DIAS, validarDisponibilidade } from '../../../../utils/disponibilidade'

const SEG = 1

export default function ModalDisponibilidade({ onFechar, onSalvar, erroGeral, inicial = null, hoje = '' }) {
  const editando = !!inicial
  const [dias, setDias] = useState(() => (inicial && inicial.tipo !== 'unica' ? [inicial.dia] : [SEG]))
  const [inicio, setInicio] = useState(inicial?.inicio ?? '')
  const [fim, setFim] = useState(inicial?.fim ?? '')
  const [repetir, setRepetir] = useState(inicial ? inicial.tipo !== 'unica' : true)
  const [data, setData] = useState(inicial?.tipo === 'unica' ? inicial.data : '')
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  const alternarDia = (id) => {
    setDias((atuais) => (atuais.includes(id) ? atuais.filter((d) => d !== id) : [...atuais, id]))
    setErros((e) => ({ ...e, dias: undefined }))
  }

  async function salvar() {
    const encontrados = validarDisponibilidade({ dias, inicio, fim, repetir, data, hoje })
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0 || salvando) return
    setSalvando(true)
    try {
      await onSalvar({ dias, inicio, fim, repetir, data })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[320px]"
      titulo={editando ? 'Editar disponibilidade' : 'Adicionar disponibilidade'}
      onFechar={onFechar}
      bloquearFechamento={salvando}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto disabled={salvando} onClick={onFechar}>Cancelar</Button>
          <Button type="button" larguraAuto carregando={salvando} onClick={salvar}>Salvar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {repetir ? (
          <div role="group" aria-labelledby="rotulo-dias" className="flex flex-col gap-1.5 text-left">
            <span id="rotulo-dias" className="text-[11px] font-bold text-texto">Dia da semana</span>
            <div className="flex flex-wrap gap-1.5">
              {DIAS.map(({ id, sigla, nome }) => {
                const marcado = dias.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={marcado}
                    aria-label={nome}
                    onClick={() => alternarDia(id)}
                    className={`h-8 min-w-11 px-3 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                      marcado ? 'bg-primaria border-primaria text-branco' : 'bg-branco border-borda-forte text-secundaria hover:bg-fundo-suave-2'
                    }`}
                  >
                    {sigla}
                  </button>
                )
              })}
            </div>
            {erros.dias && <span className="text-[11px] text-erro">{erros.dias}</span>}
          </div>
        ) : (
          <TextField
            label="Data"
            type="date"
            min={hoje || undefined}
            value={data}
            onChange={(e) => { setData(e.target.value); setErros((x) => ({ ...x, data: undefined })) }}
            erro={erros.data}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Início" type="time" value={inicio} onChange={(e) => { setInicio(e.target.value); setErros((x) => ({ ...x, inicio: undefined })) }} erro={erros.inicio} />
          <TextField label="Fim" type="time" value={fim} onChange={(e) => { setFim(e.target.value); setErros((x) => ({ ...x, fim: undefined })) }} erro={erros.fim} />
        </div>

        <div className="flex items-center gap-2">
          <Interruptor
            ligado={repetir}
            onAlternar={(valor) => { setRepetir(valor); setErros({}) }}
            rotulo="Repetir semanalmente"
          />
          <span className="text-[11px] font-bold text-texto">Repetir semanalmente</span>
        </div>
        {!repetir && <p className="-mt-2 text-[11px] text-secundaria">Desligado: a disponibilidade vale só na data escolhida.</p>}

        {erroGeral && <p role="alert" className="text-[11px] text-erro">{erroGeral}</p>}
      </div>
    </Modal>
  )
}
