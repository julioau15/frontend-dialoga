// ============================================================
// pages/paciente/Dashboard/Dashboard.jsx
// Tela inicial do paciente (rota /paciente/dashboard), em um arquivo só.
// Precisa de:  npm i chart.js react-chartjs-2
// Cores:
//  - classes do Tailwind usam os tokens de styles/variebles.css (bg-primaria, text-texto...)
//  - os gráficos (canvas) não entendem classes, então lerPaleta() lê as
//    mesmas variáveis CSS (--color-primaria etc.) em tempo de execução.
// ============================================================
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useAuth } from '../../../contexts/AuthContext'
import Icone from '../../../components/Icone'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip)

/* ------------------------------------------------------------------ */
/* Paleta dos gráficos (lida dos tokens de styles/variebles.css)       */
/* ------------------------------------------------------------------ */
const token = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim()

function lerPaleta() {
  ChartJS.defaults.font.family = token('--font-sans') // mesma fonte do site nos gráficos

  return {
    roxo: token('--color-primaria'),
    verde: token('--color-sucesso'),
    vermelho: token('--color-erro'),
    texto: token('--color-texto'),
    mudo: token('--color-secundaria'),
    borda: token('--color-borda'),
    bordaForte: token('--color-borda-forte'),
    branco: token('--color-branco'),
    roxoAlfa20: token('--color-primaria-alfa-20'), // halo do ponto "hoje"
    roxoAlfa22: token('--color-primaria-alfa-22'), // topo do degradê da área
    roxoTransparente: token('--color-primaria-transparente'), // base do degradê
  }
}

/* ------------------------------------------------------------------ */
/* Dados de exemplo — troque pelos dados da API                        */
/* ------------------------------------------------------------------ */
const indicadores = [
  { emoji: '⚡', nome: 'Energia', valor: 84 },
  { emoji: '💭', nome: 'Sentimento', valor: 73 },
  { emoji: '😊', nome: 'Humor', valor: 67 },
  { emoji: '🧠', nome: 'Pensamentos', valor: 84 },
]

const ROTULOS_DIA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const horasSono = [8, 6, 7.5, 5.5, 7.5, 8.5, 8] // o último item é "hoje"
const SONO_IDEAL = 7

// rótulos dos 7 últimos dias, terminando em hoje
const diasSemana = horasSono.map((_, i) => {
  const dia = new Date()
  dia.setDate(dia.getDate() - (horasSono.length - 1 - i))
  return ROTULOS_DIA[dia.getDay()]
})

const tratamentos = [
  { id: 1, nome: 'Sertralina 50mg', frequencia: 'Uma vez ao dia', horarios: ['08:00'] },
  { id: 2, nome: 'Clonazepam 0,5mg', frequencia: 'Duas vezes ao dia', horarios: ['08:00', '22:00'] },
  { id: 3, nome: 'Melatonina 5mg', frequencia: 'Uma vez ao dia', horarios: ['21:30'] },
]

const consultas = [
  { id: 1, dia: 10, mes: 'Set.', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', hora: '14:00' },
  { id: 2, dia: 24, mes: 'Set.', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', hora: '14:00' },
]

const tarefas = [
  { id: 1, titulo: 'Diário de Humor Semanal', prazo: '07/09/2026', status: 'andamento', progresso: 40 },
  { id: 2, titulo: 'Escala de Ansiedade de Beck', prazo: '15/09/2026', status: 'pendente', progresso: 0 },
  { id: 3, titulo: 'Registro de Pensamentos Automáticos', prazo: '30/08/2026', status: 'concluida', progresso: 100 },
]

const TOTAL_PROFISSIONAIS = 2

const statusTarefa = {
  andamento: { texto: 'Em andamento', classe: 'bg-info-fundo text-info' },
  pendente: { texto: 'Pendente', classe: 'bg-fundo-card text-primaria' },
  concluida: { texto: 'Concluída', classe: 'bg-sucesso-fundo text-sucesso' },
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
const dataHoje = () =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

// "terça-feira, 8 de setembro" -> "Terça-Feira, 8 De Setembro"
const capitalizarPalavras = (txt) =>
  txt.replace(/(^|[\s-])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())

// regra de cor dos indicadores — ajuste os limites conforme a regra de negócio
const corIndicador = (v, cores) => (v >= 60 ? cores.verde : v >= 35 ? cores.roxo : cores.vermelho)

/* ------------------------------------------------------------------ */
/* Blocos reutilizáveis                                                */
/* ------------------------------------------------------------------ */
function Card({ children, className = '' }) {
  return (
    <section className={`rounded-xl border border-borda bg-branco shadow-sm ${className}`}>{children}</section>
  )
}

function CardLista({ icone, titulo, linkTexto, linkPara, children }) {
  return (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-borda px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-texto">
          <Icone nome={icone} tamanho={16} className="text-primaria" />
          {titulo}
        </h2>
        <Link
          to={linkPara}
          className="flex items-center gap-0.5 text-xs font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          {linkTexto}
          <Icone nome="seta" tamanho={14} />
        </Link>
      </header>
      <div className="divide-y divide-borda">{children}</div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Gráfico 1 — Indicadores de hoje (barras)                            */
/* ------------------------------------------------------------------ */
// teto da escala: deixa espaço livre acima das barras, como no design
const TETO_INDICADORES = 160

function GraficoIndicadores({ cores }) {
  const data = {
    labels: indicadores.map((i) => [i.emoji, i.nome]), // emoji em cima, nome embaixo
    datasets: [
      {
        data: indicadores.map((i) => i.valor),
        backgroundColor: indicadores.map((i) => corIndicador(i.valor, cores)),
        borderRadius: { topLeft: 14, topRight: 14, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false,
        categoryPercentage: 1,
        barPercentage: 0.9,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (itens) => indicadores[itens[0].dataIndex].nome,
          label: (c) => ` ${c.parsed.y}%`,
        },
      },
    },
    scales: {
      y: { display: false, min: 0, max: TETO_INDICADORES },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: cores.mudo, font: { size: 12 }, padding: 8 },
      },
    },
  }

  return (
    <div role="img" aria-label={indicadores.map((i) => `${i.nome}: ${i.valor}%`).join(', ')} className="h-60">
      <Bar data={data} options={options} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Gráfico 2 — Sono da semana (linha)                                  */
/* ------------------------------------------------------------------ */
const pontoHoje = horasSono.length - 1

// desenha: linha pontilhada do ideal, "7h ✓", rótulos de valor e halo do "hoje"
// (as opções { ideal, cores } chegam de options.plugins.sonoExtras)
const pluginSono = {
  id: 'sonoExtras',
  beforeDatasetsDraw(chart, _args, { ideal, cores }) {
    const { ctx, chartArea: a, scales: { y } } = chart
    const yy = y.getPixelForValue(ideal)

    ctx.save()
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = cores.bordaForte
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(a.left, yy)
    ctx.lineTo(a.right, yy)
    ctx.stroke()
    ctx.restore()

    const hoje = chart.getDatasetMeta(0).data[pontoHoje]
    if (hoje) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(hoje.x, hoje.y, 13, 0, Math.PI * 2)
      ctx.fillStyle = cores.roxoAlfa20
      ctx.fill()
      ctx.restore()
    }
  },
  afterDatasetsDraw(chart, _args, { ideal, cores }) {
    const { ctx, chartArea: a, scales: { y } } = chart
    const familia = ChartJS.defaults.font.family

    ctx.save()
    ctx.font = `600 12px ${familia}`
    ctx.fillStyle = cores.roxo
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${ideal}h ✓`, a.left - 8, y.getPixelForValue(ideal))

    ctx.font = `700 12px ${familia}`
    ctx.fillStyle = cores.texto
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    chart.getDatasetMeta(0).data.forEach((pt, i) => {
      ctx.fillText(`${chart.data.datasets[0].data[i]}h`, pt.x, pt.y - 12)
    })
    ctx.restore()
  },
}

function GraficoSono({ cores }) {
  const abaixoDoIdeal = (i) => horasSono[i] < SONO_IDEAL

  const data = {
    labels: diasSemana,
    datasets: [
      {
        data: horasSono,
        borderColor: cores.roxo,
        borderWidth: 6,
        tension: 0.4,
        fill: 'start',
        backgroundColor: ({ chart }) => {
          const { ctx, chartArea } = chart
          if (!chartArea) return cores.roxoAlfa22
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          g.addColorStop(0, cores.roxoAlfa22)
          g.addColorStop(1, cores.roxoTransparente)
          return g
        },
        pointRadius: (c) => (c.dataIndex === pontoHoje ? 8 : 4.5),
        pointBorderWidth: (c) => (c.dataIndex === pontoHoje ? 3 : 1.5),
        pointBackgroundColor: (c) =>
          c.dataIndex === pontoHoje ? cores.roxo : abaixoDoIdeal(c.dataIndex) ? cores.vermelho : cores.branco,
        pointBorderColor: (c) =>
          c.dataIndex === pontoHoje ? cores.branco : abaixoDoIdeal(c.dataIndex) ? cores.branco : cores.roxo,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 24, right: 16 } },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => ` ${c.parsed.y}h dormidas` } },
      sonoExtras: { ideal: SONO_IDEAL, cores },
    },
    scales: {
      y: {
        min: 4,
        max: 10,
        ticks: { stepSize: 2, callback: (v) => `${v}h`, color: cores.mudo, padding: 8 },
        grid: { color: cores.borda },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: cores.mudo, padding: 10 },
      },
    },
  }

  return (
    <div
      role="img"
      aria-label={`Horas dormidas: ${diasSemana.map((d, i) => `${d} ${horasSono[i]}h`).join(', ')}`}
      className="h-60"
    >
      <Line data={data} options={options} plugins={[pluginSono]} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
function Dashboard() {
  const { perfil } = useAuth()
  const cores = useMemo(() => lerPaleta(), [])

  const primeiroNome = perfil?.nome?.trim().split(/\s+/)[0] ?? ''
  const media = (horasSono.reduce((a, b) => a + b, 0) / horasSono.length).toFixed(1)

  const resumo = [
    { rotulo: 'Tratamentos ativos', valor: tratamentos.length, icone: 'remedio', cor: 'bg-fundo-card text-primaria' },
    { rotulo: 'Próximas consultas', valor: consultas.length, icone: 'calendario', cor: 'bg-info-fundo text-info' },
    {
      rotulo: 'Tarefas pendentes',
      valor: tarefas.filter((t) => t.status !== 'concluida').length,
      icone: 'tarefa',
      cor: 'bg-sucesso-fundo text-sucesso',
    },
    { rotulo: 'Profissionais', valor: TOTAL_PROFISSIONAIS, icone: 'pessoas', cor: 'bg-alerta-fundo text-alerta' },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {/* Header */}
      <header className="rounded-2xl bg-principal px-6 py-6">
        <p className="text-sm font-bold text-primaria">{capitalizarPalavras(dataHoje())}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-texto">
          Olá{primeiroNome ? `, ${primeiroNome}` : ''}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-sm text-secundaria">Como você está se sentindo hoje?</p>
      </header>

      {/* Indicadores de hoje */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-texto">
              <Icone nome="atividade" tamanho={16} className="text-primaria" />
              Indicadores de hoje
            </h2>
            <p className="mt-1 text-xs text-secundaria">{dataHoje()}</p>
          </div>
          {/* TODO: abrir o fluxo de registro de humor quando a tela/modal existir */}
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-branco shadow-md transition-colors hover:bg-primaria-escura focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <span aria-hidden="true">😊 </span>Registrar humor
          </button>
        </div>

        <div className="mt-2">
          <GraficoIndicadores cores={cores} />
        </div>

        <ul className="mt-3 flex justify-center gap-4 text-xs text-secundaria">
          {[
            ['Positivo', 'bg-sucesso'],
            ['Moderado', 'bg-primaria'],
            ['Atenção', 'bg-erro'],
          ].map(([texto, classe]) => (
            <li key={texto} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${classe}`} aria-hidden="true" />
              {texto}
            </li>
          ))}
        </ul>
      </Card>

      {/* Sono da semana */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-texto">
              <span aria-hidden="true">🌙 </span>Sono da semana
            </h2>
            <p className="mt-1 text-xs text-secundaria">Horas dormidas nos últimos 7 dias</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold leading-tight text-texto">{media}h</p>
            <p className="text-xs text-secundaria">média/dia</p>
          </div>
        </div>

        <div className="mt-3">
          <GraficoSono cores={cores} />
        </div>

        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secundaria">
          <li className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dotted border-borda-forte" aria-hidden="true" />
            Ideal ({SONO_IDEAL}h)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-erro ring-2 ring-branco outline outline-erro" aria-hidden="true" />
            Abaixo do ideal
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-branco bg-primaria shadow-[0_0_0_1.5px_var(--color-primaria)]" aria-hidden="true" />
            Hoje
          </li>
        </ul>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {resumo.map(({ rotulo, valor, icone, cor }) => (
          <Card key={rotulo} className="p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cor}`}>
              <Icone nome={icone} tamanho={18} />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-texto">{valor}</p>
            <p className="mt-1 text-xs text-secundaria">{rotulo}</p>
          </Card>
        ))}
      </div>

      {/* Tratamentos + Consultas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardLista icone="remedio" titulo="Tratamentos de hoje" linkTexto="Ver todos" linkPara="/paciente/tratamentos">
          {tratamentos.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-texto">{t.nome}</p>
                <p className="text-xs text-secundaria">{t.frequencia}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {t.horarios.map((h) => (
                  <span key={h} className="rounded-md bg-fundo-card px-2 py-1 text-xs font-semibold text-primaria">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardLista>

        <CardLista icone="calendario" titulo="Próximas consultas" linkTexto="Agenda" linkPara="/paciente/agenda">
          {consultas.map((c) => (
            <div key={c.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-fundo-card text-primaria">
                <span className="text-lg font-extrabold leading-none">{c.dia}</span>
                <span className="text-[11px] font-semibold leading-tight">{c.mes}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-texto">{c.profissional}</p>
                <p className="text-xs text-secundaria">{c.especialidade}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-secundaria">
                  <Icone nome="relogio" tamanho={12} />
                  {c.hora}
                </p>
              </div>
            </div>
          ))}
        </CardLista>
      </div>

      {/* Tarefas recentes */}
      <CardLista icone="tarefa" titulo="Tarefas recentes" linkTexto="Ver todas" linkPara="/paciente/tarefas">
        {tarefas.map((t) => {
          const status = statusTarefa[t.status]
          return (
            <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-texto">{t.titulo}</p>
                <p className="text-xs text-secundaria">Prazo: {t.prazo}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {t.status !== 'concluida' && (
                  <div
                    role="progressbar"
                    aria-valuenow={t.progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso de ${t.titulo}`}
                    className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-borda sm:block"
                  >
                    <div className="h-full rounded-full bg-primaria" style={{ width: `${t.progresso}%` }} />
                  </div>
                )}
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.classe}`}>
                  {status.texto}
                </span>
              </div>
            </div>
          )
        })}
      </CardLista>
    </div>
  )
}

export default Dashboard
