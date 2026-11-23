import { test } from 'node:test'
import assert from 'node:assert'
import { nomeDaSidebar, funcaoDoPerfil } from '../src/utils/formatadores.js'

test('profissional: dois primeiros nomes, sem o título', () => {
  assert.strictEqual(nomeDaSidebar('Dra. Ana Beatriz Souza', 'profissional'), 'Ana Beatriz')
  assert.strictEqual(nomeDaSidebar('Carlos da Silva Lima', 'profissional'), 'Carlos Silva')
})

test('paciente e administrador: primeiro nome', () => {
  assert.strictEqual(nomeDaSidebar('Maria Clara Santos', 'paciente'), 'Maria')
  assert.strictEqual(nomeDaSidebar('Administrador Dialoga', 'administrador'), 'Administrador')
  assert.strictEqual(nomeDaSidebar('', 'paciente'), '')
})

test('função: primeira especialidade do profissional, ou o nome do nível', () => {
  assert.strictEqual(funcaoDoPerfil({ especialidade: [{ especialidade: 'Psicologia Clínica' }] }, 'profissional'), 'Psicologia Clínica')
  assert.strictEqual(funcaoDoPerfil({ especialidade: [] }, 'profissional'), 'Profissional')
  assert.strictEqual(funcaoDoPerfil({}, 'paciente'), 'Paciente')
  assert.strictEqual(funcaoDoPerfil({}, 'administrador'), 'Administrador')
})
