// ============================================================
// AvatarPaciente
// Círculo colorido com as iniciais do paciente, como no Figma do Acompanhamento
// (cada paciente com uma cor: roxo, azul, vermelho, laranja ou verde).
// Reaproveita o AvatarIniciais e só troca tamanho e cores pelo contêiner.
// As iniciais são as dos dois primeiros nomes, como no Figma ("Ana Beatriz Ferreira" -> "AB").
// Props:
//   paciente -> { id, nome }
//   tamanho  -> 'medio' (40px, lista) | 'grande' (56px com anel lilás, tela de resposta)
// ============================================================
import AvatarIniciais from '../../../../components/AvatarIniciais'

// cor de fundo pelo id do paciente (classes escritas por extenso para o Tailwind encontrá-las)
const CORES = [
  '[&>div]:bg-primaria',
  '[&>div]:bg-info',
  '[&>div]:bg-erro',
  '[&>div]:bg-alerta',
  '[&>div]:bg-sucesso',
]

const TAMANHOS = {
  medio: '[&>div]:h-10 [&>div]:w-10 [&>div]:text-[14px] [&>img]:h-10 [&>img]:w-10',
  grande:
    '[&>div]:h-14 [&>div]:w-14 [&>div]:text-[20px] [&>div]:ring-2 [&>div]:ring-borda-forte [&>div]:ring-offset-2 [&>img]:h-14 [&>img]:w-14 [&>img]:ring-2 [&>img]:ring-borda-forte [&>img]:ring-offset-2',
}

export default function AvatarPaciente({ paciente, tamanho = 'medio' }) {
  const cor = CORES[(Math.abs(Number(paciente.id) || 1) - 1) % CORES.length]
  // o AvatarIniciais usa o primeiro e o último nome; passando só os dois primeiros sai "AB"
  const doisPrimeiros = paciente.nome.trim().split(/\s+/).slice(0, 2).join(' ')
  return (
    <div className={`shrink-0 [&>div]:font-bold [&>div]:text-branco ${cor} ${TAMANHOS[tamanho]}`}>
      <AvatarIniciais nome={doisPrimeiros} foto={paciente.fotoUrl} />
    </div>
  )
}
