// ============================================================
// CartaoEmocionais
// Cartão "Indicadores emocionais" da aba Indicadores (RF229, RF230), como no Figma:
// quatro barras (Energia, Sentimento, Humor, Pensamentos) com a altura proporcional
// ao valor, a cor da faixa (verde Positivo, roxo Moderado, vermelho Atenção),
// a etiqueta em cima de cada barra (ex.: "Alta"), o emoji, o nome, o valor ("2.1/3")
// e a legenda das faixas.
// Props:
//   emocionais -> { registros, itens: [{ id, rotulo, emoji, valor, maximo, faixa, etiqueta }] }
//   dias       -> quantidade de dias do período (texto "Média dos últimos N dias")
// ============================================================
import Card from '../../../../components/Card'
import CabecalhoCartao from './CabecalhoCartao'
import { IconeAtividade } from './iconesPerfil'
import { FAIXAS } from './textosPerfil'

const ALTURA_MAXIMA = 90 // altura (px) da barra com o valor máximo

// fundo da etiqueta em cima da barra: no verde uso o tom escuro, para o texto
// branco de 12px passar no contraste mínimo (AA)
const FUNDO_ETIQUETA = { positivo: 'bg-sucesso-escura', moderado: 'bg-primaria', atencao: 'bg-erro' }

export default function CartaoEmocionais({ emocionais, dias }) {
  return (
    <Card as="section" aria-label="Indicadores emocionais" className="px-5 pt-[21px] pb-[21px]">
      <CabecalhoCartao
        icone={<IconeAtividade tamanho={15} className="text-primaria" />}
        titulo="Indicadores emocionais"
        subtitulo={`Média dos últimos ${dias} dias · dados do paciente`}
        direita={<p className="text-[12px] leading-5 text-secundaria">{emocionais.registros} registro(s)</p>}
      />

      <ul className="mt-[69px] grid grid-cols-4 gap-3">
        {emocionais.itens.map((item) => (
          <li key={item.id} className="flex flex-col items-center text-center">
            <span
              className={`inline-flex h-5 items-center rounded-full px-2.5 text-[12px] font-semibold text-branco ${FUNDO_ETIQUETA[item.faixa]}`}
            >
              {item.etiqueta}
            </span>
            {/* barra: a altura é o valor / máximo; o leitor de tela lê o valor no texto abaixo */}
            <div aria-hidden="true" className="mt-2.5 flex h-[90px] w-full items-end">
              <div
                className={`w-full rounded-t-md ${FAIXAS[item.faixa].fundo}`}
                style={{ height: `${Math.round((item.valor / item.maximo) * ALTURA_MAXIMA)}px` }}
              />
            </div>
            <span aria-hidden="true" className="mt-0.5 text-[14px] leading-5">
              {item.emoji}
            </span>
            <p className="mt-1 text-[12px] leading-4 text-secundaria">{item.rotulo}</p>
            <p className="mt-1.5 text-[12px] font-bold leading-4 text-texto">
              {item.valor.toFixed(1)}/{item.maximo}
              <span className="sr-only"> ({FAIXAS[item.faixa].rotulo})</span>
            </p>
          </li>
        ))}
      </ul>

      {/* legenda das faixas */}
      <ul aria-label="Legenda das faixas" className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {Object.entries(FAIXAS).map(([id, faixa]) => (
          <li key={id} className="flex items-center gap-[7px] text-[12px] leading-4 text-secundaria">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${faixa.fundo}`} />
            {faixa.rotulo}
          </li>
        ))}
      </ul>
    </Card>
  )
}
