// ============================================================
// CartaoTarefasPeriodo
// "Tarefas deste período" (RF208–RF210), como no Figma: uma linha por tarefa com o título,
// o prazo, a barrinha de progresso (some quando está concluída) e o status (Selo),
// e o link "Ver todas" para a tela de Tarefas.
// Usa as tarefas do paciente vindas da API e os status da tela de Tarefas do paciente.
// Desktop: barra e status à direita. Mobile: barra e status embaixo do prazo.
// Props:
//   periodo -> { inicio, fim } ('AAAA-MM-DD'); entram as tarefas com prazo no período
//   tarefas -> tarefas do paciente (formato de tarefaApiParaTela)
// ============================================================
import { Link } from 'react-router-dom'
import Card from '../../../../components/Card'
import { IconeSetaDireita } from '../../../../components/IconesAgenda'
import Selo from '../../../../components/Selo'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import { STATUS } from '../../Tarefas/components/statusTarefa'
import { IconeTarefa } from './iconesRelatorios'

// selo do Figma: texto de 12px (o Selo compartilhado não muda)
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:text-[12px] [&>span]:leading-4'

// tarefas: do paciente, no formato da tela de Tarefas ({ id, titulo, prazo, prazoIso, status, progresso })
export default function CartaoTarefasPeriodo({ periodo, tarefas: todas }) {
  const fim = periodo.fim ?? periodo.inicio
  // só as tarefas com prazo dentro do período
  const tarefas = todas.filter((t) => t.prazoIso && t.prazoIso >= periodo.inicio && t.prazoIso <= fim)

  return (
    <Card as="section" aria-label="Tarefas deste período" className="overflow-hidden rounded-2xl! shadow-[0_2px_4px_var(--color-borda)]!">
      <div className="flex min-h-[52px] items-center px-5 py-3 sm:min-h-[50px] sm:pr-[22px] xl:min-h-[53px]">
        <div className="w-full">
          <CabecalhoCartao
            icone={<IconeTarefa tamanho={16} className="text-primaria" />}
            titulo="Tarefas deste período"
            direita={
              // RF210: leva para a lista completa
              <Link
                to="/paciente/tarefas"
                className="inline-flex items-center gap-1 rounded-sm text-[12px] font-semibold leading-5 text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
              >
                Ver todas
                <IconeSetaDireita tamanho={12} />
              </Link>
            }
          />
        </div>
      </div>

      {tarefas.length === 0 ? (
        <p className="border-t border-borda px-5 py-6 text-center text-[13px] text-secundaria">Nenhuma tarefa com prazo no período.</p>
      ) : (
        <ul>
          {tarefas.map((t) => {
            const status = STATUS[t.status] ?? STATUS.pendente
            return (
              <li
                key={t.id}
                className="flex flex-col gap-2 border-t border-borda px-5 pt-3 pb-[11px] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[14px] leading-5 text-texto">{t.titulo}</p>
                  <p className="text-[12px] leading-4 text-secundaria">Prazo: {t.prazo}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {status.barra && (
                    <div
                      role="progressbar"
                      aria-label={`Progresso de ${t.titulo}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={t.progresso}
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-borda sm:w-20 sm:flex-none"
                    >
                      <div className="h-full rounded-full bg-primaria" style={{ width: `${t.progresso}%` }} />
                    </div>
                  )}
                  <span className={`${AJUSTE_SELO} ml-auto`}>
                    <Selo tom={status.tom}>{status.rotulo}</Selo>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
