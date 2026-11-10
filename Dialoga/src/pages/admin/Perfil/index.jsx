// ============================================================
// pages/admin/Perfil (RF_2026_008)
// Perfil do administrador: leitura e edição, com troca de senha opcional.
// Rota: /admin/perfil
// Frames: Perfil - Admin (leitura) | Perfil - Admin (edição, bloco "Alterar senha").
// Ainda sem frame: o 3º frame do Admin. O toast "Perfil atualizado!" abaixo
// foi copiado do Profissional e deve ser conferido com o Figma.
// ============================================================
import Toast from '../../../components/Toast'
import CampoPerfil from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import { IconeEmail, IconeEscudo, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { IconeCadeado } from '../../../components/IconesPerfil'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { validarPerfilBasico, validarTrocaSenha } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

// TODO: trocar pelos dados reais (GET /administradores/me). Valores do Figma por enquanto.
const DADOS_INICIAIS = {
  nome: 'Rafaela Souto',
  email: 'admin@dialoga.com.br',
  celular: '(11) 91234-5678',
}
const SENHAS_VAZIAS = { senhaAtual: '', novaSenha: '', confirmarSenha: '' }

function PerfilAdmin() {
  const p = usePerfilEditavel(DADOS_INICIAIS, {
    validar: (r) => ({ ...validarPerfilBasico(r), ...validarTrocaSenha(r) }),
    mensagemSucesso: 'Perfil atualizado!',
    aoEditar: (v) => ({ ...v, ...SENHAS_VAZIAS }), // campos de senha começam vazios
    // senhas nunca ficam guardadas na tela depois de salvar
    aoSalvar: ({ nome, email, celular }) => ({ nome, email, celular }),
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
    <PaginaPerfil subtitulo="Suas informações de administrador" compensarLayout={false}>
      <CartaoPerfil
        tom="admin"
        nome={p.valores.nome}
        selo={<><IconeEscudo tamanho={10} />Administrador</>}
        onSubmit={p.salvar}
      >
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
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-secundaria">
              Alterar senha <span className="font-normal normal-case tracking-normal">(opcional)</span>
            </span>
            {campoSenha('senhaAtual', 'Senha atual')}
            {campoSenha('novaSenha', 'Nova senha')}
            {campoSenha('confirmarSenha', 'Confirmar nova senha')}
          </div>
        )}

        <AcoesPerfil editando={p.editando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

export default PerfilAdmin
