// ============================================================
// tratamentosMock
// Dados fixos da tela de Tratamentos do paciente (sem API por enquanto),
// iguais aos do Figma. Os campos seguem as tabelas do back-end para facilitar a integração:
//   nome       -> tbl_tratamento.nome_medicamento
//   dosagem    -> tbl_tratamento.dosagem
//   frequencia -> tbl_tratamento.frequencia
//   lembrete   -> tbl_tratamento.lembrete_ativo
//   horarios   -> tbl_horario_tratamento.horario (um por vez ao dia)
// TODO: trocar por GET/POST /v1/dialoga/paciente/me/tratamentos e /v1/dialoga/tratamentos na integração.
// ============================================================

// opções do campo "Frequência"; "vezes" = quantos campos de horário o pop-up mostra
export const FREQUENCIAS = [
  { rotulo: 'Uma vez ao dia', vezes: 1 },
  { rotulo: 'Duas vezes ao dia', vezes: 2 },
  { rotulo: 'Três vezes ao dia', vezes: 3 },
  { rotulo: 'Quatro vezes ao dia', vezes: 4 },
]

// quantos horários uma frequência pede (frequência desconhecida = 1)
export const vezesDe = (frequencia) => FREQUENCIAS.find((f) => f.rotulo === frequencia)?.vezes ?? 1

export const TRATAMENTOS_MOCK = [
  { id: 1, nome: 'Sertralina', dosagem: '50mg', frequencia: 'Uma vez ao dia', horarios: ['08:00'], lembrete: true },
  { id: 2, nome: 'Clonazepam', dosagem: '0,5mg', frequencia: 'Duas vezes ao dia', horarios: ['08:00', '22:00'], lembrete: true },
  { id: 3, nome: 'Melatonina', dosagem: '5mg', frequencia: 'Uma vez ao dia', horarios: ['21:30'], lembrete: false },
]

// formulário do pop-up "Novo tratamento", como no Figma: "Uma vez ao dia" e lembrete ligado
export const TRATAMENTO_VAZIO = { nome: '', dosagem: '', frequencia: 'Uma vez ao dia', horarios: [''], lembrete: true }

// texto abaixo do título (RF332): "1 tratamento cadastrado", "3 tratamentos cadastrados"
export function textoContagem(total) {
  if (total === 0) return 'Nenhum tratamento cadastrado'
  return total === 1 ? '1 tratamento cadastrado' : `${total} tratamentos cadastrados`
}
