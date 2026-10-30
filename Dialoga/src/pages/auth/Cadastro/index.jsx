// ============================================================
// pages/auth/Cadastro
// Tela de criação de conta em 2 passos:
//   1) Seus dados  (tipo de conta, nome, e-mail, celular; profissional tem CPF, registro e especialidade)
//   2) Senha  (componente components/DefinirSenha)
// A lógica (validação, API) está em hooks/useCadastroForm.js
// Se o usuário já estiver logado, vai direto para a área dele.
// ============================================================
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { rotaInicialPorNivel } from '../../../utils/rotasPorNivel'
import { useCadastroForm } from '../../../hooks/useCadastroForm'
import TextField from '../../../components/TextField'
import Button from '../../../components/Button'
import SelectMultiplo from '../../../components/SelectMultiplo'
import DefinirSenha from './components/DefinirSenha'
import iconeEmail from '../../../assets/auth/icon_email.png'
import iconeNome from '../../../assets/auth/IconNome.png'
import iconeTelefone from '../../../assets/auth/IconTelefone.png'
import iconeCpf from '../../../assets/auth/iconCpf.png'
import iconeRegistro from '../../../assets/auth/iconRegistroProfissional.png'
import iconeEspecialidade from '../../../assets/auth/especialidade.png'

const PASSOS = ['Seus dados', 'Senha']

export default function Cadastro() {
  const { auth } = useAuth()
  const f = useCadastroForm()

  const rota = auth && rotaInicialPorNivel(auth.nivel)
  if (rota) return <Navigate to={rota} replace />

  const ehProfissional = f.valores.tipo === 'profissional'

  return (
    <main className="flex justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <div className="w-full max-w-[440px] flex flex-col gap-5">
        {/* Indicador de passos */}
        <ol className="flex items-center gap-2" aria-label="Etapas do cadastro">
          {PASSOS.map((nome, i) => {
            const numero = i + 1
            const ativo = numero === f.passo
            const feito = numero < f.passo
            return (
              <li
                key={nome}
                className={`flex items-center gap-2 text-[12px] ${
                  ativo ? 'text-texto font-semibold' : feito ? 'text-secundaria' : 'text-secundaria-alfa-50'
                }`}
              >
                <span
                  className={`grid place-items-center w-6 h-6 rounded-full text-[11px] font-bold ${
                    ativo || feito ? 'bg-primaria text-branco' : 'bg-borda text-secundaria'
                  }`}
                >
                  {feito ? '✓' : numero}
                </span>
                <span>{nome}</span>
                {numero < PASSOS.length && <span className="w-9 h-px bg-borda-forte" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>

        <section className="p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
          {f.passo === 1 ? (
            <form onSubmit={f.continuar} noValidate>
              <h1 className="text-[20px] font-extrabold text-texto">Criar conta</h1>
              <p className="mt-1 text-[13px] text-secundaria">Informe seus dados pessoais</p>

              <div className="flex flex-col gap-4 mt-5">
                {/* Tipo de conta */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[11px] font-bold text-texto" id="rotulo-tipo">Tipo de conta</span>
                  <div className="grid grid-cols-[1fr_1fr] gap-3" role="radiogroup" aria-labelledby="rotulo-tipo">
                    {[['paciente', 'Paciente'], ['profissional', 'Profissional']].map(([valor, texto]) => (
                      <button
                        key={valor}
                        type="button"
                        role="radio"
                        aria-checked={f.valores.tipo === valor}
                        className={`h-11 rounded-[10px] text-[12px] font-semibold leading-[normal] cursor-pointer transition-[background,border-color] duration-200 ease-[ease] hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                          f.valores.tipo === valor
                            ? 'bg-fundo-card border-2 border-primaria text-primaria'
                            : 'bg-branco border border-borda text-secundaria'
                        }`}
                        onClick={() => f.alterarCampo('tipo', valor)}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paciente: nome, e-mail, celular.
                    Profissional: nome, CPF, registro, especialidade, e-mail, celular. */}
                <TextField
                  label="Nome completo"
                  name="nome"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  icone={iconeNome}
                  value={f.valores.nome}
                  onChange={(e) => f.alterarCampo('nome', e.target.value)}
                  erro={f.errosCampos.nome}
                />

                {ehProfissional && (
                  <>
                    <TextField
                      label="CPF"
                      name="cpf"
                      inputMode="numeric"
                      placeholder="Digite somente números"
                      icone={iconeCpf}
                      value={f.valores.cpf}
                      onChange={(e) => f.alterarCampo('cpf', e.target.value)}
                      erro={f.errosCampos.cpf}
                    />
                    <TextField
                      label="Registro Profissional"
                      name="crp"
                      placeholder="Número e estado (sigla)"
                      icone={iconeRegistro}
                      value={f.valores.crp}
                      onChange={(e) => f.alterarCampo('crp', e.target.value)}
                      erro={f.errosCampos.crp}
                    />

                    {/* Especialidades: uma ou mais, vindas da API (GET /especialidades) */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="flex items-center gap-2 text-[11px] font-bold text-texto" id="rotulo-especialidades">
                        <img className="w-4 h-4 object-contain" src={iconeEspecialidade} alt="" />
                        Especialidade
                      </span>
                      <span className="text-[10px] text-secundaria">Selecione uma ou mais áreas de atuação</span>

                      {f.carregandoEspecialidades && (
                        <span className="text-[12px] text-secundaria" role="status">Carregando especialidades...</span>
                      )}

                      {f.erroEspecialidades && (
                        <div className="flex items-center gap-2 text-[12px] text-erro" role="alert">
                          <span>{f.erroEspecialidades}</span>
                          <button
                            type="button"
                            className="p-0 border-0 bg-transparent text-primaria font-bold cursor-pointer hover:underline"
                            onClick={f.recarregarEspecialidades}
                          >
                            Tentar de novo
                          </button>
                        </div>
                      )}

                      <SelectMultiplo
                        ariaLabelledby="rotulo-especialidades"
                        placeholder="Selecione as especialidades"
                        opcoes={f.especialidades.map(({ id, especialidade }) => ({ id, texto: especialidade }))}
                        selecionados={f.valores.especialidades}
                        onAlternar={f.alternarEspecialidade}
                        desabilitado={f.carregandoEspecialidades || !!f.erroEspecialidades}
                        erro={f.errosCampos.especialidades}
                      />

                      {f.errosCampos.especialidades && (
                        <span className="text-[11px] text-erro" role="alert">{f.errosCampos.especialidades}</span>
                      )}
                    </div>
                  </>
                )}

                <TextField
                  label="E-mail"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  icone={iconeEmail}
                  value={f.valores.email}
                  onChange={(e) => f.alterarCampo('email', e.target.value)}
                  erro={f.errosCampos.email}
                />

                <TextField
                  label="Celular"
                  type="tel"
                  name="celular"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  icone={iconeTelefone}
                  value={f.valores.celular}
                  onChange={(e) => f.alterarCampo('celular', e.target.value)}
                  erro={f.errosCampos.celular}
                />

                <Button type="submit" carregando={f.carregando}>Continuar</Button>
              </div>
            </form>
          ) : (
            <DefinirSenha
              valores={f.valores}
              errosCampos={f.errosCampos}
              erroGeral={f.erroGeral}
              carregando={f.carregando}
              mostrarSenha={f.mostrarSenha}
              onAlterarCampo={f.alterarCampo}
              onAlternarSenha={f.alternarSenha}
              onVoltar={f.voltar}
              onSubmit={f.enviar}
            />
          )}
        </section>

        <p className="text-center text-[12px] text-secundaria">
          Já tem conta? <Link className="text-primaria font-bold no-underline hover:underline" to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  )
}