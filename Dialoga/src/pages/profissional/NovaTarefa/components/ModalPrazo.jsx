// ============================================================
// ModalPrazo
// Pop-up "Adicionar prazo?" que abre ao escolher um paciente (ou "Todos os pacientes")
// no campo Paciente (frame "Selecionar paciente para tarefa - Profissional", RF278–RF279).
// "Sem prazo" adiciona sem data; "Adicionar prazo" exige uma data de hoje em diante.
// Props:
//   nome          -> nome do paciente (ou "todos os pacientes") mostrado no texto
//   onSemPrazo()  -> adiciona sem prazo
//   onAdicionar(data 'AAAA-MM-DD') -> adiciona com o prazo escolhido
//   onFechar()    -> fecha sem adicionar (X, Esc ou clique fora)
// ============================================================
import { useEffect, useRef, useState } from 'react'
import Modal from '../../../../components/Modal'
import { dataLocalISO } from '../../../../utils/formatadores'
import { BOTAO_CLARO, BOTAO_PRIMARIO, CAIXA } from './estilos'

export default function ModalPrazo({ nome, onSemPrazo, onAdicionar, onFechar }) {
  const [data, setData] = useState('')
  const [erro, setErro] = useState('')
  const campoData = useRef(null)
  const hoje = dataLocalISO()

  // ao abrir, o foco vai direto para a data (roda depois do Modal abrir o <dialog>)
  useEffect(() => {
    campoData.current?.focus()
  }, [])

  // confere a data antes de adicionar ('AAAA-MM-DD' compara como texto)
  function adicionar() {
    if (!data) return setErro('Escolha a data do prazo.')
    if (data < hoje) return setErro('O prazo não pode ser anterior a hoje.')
    onAdicionar(data)
  }

  return (
    <Modal
      aberto
      titulo="Adicionar prazo?"
      onFechar={onFechar}
      comDivisores
      largura="max-w-[384px]"
      rodape={
        <>
          <button type="button" className={`${BOTAO_CLARO} px-4`} onClick={onSemPrazo}>Sem prazo</button>
          <button type="button" className={`${BOTAO_PRIMARIO} px-5`} onClick={adicionar}>Adicionar prazo</button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-secundaria">
        Deseja definir um prazo para <strong className="font-bold text-texto">{nome}</strong>?
      </p>
      <input
        ref={campoData}
        type="date"
        aria-label="Data do prazo"
        min={hoje}
        value={data}
        aria-invalid={!!erro}
        onChange={(e) => {
          setData(e.target.value)
          setErro('')
        }}
        className={`${CAIXA} mt-4 h-[46px] ${erro ? 'border-erro' : 'border-borda'}`}
      />
      {erro && <p role="alert" className="mt-1.5 text-[11px] text-erro-texto">{erro}</p>}
    </Modal>
  )
}
