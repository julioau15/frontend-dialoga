// ============================================================
// components/Interruptor
// Chave liga/desliga (ex.: "Lembrete").
// Props:
//   ligado     -> true/false
//   onAlternar -> chamado ao clicar (recebe o novo valor)
//   rotulo     -> nome para leitores de tela
// ============================================================
export default function Interruptor({ ligado, onAlternar, rotulo }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onAlternar(!ligado)}
      className={`relative h-5 w-9 shrink-0 rounded-full cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
        ligado ? 'bg-primaria' : 'bg-borda-forte'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-branco shadow-sm transition-transform duration-200 ${
          ligado ? 'translate-x-4' : ''
        }`}
      />
    </button>
  )
}
