import { PERFIS } from '../types'

// Senha de todas as contas mock: 123456
export const SENHA_MOCK = '123456'

/** @type {import('../types').Profissional[]} */
export const profissionais = [
  {
    id: 'pro-1',
    nome: 'Ana Ribeiro',
    email: 'ana@dialoga.com',
    perfil: PERFIS.PROFISSIONAL,
    status: 'ativo',
    especialidade: 'Psicologia',
    registro: 'CRP 06/123456',
  },
  {
    id: 'pro-2',
    nome: 'Bruno Martins',
    email: 'bruno@dialoga.com',
    perfil: PERFIS.PROFISSIONAL,
    status: 'ativo',
    especialidade: 'Fonoaudiologia',
    registro: 'CRFa 2-54321',
  },
  {
    id: 'pro-3',
    nome: 'Carla Souza',
    email: 'carla@dialoga.com',
    perfil: PERFIS.PROFISSIONAL,
    status: 'pendente',
    especialidade: 'Terapia Ocupacional',
    registro: 'CREFITO 3/98765',
  },
  {
    id: 'pro-4',
    nome: 'Diego Lima',
    email: 'diego@dialoga.com',
    perfil: PERFIS.PROFISSIONAL,
    status: 'pendente',
    especialidade: 'Psicologia',
    registro: 'CRP 06/654321',
  },
]

/** @type {import('../types').Paciente[]} */
export const pacientes = [
  {
    id: 'pac-1',
    nome: 'Mariana Costa',
    email: 'mariana@dialoga.com',
    perfil: PERFIS.PACIENTE,
    status: 'ativo',
    dataNascimento: '1994-03-12',
    profissionalIds: ['pro-1', 'pro-2'],
  },
  {
    id: 'pac-2',
    nome: 'Pedro Alves',
    email: 'pedro@dialoga.com',
    perfil: PERFIS.PACIENTE,
    status: 'ativo',
    dataNascimento: '1988-11-02',
    profissionalIds: ['pro-1'],
  },
  {
    id: 'pac-3',
    nome: 'Júlia Ferreira',
    email: 'julia@dialoga.com',
    perfil: PERFIS.PACIENTE,
    status: 'ativo',
    primeiroAcesso: true,
    dataNascimento: '2001-07-25',
    profissionalIds: ['pro-2'],
  },
]

/** @type {import('../types').Usuario[]} */
export const administradores = [
  {
    id: 'adm-1',
    nome: 'Admin Dialoga',
    email: 'admin@dialoga.com',
    perfil: PERFIS.ADMIN,
    status: 'ativo',
  },
  {
    id: 'adm-2',
    nome: 'Fernanda Rocha',
    email: 'fernanda@dialoga.com',
    perfil: PERFIS.ADMIN,
    status: 'inativo',
  },
]

export const usuarios = [...administradores, ...profissionais, ...pacientes]
