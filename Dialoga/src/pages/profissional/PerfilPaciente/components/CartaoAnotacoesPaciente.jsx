// ============================================================
// CartaoAnotacoesPaciente
// Cartão "Anotações do paciente" da aba Indicadores (RF233), como no Figma:
// registros que o próprio paciente fez no app. Cada um tem o quadrado com o
// emoji do humor (verde Positivo, roxo Moderado, vermelho Atenção), a data,
// as etiquetas (sentimento, energia, humor, pensamentos), a etiqueta azul de
// sono e o texto.
// Props:
//   anotacoes -> [{ id, data: 'DD/MM', humor, etiquetas: [], sono, texto }]
// ============================================================
import Card from '../../../../components/Card'
import { IconeAnotacao } from '../../Pacientes/components/iconesPacientes'
import { FAIXAS } from './textosPerfil'

// emoji do quadrado de cada faixa de humor
const EMOJI_HUMOR = { positivo: '😊', moderado: '😐', atencao: '😟' }

// etiqueta pequena (lilás) e a de sono (azul)
const ETIQUETA = 'inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold'

export default function CartaoAnotacoesPaciente({ anotacoes }) {
  return (
    <Card as="section" aria-label="Anotações do paciente" className="overflow-hidden">
      <div className="flex min-h-[54px] items-center justify-between gap-3 border-b border-borda px-5 py-3">
        <h3 className="flex items-center gap-2.5 text-[14px] font-bold leading-5 text-texto">
          <IconeAnotacao className="text-primaria-texto" />
          Anotações do paciente
        </h3>
        <p className="shrink-0 text-[12px] text-secundaria">{anotacoes.length} registro(s)</p>
      </div>

      {anotacoes.length === 0 ? (
        <p className="px-5 py-6 text-center text-[12px] text-secundaria">Nenhum registro no período.</p>
      ) : (
        <ul className="divide-y divide-borda">
          {anotacoes.map((a) => (
            <li key={a.id} className="flex gap-3 px-5 pt-[15px] pb-[17px]">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-[10px] text-[14px] ${FAIXAS[a.humor].fundo}`}
                  role="img"
                  aria-label={`Humor: ${FAIXAS[a.humor].rotulo}`}
                >
                  {EMOJI_HUMOR[a.humor]}
                </span>
                <span className="mt-1 text-[12px] leading-4 text-secundaria">{a.data}</span>
              </div>

              <div className="min-w-0 flex-1">
                <ul aria-label="Como o paciente se sentiu" className="flex flex-wrap gap-1.5">
                  {a.etiquetas.map((etiqueta) => (
                    <li key={etiqueta} className={`${ETIQUETA} bg-fundo-card text-primaria-texto`}>
                      {etiqueta}
                    </li>
                  ))}
                  <li className={`${ETIQUETA} gap-1 bg-info-fundo text-info-texto`}>
                    <span aria-hidden="true">🌙</span>
                    {a.sono}h sono
                  </li>
                </ul>
                <p className="mt-2 break-words text-[14px] leading-[23px] text-texto">{a.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
