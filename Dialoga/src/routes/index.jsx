import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import LayoutPaciente from '../layouts/LayoutPaciente'
import LayoutProfissional from '../layouts/LayoutProfissional'
import LayoutAdmin from '../layouts/LayoutAdmin'

// Segurança
import RequireAuth from './RequireAuth'
import { NIVEL } from '../utils/rotasPorNivel'

// Auth
import Login from '../pages/auth/Login'
import Cadastro from '../pages/auth/Cadastro'
import PrimeiroAcesso from '../pages/auth/PrimeiroAcesso'
import PerfilEmAnalise from '../pages/auth/PerfilEmAnalise'
import RecuperarSenha from '../pages/auth/RecuperarSenha'
import PersonalizarExperiencia from '../pages/auth/PersonalizarExperiencia'

// Documentos legais (públicos)
import TermosDeUso from '../pages/legal/TermosDeUso'
import PoliticaDePrivacidade from '../pages/legal/PoliticaDePrivacidade'

// Admin
import AdministradoresAdmin from '../pages/admin/Administradores'
import DashboardAdmin from '../pages/admin/Dashboard'
import PerfilAdmin from '../pages/admin/Perfil'

// Paciente
import AgendaPaciente from '../pages/paciente/Agenda'
import DashboardPaciente from '../pages/paciente/Dashboard'
import NotificacoesPaciente from '../pages/paciente/Notificacoes'
import PerfilPaciente from '../pages/paciente/Perfil'

import ProfissionaisPaciente from '../pages/paciente/Profissionais'
// Tela de um profissional do paciente (aberta pelo cartão da lista de Profissionais)
import PerfilProfissionalPaciente from '../pages/paciente/PerfilProfissional'
import RelatoriosPaciente from '../pages/paciente/Relatorios'
import TarefasPaciente from '../pages/paciente/Tarefas'
import TratamentosPaciente from '../pages/paciente/Tratamentos'
// Configurações de notificação do paciente (versão Mobile do modal)
import ConfiguracoesNotificacaoPaciente from '../pages/paciente/ConfiguracoesNotificacao'

// Profissional
import AgendaProfissional from '../pages/profissional/Agenda'
import BoasVindasProfissional from '../pages/profissional/BoasVindas'
import DashboardProfissional from '../pages/profissional/Dashboard'
import NotificacoesProfissional from '../pages/profissional/Notificacoes'
import PacientesProfissional from '../pages/profissional/Pacientes'
// Perfil do paciente na visão do profissional (acompanhamento, anotações e indicadores)
import PerfilPacienteProfissional from '../pages/profissional/PerfilPaciente'
import PerfilProfissional from '../pages/profissional/Perfil'
import TarefasProfissional from '../pages/profissional/Tarefas'
// Criação de tarefa e pré-visualização do profissional
import NovaTarefaProfissional from '../pages/profissional/NovaTarefa'
// Acompanhamento de respostas e tela de resposta da tarefa do profissional
import AcompanhamentoTarefasProfissional from '../pages/profissional/AcompanhamentoTarefas'
import RespostaTarefaProfissional from '../pages/profissional/RespostaTarefa'
// Edição de tarefa do profissional
import EditarTarefaProfissional from '../pages/profissional/EditarTarefa'
// Configurações de notificação do profissional
import ConfiguracoesNotificacaoProfissional from '../pages/profissional/ConfiguracoesNotificacao'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      {/* <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} /> */}
      <Route path="/perfil-em-analise" element={<PerfilEmAnalise />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/termos-de-uso" element={<TermosDeUso />} />
      <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />

      {/* Primeiro acesso do administrador (logado, com a senha provisória ainda não trocada) */}
      <Route element={<RequireAuth nivel={NIVEL.ADMIN} exigirPrimeiroAcesso={false} />}>
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      </Route>

      {/* Administrador (nivel 0) */}
      <Route element={<RequireAuth nivel={NIVEL.ADMIN} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="administradores" element={<AdministradoresAdmin />} />
          <Route path="perfil" element={<PerfilAdmin />} />
        </Route>
      </Route>

      {/* Profissional (nivel 1) */}
      <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} />}>
        <Route path="/profissional" element={<LayoutProfissional />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardProfissional />} />
          <Route path="agenda" element={<AgendaProfissional />} />
          <Route path="pacientes" element={<PacientesProfissional />} />
          {/* Perfil do paciente (aberto pelo cartão da lista de Pacientes) */}
          <Route path="pacientes/:id" element={<PerfilPacienteProfissional />} />
          <Route path="tarefas" element={<TarefasProfissional />} />
          {/* Tela Nova tarefa (criação + pré-visualização) */}
          <Route path="tarefas/nova" element={<NovaTarefaProfissional />} />
          {/* Acompanhamento de respostas (lista) e resposta de uma tarefa enviada */}
          <Route path="tarefas/acompanhamento" element={<AcompanhamentoTarefasProfissional />} />
          <Route path="tarefas/acompanhamento/:id" element={<RespostaTarefaProfissional />} />
          {/* Editar tarefa (lápis do cartão na lista de Tarefas) */}
          <Route path="tarefas/:id/editar" element={<EditarTarefaProfissional />} />
          <Route path="notificacoes" element={<NotificacoesProfissional />} />
          {/* Tela de configurações de notificação do profissional */}
          <Route path="notificacoes/configuracoes" element={<ConfiguracoesNotificacaoProfissional />} />
          <Route path="perfil" element={<PerfilProfissional />} />
        </Route>
      </Route>

      {/* Primeiro acesso do profissional (logado, mas sem exigir o primeiro acesso concluído) */}
      <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} exigirPrimeiroAcesso={false} />}>
        <Route path="/boas-vindas-profissional" element={<BoasVindasProfissional />} />
      </Route>

      {/* Primeiro acesso do paciente (logado, mas sem exigir o primeiro acesso concluído) */}
      <Route element={<RequireAuth nivel={NIVEL.PACIENTE} exigirPrimeiroAcesso={false} />}>
        <Route path="/personalizar-experiencia" element={<PersonalizarExperiencia />} />
      </Route>

      {/* Paciente (nivel 2) */}
      <Route element={<RequireAuth nivel={NIVEL.PACIENTE} />}>
        <Route path="/paciente" element={<LayoutPaciente />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPaciente />} />
          <Route path="agenda" element={<AgendaPaciente />} />
          <Route path="tarefas" element={<TarefasPaciente />} />
          <Route path="tratamentos" element={<TratamentosPaciente />} />
          <Route path="profissionais" element={<ProfissionaisPaciente />} />
          <Route path="profissionais/:id" element={<PerfilProfissionalPaciente />} />
          <Route path="relatorios" element={<RelatoriosPaciente />} />
          <Route path="notificacoes" element={<NotificacoesPaciente />} />
          {/* Tela de configurações de notificação do paciente (Mobile) */}
          <Route path="notificacoes/configuracoes" element={<ConfiguracoesNotificacaoPaciente />} />
          <Route path="perfil" element={<PerfilPaciente />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  )
}

export default AppRoutes
