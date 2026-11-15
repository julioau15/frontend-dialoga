// ============================================================
// ModalConfirmarEnvio (profissional)
// Pop-up "Confirmar envio" da Nova tarefa (frame "Enviar ao paciente - Profissional", RF287):
// "Enviar a tarefa <nome> para: <pacientes>?" com Cancelar e Enviar.
// Quando todos os pacientes foram escolhidos, mostra "todos os pacientes".
// Props:
//   aberto, titulo (nome da tarefa)
//   destinatarios -> [{ id, nome }]
//   onCancelar(), onConfirmar()
// ============================================================
import Modal from '../../../../components/Modal'
import { BOTAO_CLARO, BOTAO_PRIMARIO } from './estilos'
import { PACIENTES_MOCK } from './pacientesMock'

// "Ana", "Ana e Bruno", "Ana, Bruno e Carla" ou "todos os pacientes"
function textoDestinatarios(lista) {
  if (lista.length > 1 && lista.length === PACIENTES_MOCK.length) return 'todos os pacientes'
  const nomes = lista.map((p) => p.nome)
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0] ?? ''
}

export default function ModalConfirmarEnvio({ aberto, titulo, destinatarios, onCancelar, onConfirmar }) {
  return (
    <Modal
      aberto={aberto}
      titulo="Confirmar envio"
      onFechar={() => { if (aberto) onCancelar() }}
      comDivisores
      largura="max-w-[384px]"
      rodape={
        <>
          <button type="button" className={`${BOTAO_CLARO} px-4`} onClick={onCancelar}>Cancelar</button>
          <button type="button" className={`${BOTAO_PRIMARIO} px-5`} onClick={onConfirmar}>Enviar</button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-secundaria">
        Enviar a tarefa <strong className="font-bold text-texto">{titulo}</strong> para:{' '}
        <strong className="font-bold text-secundaria-escura">{textoDestinatarios(destinatarios)}</strong>?
      </p>
    </Modal>
  )
}
