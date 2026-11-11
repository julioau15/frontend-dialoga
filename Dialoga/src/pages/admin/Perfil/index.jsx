// ============================================================
// pages/admin/Perfil (RF_2026_008)
// Perfil do administrador: leitura, edição (com troca de senha opcional)
// e "perfil editado" (aviso verde no cartão + toast "Perfil atualizado!").
// Rota: /admin/perfil
// Frames: Perfil - Admin (leitura) | Perfil - Admin-1 (perfil editado)
//         | Perfil - Admin-2 (edição, bloco "ALTERAR SENHA (OPCIONAL)")
// Dados: GET /administradores (acha o registro do usuário logado)
// Salvar: PUT /administradores/me (multipart, com foto opcional) e, se preencher
//         o bloco de senha, PUT /administradores/me/senha.
// ============================================================
import Toast from '../../../components/Toast'
import CampoPerfil from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import AvisoSucesso from '../../../components/AvisoSucesso'
import PerfilCarregando from '../../../components/PerfilCarregando'
import { IconeEmail, IconeEscudo, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { IconeCadeado } from '../../../components/IconesPerfil'
import { useAuth } from '../../../contexts/AuthContext'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { usePerfilRemoto } from '../../../hooks/usePerfilRemoto'
import { salvarPerfil } from '../../../services/perfilService'
import { validarPerfilBasico, validarTrocaSenha } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

const SENHAS_VAZIAS = { senhaAtual: '', novaSenha: '', confirmarSenha: '' }

const SUBTITULO = 'Suas informações de administrador'

// O back diz qual campo da senha deu problema em "field", ex.: "[SENHA_ATUAL] INCORRETA"
function erroDeSenha(erro) {
  // senha já foi trocada e o resto falhou: a mensagem completa precisa aparecer no toast
  if (erro.senhaAlterada) return null

  const campo = String(erro.field ?? '')
  if (campo.startsWith('[SENHA_ATUAL]')) return { senhaAtual: erro.message }
  if (campo.startsWith('[NOVA_SENHA]')) return { novaSenha: erro.message }
  if (campo.startsWith('[CELULAR]')) return { celular: erro.message }
  return null
}

function FormularioPerfil({ dadosIniciais }) {
  const { auth, atualizarPerfilLocal } = useAuth()
  const p = usePerfilEditavel(dadosIniciais, {
    validar: (r) => ({ ...validarPerfilBasico(r), ...validarTrocaSenha(r) }),
    mensagemSucesso: 'Perfil atualizado!',
    aoEditar: (v) => ({ ...v, ...SENHAS_VAZIAS }), // campos de senha começam vazios
    // os novos valores vêm da API (nunca trazem senha)
    salvarNaApi: (rascunho) => salvarPerfil(auth, rascunho),
    mapearErro: erroDeSenha,
    aoSalvarComSucesso: (v) => atualizarPerfilLocal({ nome: v.nome, fotoUrl: v.fotoUrl }),
  })
  const dados = p.editando ? p.rascunho : p.valores
  const modo = p.editando ? 'edicao' : 'leitura'

  const campoSenha = (campo, label) => (
    <CampoPerfil
      key={campo}
      label={label}
      icone={<IconeCadeado tamanho={14} />}
      modo="edicao"
      type="password"
      placeholder="••••••••"
      autoComplete={campo === 'senhaAtual' ? 'current-password' : 'new-password'}
      value={dados[campo]}
      onChange={(e) => p.alterar(campo, e.target.value)}
      erro={p.erros[campo]}
    />
  )

  return (
    <PaginaPerfil subtitulo={SUBTITULO} compensarLayout={false}>
      <CartaoPerfil
        tom="admin"
        nome={p.valores.nome}
        selo={<><IconeEscudo tamanho={10} />Administrador</>}
        fotoUrl={p.fotoUrl}
        onEscolherFoto={p.escolherFoto}
        onSubmit={p.salvar}
      >
        {p.salvo && !p.editando && <AvisoSucesso />}

        <CampoPerfil
          label="Nome"
          icone={<IconeUsuario tamanho={14} />}
          modo={modo}
          value={dados.nome}
          onChange={(e) => p.alterar('nome', e.target.value)}
          erro={p.erros.nome}
          autoComplete="name"
        />

        <CampoPerfil
          label="E-mail"
          icone={<IconeEmail tamanho={14} />}
          modo="bloqueado"
          value={dados.email}
          ajuda="Não pode ser alterado. Entre em contato com o suporte se necessário."
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

        {p.editando && (
          <div className="flex flex-col gap-5 pt-4 border-t border-borda">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-secundaria">
              {/* no Figma (Admin-2) o título inteiro fica em maiúsculas, inclusive "(opcional)" */}
              Alterar senha <span className="font-normal tracking-normal">(opcional)</span>
            </span>
            {campoSenha('senhaAtual', 'Senha atual')}
            {campoSenha('novaSenha', 'Nova senha')}
            {campoSenha('confirmarSenha', 'Confirmar nova senha')}
          </div>
        )}

        <AcoesPerfil editando={p.editando} salvando={p.salvando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

function PerfilAdmin() {
  const { dados, erro, recarregar } = usePerfilRemoto()

  if (!dados) {
    return <PerfilCarregando erro={erro} onTentarNovamente={recarregar} subtitulo={SUBTITULO} compensarLayout={false} />
  }
  return <FormularioPerfil dadosIniciais={dados} />
}

export default PerfilAdmin
