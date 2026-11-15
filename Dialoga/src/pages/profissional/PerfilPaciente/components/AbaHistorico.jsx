// ============================================================
// AbaHistorico
// Histórico de tarefas enviadas ao paciente (RF219, RF309), como no Figma:
// cartão "Tarefas enviadas ao paciente" com o total e, em cada tarefa, o título,
// o selo de status, "Enviada em" (com relógio), "Prazo", "3/4 respostas", a
// porcentagem e a barra roxa (todas as barras com a mesma largura).
// No mobile, "Prazo" desce para a linha de baixo quando não cabe.
// Clicar numa tarefa abre a resposta dela (/profissional/tarefas/acompanhamento/:idEnvio);
// a tela de resposta recebe o caminho de volta e mostra "Voltar ao perfil".
// Sem acesso aprovado (ou paciente externo), mostra o BlocoSemAcesso no lugar.
// Props:
//   paciente          -> perfil (usa id, acesso e historico)
//   onSolicitarAcesso -> clique em "Solicitar acesso" no bloco sem acesso
// ============================================================
import { Link } from 'react-router-dom'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeRelogio } from '../../../../components/Icones'
import { formatarDataBR } from '../../../../utils/formatadores'
import BlocoSemAcesso from './BlocoSemAcesso'
import { AJUSTE_SELO } from './estilosPerfil'
import { STATUS_TAREFA } from './textosPerfil'

export default function AbaHistorico({ paciente, onSolicitarAcesso }) {
  if (paciente.acesso !== 'aprovado') {
    return <BlocoSemAcesso acesso={paciente.acesso} onSolicitarAcesso={onSolicitarAcesso} />
  }

  const tarefas = paciente.historico

  return (
    <Card as="section" aria-label="Tarefas enviadas ao paciente" className="overflow-hidden">
      <div className="flex min-h-[54px] items-center justify-between gap-3 border-b border-borda px-5 py-3">
        <h3 className="text-[14px] font-bold leading-5 text-texto">Tarefas enviadas ao paciente</h3>
        <p className="shrink-0 text-[12px] text-secundaria">{tarefas.length} total</p>
      </div>

      {tarefas.length === 0 ? (
        <p className="px-5 py-6 text-center text-[12px] text-secundaria">Nenhuma tarefa enviada a este paciente.</p>
      ) : (
        <ul className="divide-y divide-borda">
          {tarefas.map((t) => {
            const status = STATUS_TAREFA[t.status] ?? STATUS_TAREFA.nao_preenchido
            const percentual = t.perguntas ? Math.round((t.respondidas / t.perguntas) * 100) : 0
            return (
              // relative: base do link "esticado"; ao passar o mouse, o fundo fica lilás bem claro
              <li key={t.id} className="relative px-5 pt-4 pb-[17px] transition-colors duration-200 hover:bg-fundo-suave-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 break-words text-[14px] font-bold leading-5 text-texto">
                    {/* link "esticado": o after:absolute cobre a tarefa toda, então clicar em qualquer
                        parte dela abre a resposta (o leitor de tela lê só o título como link) */}
                    <Link
                      to={`/profissional/tarefas/acompanhamento/${t.idEnvio}`}
                      state={{ voltarPara: `/profissional/pacientes/${paciente.id}` }}
                      aria-label={`Ver respostas de ${t.titulo}`}
                      className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
                    >
                      {t.titulo}
                    </Link>
                  </p>
                  <span className={AJUSTE_SELO}>
                    <Selo tom={status.tom}>{status.rotulo}</Selo>
                  </span>
                </div>

                <p className="mt-[3px] flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] leading-4 text-secundaria">
                  <span className="flex items-center gap-1">
                    <IconeRelogio tamanho={11} className="[stroke-width:1.8]" />
                    Enviada em {formatarDataBR(t.enviadaEm)}
                  </span>
                  <span>Prazo: {formatarDataBR(t.prazo)}</span>
                </p>

                <div className="mt-2 max-w-[584px]">
                  <div className="flex justify-between gap-3 text-[12px] leading-4">
                    <span className="text-secundaria">
                      {t.respondidas}/{t.perguntas} respostas
                    </span>
                    <span className="font-bold text-texto">{percentual}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Respostas de ${t.titulo}`}
                    aria-valuenow={percentual}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-[5px] h-1.5 overflow-hidden rounded-full bg-borda"
                  >
                    <div className="h-full rounded-full bg-primaria" style={{ width: `${percentual}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
