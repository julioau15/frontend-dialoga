// ============================================================
// ModalConfirmarEnvio (profissional)
// Pop-up "Confirmar envio" da Nova tarefa (frame "Enviar ao paciente - Profissional", RF287):
// "Enviar a tarefa <nome> para: <pacientes>?" com Cancelar e Enviar.
// Quando todos os pacientes que podem receber tarefas (sem os externos) foram escolhidos,
// mostra "todos os pacientes".
// Props:
//   aberto, titulo (nome da tarefa)
//   destinatarios -> [{ id, nome }]
//   totalPacientes -> quantos pacientes podem receber tarefa (para dizer "todos os pacientes")
//   enviando      -> true enquanto a API grava (bloqueia os botões)
//   onCancelar(), onConfirmar()
// ============================================================
import Modal from '../../../../components/Modal'
import { BOTAO_CLARO, BOTAO_PRIMARIO } from './estilos'

// "Ana", "Ana e Bruno", "Ana, Bruno e Carla" ou "todos os pacientes"
function textoDestinatarios(lista, totalPacientes) {
  if (lista.length > 1 && lista.length === totalPacientes) return 'todos os pacientes'
  const nomes = lista.map((p) => p.nome)
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0] ?? ''
}

export default function ModalConfirmarEnvio({ aberto, titulo, destinatarios, totalPacientes = 0, enviando = false, onCancelar, onConfirmar }) {
  return (
    <Modal
      aberto={aberto}
      titulo="Confirmar envio"
      onFechar={() => { if (aberto && !enviando) onCancelar() }}
      comDivisores
      largura="max-w-[384px]"
      rodape={
        <>
          <button type="button" className={`${BOTAO_CLARO} px-4`} onClick={onCancelar} disabled={enviando}>Cancelar</button>
          <button type="button" className={`${BOTAO_PRIMARIO} px-5`} onClick={onConfirmar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-secundaria">
        Enviar a tarefa <strong className="font-bold text-texto">{titulo}</strong> para:{' '}
        <strong className="font-bold text-secundaria-escura">{textoDestinatarios(destinatarios, totalPacientes)}</strong>?
      </p>
    </Modal>
  )
}
