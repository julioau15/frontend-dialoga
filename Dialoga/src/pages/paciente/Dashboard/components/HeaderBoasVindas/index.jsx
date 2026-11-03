// ============================================================
// HeaderBoasVindas
// Faixa em degradê (lavanda -> rosa) com a data e a saudação.
// Props: nome (primeiro nome do paciente)
// O degradê vem do token --background-image-principal (bg-principal).
// ============================================================
import { capitalizarPalavras, dataPorExtenso } from '../../../../../utils/datas'

export default function HeaderBoasVindas({ nome }) {
  return (
    <header className="rounded-2xl bg-principal px-6 py-6">
      <p className="text-sm font-bold text-primaria">{capitalizarPalavras(dataPorExtenso())}</p>
      <h1 className="mt-2 text-2xl font-extrabold text-texto">
        Olá{nome ? `, ${nome}` : ''}! <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-2 text-sm text-secundaria">Como você está se sentindo hoje?</p>
    </header>
  )
}
