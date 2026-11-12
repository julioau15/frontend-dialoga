// ============================================================
// GradeHoras
// Visões "Semana" (7 colunas) e "Dia" (1 coluna): linhas de horário com as
// consultas encaixadas na hora certa.
// Props:
//   dias      -> lista de datas 'AAAA-MM-DD' (7 na semana, 1 no dia)
//   consultas -> todas as consultas (a grade filtra pelos dias mostrados)
// A grade vai das 07:00 até 14:00 (como no Figma) e cresce se houver consulta mais tarde.
// ============================================================
import { IconeRelogioPequeno } from '../../../../components/IconesAgenda'
import { dataTituloCompleta, nomeDiaCurto, numeroDoDia, rotuloHora } from '../../../../utils/datasAgendaPaciente'

const HORA_INICIAL = 7
const HORA_FINAL_PADRAO = 14
const ALTURA_LINHA = 52 // px

function BlocoConsulta({ consulta }) {
  const minutos = Number(consulta.hora.split(':')[1])
  return (
    <div
      className="absolute inset-x-0.5 z-10 overflow-hidden rounded-md border-l-[3px] border-primaria bg-borda-forte px-1.5 py-1"
      style={{ top: (minutos / 60) * ALTURA_LINHA + 2, minHeight: 36 }}
    >
      <p className="text-[9px] font-bold leading-tight text-texto">{consulta.profissional}</p>
      <p className="flex items-center gap-1 text-[9px] text-secundaria-escura">
        <IconeRelogioPequeno tamanho={8} />
        {consulta.hora}
      </p>
    </div>
  )
}

export default function GradeHoras({ dias, consultas }) {
  const modoDia = dias.length === 1
  const doPeriodo = consultas.filter((c) => dias.includes(c.data))
  const ultimaHora = Math.max(HORA_FINAL_PADRAO, ...doPeriodo.map((c) => Number(c.hora.split(':')[0])))
  const horas = Array.from({ length: ultimaHora - HORA_INICIAL + 1 }, (_, i) => HORA_INICIAL + i)
  const colunas = { gridTemplateColumns: `44px repeat(${dias.length}, minmax(0, 1fr))` }

  return (
    <div className="overflow-x-auto">
      <div className={modoDia ? '' : 'min-w-[560px]'}>
        {modoDia ? (
          <div className="border-b border-borda bg-fundo-suave-2 px-4 py-2">
            <p className="text-[11px] font-bold text-texto">{dataTituloCompleta(dias[0])}</p>
            <p className="text-[10px] text-secundaria">{doPeriodo.length} consulta(s)</p>
          </div>
        ) : (
          <div className="grid border-b border-borda" style={colunas}>
            <span />
            {dias.map((dia) => (
              <div key={dia} className="flex flex-col items-center gap-0.5 border-l border-borda py-2">
                <span className="text-[10px] text-secundaria">{nomeDiaCurto(dia)}</span>
                <span className="text-[12px] font-extrabold text-texto">{numeroDoDia(dia)}</span>
              </div>
            ))}
          </div>
        )}

        {horas.map((hora) => (
          <div key={hora} className="grid border-b border-borda last:border-b-0" style={{ ...colunas, height: ALTURA_LINHA }}>
            <span className="pr-2 pt-1 text-right text-[10px] text-secundaria">{rotuloHora(hora)}</span>
            {dias.map((dia) => (
              <div key={dia} className="relative border-l border-borda">
                {doPeriodo
                  .filter((c) => c.data === dia && Number(c.hora.split(':')[0]) === hora)
                  .map((c) => <BlocoConsulta key={c.id} consulta={c} />)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
