// ============================================================
// IndicadoresHoje
// Card com 4 barras (energia, sentimento, humor, pensamentos).
// Cor da barra: verde (positivo), roxo (moderado) ou vermelho (atenção).
// Props:
//   indicadores      -> [{ id, emoji, nome, valor (0 a 100) }]
//   onRegistrarHumor -> função chamada ao clicar em "Registrar humor"
// Gráfico feito só com HTML/CSS (sem biblioteca).
// ============================================================
import Card from '../../../../../components/Card'
import Icone from '../../../../../components/Icone'
import { dataPorExtenso } from '../../../../../utils/datas'

// Regra de cor — AJUSTE os limites conforme a regra de negócio
const NIVEIS = [
  { minimo: 60, classe: 'bg-sucesso' }, // positivo
  { minimo: 35, classe: 'bg-primaria' }, // moderado
  { minimo: 0, classe: 'bg-erro' }, // atenção
]
const corDaBarra = (valor) => NIVEIS.find((n) => valor >= n.minimo)?.classe ?? 'bg-erro'

// Teto da escala: deixa espaço livre acima das barras, como no design
const TETO = 160

const LEGENDA = [
  { texto: 'Positivo', classe: 'bg-sucesso' },
  { texto: 'Moderado', classe: 'bg-primaria' },
  { texto: 'Atenção', classe: 'bg-erro' },
]

export default function IndicadoresHoje({ indicadores, onRegistrarHumor }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-texto">
            <Icone nome="atividade" tamanho={16} className="text-primaria" />
            Indicadores de hoje
          </h2>
          <p className="mt-1 text-xs text-secundaria">{dataPorExtenso()}</p>
        </div>

        <button
          type="button"
          onClick={onRegistrarHumor}
          className="cursor-pointer rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-branco shadow-md transition-colors hover:bg-primaria-escura focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <span aria-hidden="true">😊 </span>Registrar humor
        </button>
      </div>

      {/* Barras */}
      <ul className="mt-4 grid grid-cols-4 gap-2 sm:gap-6">
        {indicadores.map(({ id, emoji, nome, valor }) => (
          <li key={id} className="flex flex-col">
            <div className="flex h-44 items-end sm:h-52" role="img" aria-label={`${nome}: ${valor}%`}>
              <div
                className={`w-full rounded-t-[14px] ${corDaBarra(valor)}`}
                style={{ height: `${(valor / TETO) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex flex-col items-center gap-0.5 text-center text-xs text-secundaria">
              <span aria-hidden="true">{emoji}</span>
              <span className="truncate">{nome}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Legenda */}
      <ul className="mt-4 flex justify-center gap-4 text-xs text-secundaria">
        {LEGENDA.map(({ texto, classe }) => (
          <li key={texto} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${classe}`} aria-hidden="true" />
            {texto}
          </li>
        ))}
      </ul>
    </Card>
  )
}
