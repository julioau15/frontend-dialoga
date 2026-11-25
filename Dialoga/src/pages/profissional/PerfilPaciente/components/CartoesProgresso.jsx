// ============================================================
// CartoesProgresso
// Dois cartões de barras da aba Indicadores, como no Figma:
//   - CartaoConclusao  -> "Conclusão de tarefas" (Respondida / Em andamento, "2 de 3") (RF234);
//   - CartaoAderencia  -> "Aderência ao tratamento" (% de cada remédio; verde a partir
//                         de 90%, laranja abaixo) (RF235).
// A barra é um <div role="progressbar">, com o valor para leitores de tela.
// O BarraProgresso compartilhado não foi usado porque tem outra altura e outra cor.
// ============================================================
import Card from '../../../../components/Card'
import CabecalhoCartao from './CabecalhoCartao'
import { IconeQuadradoCheck } from './iconesPerfil'

// barra arredondada: trilho lilás e preenchimento na cor pedida
function Barra({ percentual, cor, altura, rotulo }) {
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={Math.round(percentual)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-borda ${altura}`}
    >
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${percentual}%` }} />
    </div>
  )
}

// RF234: tarefas respondidas e em andamento sobre o total enviado
export function CartaoConclusao({ conclusao }) {
  const linhas = [
    { id: 'respondida', rotulo: 'Respondida', quantidade: conclusao.respondidas, cor: 'bg-sucesso bg-linear-to-r from-[#34D399] to-sucesso' },
    { id: 'andamento', rotulo: 'Em andamento', quantidade: conclusao.emAndamento, cor: 'bg-info-clara bg-linear-to-r from-[#93C5FD] to-info-clara' },
  ]

  return (
    <Card as="section" aria-label="Conclusão de tarefas" className="px-5 pt-[21px] pb-[21px]">
      <CabecalhoCartao
        icone={<IconeQuadradoCheck tamanho={15} className="text-primaria-texto" />}
        titulo="Conclusão de tarefas"
        subtitulo={`Total de tarefas enviadas: ${conclusao.total}`}
      />
      <ul className="mt-[17px] flex flex-col gap-3">
        {linhas.map((l) => (
          <li key={l.id}>
            <div className="flex justify-between gap-3 text-[12px] leading-4">
              <span className="font-semibold text-texto">{l.rotulo}</span>
              <span className="text-secundaria">
                {l.quantidade} de {conclusao.total}
              </span>
            </div>
            <div className="mt-1">
              <Barra
                percentual={conclusao.total ? (l.quantidade / conclusao.total) * 100 : 0}
                cor={l.cor}
                altura="h-2"
                rotulo={`${l.rotulo}: ${l.quantidade} de ${conclusao.total}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// RF235: porcentagem de doses registradas de cada remédio
// (percentual null = sem registros de dose disponíveis: mostra o remédio sem a barra)
export function CartaoAderencia({ aderencia }) {
  return (
    <Card as="section" aria-label="Aderência ao tratamento" className="px-5 pt-[21px] pb-[21px]">
      <CabecalhoCartao icone={<span aria-hidden="true">💊</span>} titulo="Aderência ao tratamento" subtitulo="Dados informados pelo paciente" />
      <ul className="mt-4 flex flex-col gap-4">
        {aderencia.map((r) => {
          if (r.percentual == null) {
            return (
              <li key={r.id} className="flex justify-between gap-3 text-[14px] leading-5">
                <span className="text-texto">{r.nome}</span>
                <span className="text-[12px] text-secundaria">Sem registros de dose</span>
              </li>
            )
          }
          const bom = r.percentual >= 90
          return (
            <li key={r.id}>
              <div className="flex justify-between gap-3 text-[14px] leading-5">
                <span className="text-texto">{r.nome}</span>
                {/* tom escuro do verde/laranja: texto de 14px passa no contraste mínimo (AA) */}
                <span className={`font-bold ${bom ? 'text-sucesso-escura-texto' : 'text-alerta-escura-texto'}`}>{r.percentual}%</span>
              </div>
              <div className="mt-1.5">
                <Barra percentual={r.percentual} cor={bom ? 'bg-sucesso bg-linear-to-r from-[#34D399] to-sucesso' : 'bg-alerta bg-linear-to-r from-[#FBBF24] to-alerta'} altura="h-2.5" rotulo={`${r.nome}: ${r.percentual}%`} />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
