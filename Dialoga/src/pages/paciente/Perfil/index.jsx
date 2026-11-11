// ============================================================
// pages/paciente/Perfil
// Perfil do paciente: leitura, edição e "perfil editado"
// (aviso verde no cartão + toast). Rota: /paciente/perfil
// Frames: Perfil - Paciente | Editar Perfil - Paciente | Perfil editado - Paciente
// Dados: GET /pacientes/me  |  Salvar: PUT /pacientes/me (multipart, com foto opcional)
// A tela é dividida em duas: PerfilPaciente busca os dados na API e
// FormularioPerfil cuida de ver / editar / salvar.
// ============================================================
import Toast from '../../../components/Toast'
import CampoPerfil from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import AvisoSucesso from '../../../components/AvisoSucesso'
import PerfilCarregando from '../../../components/PerfilCarregando'
import { IconeEmail, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { useAuth } from '../../../contexts/AuthContext'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { usePerfilRemoto } from '../../../hooks/usePerfilRemoto'
import { salvarPerfil } from '../../../services/perfilService'
import { validarPerfilBasico } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

const SUBTITULO = 'Suas informações pessoais'

function FormularioPerfil({ dadosIniciais }) {
  const { auth, atualizarPerfilLocal } = useAuth()
  const p = usePerfilEditavel(dadosIniciais, {
    validar: validarPerfilBasico,
    mensagemSucesso: 'Perfil atualizado com sucesso!',
    salvarNaApi: (rascunho) => salvarPerfil(auth, rascunho),
    // mantém o nome e a foto do menu lateral em dia
    aoSalvarComSucesso: (v) => atualizarPerfilLocal({ nome: v.nome, fotoUrl: v.fotoUrl }),
  })
  const dados = p.editando ? p.rascunho : p.valores
  const modo = p.editando ? 'edicao' : 'leitura'

  return (
    <PaginaPerfil subtitulo={SUBTITULO}>
      <CartaoPerfil
        tom="paciente"
        nome={p.valores.nome}
        selo="Paciente"
        fotoUrl={p.fotoUrl}
        onEscolherFoto={p.escolherFoto}
        onSubmit={p.salvar}
      >
        {p.salvo && !p.editando && <AvisoSucesso />}

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
            maxLength={50}
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

        <AcoesPerfil comLinha editando={p.editando} salvando={p.salvando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

function PerfilPaciente() {
  const { dados, erro, recarregar } = usePerfilRemoto()

  if (!dados) return <PerfilCarregando erro={erro} onTentarNovamente={recarregar} subtitulo={SUBTITULO} />
  return <FormularioPerfil dadosIniciais={dados} />
}

export default PerfilPaciente
