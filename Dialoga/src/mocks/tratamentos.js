/** @type {import('../types').Tratamento[]} */
export const tratamentos = [
  {
    id: 'trt-1',
    pacienteId: 'pac-1',
    profissionalId: 'pro-1',
    titulo: 'Terapia cognitivo-comportamental',
    inicio: '2026-08-01',
    progresso: 45,
    status: 'ativo',
  },
  {
    id: 'trt-2',
    pacienteId: 'pac-1',
    profissionalId: 'pro-2',
    titulo: 'Reabilitação da fala',
    inicio: '2026-09-10',
    progresso: 20,
    status: 'ativo',
  },
  {
    id: 'trt-3',
    pacienteId: 'pac-2',
    profissionalId: 'pro-1',
    titulo: 'Acompanhamento de ansiedade',
    inicio: '2026-03-05',
    fim: '2026-09-30',
    progresso: 100,
    status: 'concluida',
  },
]
