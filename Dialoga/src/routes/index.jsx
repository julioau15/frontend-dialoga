import { Navigate, Route, Routes } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { PERFIS } from '../types'
import { ROTA_INICIAL_POR_PERFIL } from './paths'
import RotaProtegida from './RotaProtegida'
import RotaPublica from './RotaPublica'

import LayoutAdmin from '../layouts/LayoutAdmin'
import LayoutPaciente from '../layouts/LayoutPaciente'
import LayoutProfissional from '../layouts/LayoutProfissional'

import Cadastro from '../pages/auth/Cadastro'
import Login from '../pages/auth/Login'
import PrimeiroAcesso from '../pages/auth/PrimeiroAcesso'

import PacienteAgenda from '../pages/paciente/Agenda'
import PacienteDashboard from '../pages/paciente/Dashboard'
import PacienteNotificacoes from '../pages/paciente/Notificacoes'
import PacientePerfil from '../pages/paciente/Perfil'
import PacienteProfissionais from '../pages/paciente/Profissionais'
import PacienteRelatorios from '../pages/paciente/Relatorios'
import PacienteTarefas from '../pages/paciente/Tarefas'
import PacienteTratamentos from '../pages/paciente/Tratamentos'

import ProfissionalAgenda from '../pages/profissional/Agenda'
import ProfissionalDashboard from '../pages/profissional/Dashboard'
import ProfissionalNotificacoes from '../pages/profissional/Notificacoes'
import ProfissionalPacientes from '../pages/profissional/Pacientes'
import ProfissionalPerfil from '../pages/profissional/Perfil'
import ProfissionalTarefas from '../pages/profissional/Tarefas'

import AdminAdministradores from '../pages/admin/Administradores'
import AdminAprovacoes from '../pages/admin/Aprovacoes'
import AdminPerfil from '../pages/admin/Perfil'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      </Route>

      <Route element={<RotaProtegida perfis={[PERFIS.PACIENTE]} />}>
        <Route path="/paciente" element={<LayoutPaciente />}>
          <Route index element={<PacienteDashboard />} />
          <Route path="agenda" element={<PacienteAgenda />} />
          <Route path="tratamentos" element={<PacienteTratamentos />} />
          <Route path="tarefas" element={<PacienteTarefas />} />
          <Route path="profissionais" element={<PacienteProfissionais />} />
          <Route path="relatorios" element={<PacienteRelatorios />} />
          <Route path="notificacoes" element={<PacienteNotificacoes />} />
          <Route path="perfil" element={<PacientePerfil />} />
        </Route>
      </Route>

      <Route element={<RotaProtegida perfis={[PERFIS.PROFISSIONAL]} />}>
        <Route path="/profissional" element={<LayoutProfissional />}>
          <Route index element={<ProfissionalDashboard />} />
          <Route path="agenda" element={<ProfissionalAgenda />} />
          <Route path="pacientes" element={<ProfissionalPacientes />} />
          <Route path="tarefas" element={<ProfissionalTarefas />} />
          <Route path="notificacoes" element={<ProfissionalNotificacoes />} />
          <Route path="perfil" element={<ProfissionalPerfil />} />
        </Route>
      </Route>

      <Route element={<RotaProtegida perfis={[PERFIS.ADMIN]} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<AdminAprovacoes />} />
          <Route path="administradores" element={<AdminAdministradores />} />
          <Route path="perfil" element={<AdminPerfil />} />
        </Route>
      </Route>

      {/* "/" e rotas desconhecidas: RotaProtegida manda para o login ou para a área do perfil */}
      <Route element={<RotaProtegida />}>
        <Route path="*" element={<RedirecionarParaInicio />} />
      </Route>
    </Routes>
  )
}

// Só renderiza com usuário logado (está dentro de RotaProtegida)
function RedirecionarParaInicio() {
  const { usuario } = useAuth()
  return <Navigate to={ROTA_INICIAL_POR_PERFIL[usuario.perfil]} replace />
}

export default AppRoutes
