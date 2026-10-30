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

// Admin
import DashboardAdmin from '../pages/admin/Dashboard'

// Paciente
import AgendaPaciente from '../pages/paciente/Agenda'
import DashboardPaciente from '../pages/paciente/Dashboard'
import NotificacoesPaciente from '../pages/paciente/Notificacoes'
import PerfilPaciente from '../pages/paciente/Perfil'

import ProfissionaisPaciente from '../pages/paciente/Profissionais'
import RelatoriosPaciente from '../pages/paciente/Relatorios'
import TarefasPaciente from '../pages/paciente/Tarefas'
import TratamentosPaciente from '../pages/paciente/Tratamentos'

// Profissional
import AgendaProfissional from '../pages/profissional/Agenda'
import BoasVindasProfissional from '../pages/profissional/BoasVindas'
import DashboardProfissional from '../pages/profissional/Dashboard'
import NotificacoesProfissional from '../pages/profissional/Notificacoes'
import PacientesProfissional from '../pages/profissional/Pacientes'
import PerfilProfissional from '../pages/profissional/Perfil'
import TarefasProfissional from '../pages/profissional/Tarefas'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      <Route path="/perfil-em-analise" element={<PerfilEmAnalise />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/boas-vindas-profissional" element={<BoasVindasProfissional />} />

      {/* Administrador (nivel 0) */}
      <Route element={<RequireAuth nivel={NIVEL.ADMIN} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
        </Route>
      </Route>

      {/* Profissional (nivel 1) */}
      <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} />}>
        <Route path="/profissional" element={<LayoutProfissional />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardProfissional />} />
          <Route path="agenda" element={<AgendaProfissional />} />
          <Route path="pacientes" element={<PacientesProfissional />} />
          <Route path="tarefas" element={<TarefasProfissional />} />
          <Route path="notificacoes" element={<NotificacoesProfissional />} />
          <Route path="perfil" element={<PerfilProfissional />} />
        </Route>
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
          <Route path="relatorios" element={<RelatoriosPaciente />} />
          <Route path="notificacoes" element={<NotificacoesPaciente />} />
          <Route path="perfil" element={<PerfilPaciente />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  )
}

export default AppRoutes
