// ============================================================
// pages/paciente/Perfil
// Perfil do paciente: leitura, edição e "perfil editado"
// (aviso verde no cartão + toast). Rota: /paciente/perfil
// Frames: Perfil - Paciente | Editar Perfil - Paciente | Perfil editado - Paciente
// ============================================================
import Toast from '../../../components/Toast'
import CampoPerfil from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import { IconeCheck, IconeEmail, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { validarPerfilBasico } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

// TODO: trocar pelos dados reais (GET /pacientes/me). Valores do Figma por enquanto.
const DADOS_INICIAIS = {
  nome: 'Ana Beatriz Ferreira',
  apelido: '',
  email: 'ana.ferreira@email.com',
  celular: '(11) 98765-4321',
}

function PerfilPaciente() {
  const p = usePerfilEditavel(DADOS_INICIAIS, {
    validar: validarPerfilBasico,
    mensagemSucesso: 'Perfil atualizado com sucesso!',
  })
  const dados = p.editando ? p.rascunho : p.valores
  const modo = p.editando ? 'edicao' : 'leitura'

  return (
    <PaginaPerfil subtitulo="Suas informações pessoais">
      <CartaoPerfil tom="paciente" nome={p.valores.nome} selo="Paciente" onSubmit={p.salvar}>
        {p.salvo && !p.editando && (
          <div role="status" className="flex items-center gap-2 h-10 px-3 rounded-lg border border-sucesso-borda-suave bg-sucesso-fundo text-[12px] text-sucesso">
            <IconeCheck tamanho={13} />
            Alterações salvas com sucesso!
          </div>
        )}

        <CampoPerfil
          label="Nome completo"
          icone={<IconeUsuario tamanho={14} />}
          modo={modo}
          value={dados.nome}
          onChange={(e) => p.alterar('nome', e.target.value)}
          erro={p.erros.nome}
          autoComplete="name"
        />

        {p.editando && (
          <CampoPerfil
            label="Como prefere ser chamado?"
            rotuloOpcional="(opcional)"
            icone={<IconeUsuario tamanho={14} />}
            modo="edicao"
            placeholder="Apelido ou nome preferido"
            value={dados.apelido}
            onChange={(e) => p.alterar('apelido', e.target.value)}
          />
        )}

        <CampoPerfil
          label="E-mail"
          icone={<IconeEmail tamanho={14} />}
          modo="bloqueado"
          value={dados.email}
          ajuda="O e-mail não pode ser alterado por questões de segurança."
        />

        <CampoPerfil
          label="Celular"
          icone={<IconeTelefone tamanho={14} />}
          modo={modo}
          value={dados.celular}
          onChange={(e) => p.alterar('celular', mascararCelular(e.target.value))}
          erro={p.erros.celular}
          inputMode="tel"
          autoComplete="tel"
        />

        <AcoesPerfil comLinha editando={p.editando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

export default PerfilPaciente
