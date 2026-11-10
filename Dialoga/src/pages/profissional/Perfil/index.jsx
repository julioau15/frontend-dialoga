// ============================================================
// pages/profissional/Perfil
// Perfil do profissional: leitura, edição e toast "Perfil atualizado!".
// CRP e CPF ficam bloqueados ("Dados imutáveis").
// Rota: /profissional/perfil
// Frames: Perfil - Profissional | Perfil - Profissional-1 (toast) | Editar perfil - Profissional
// Ainda sem frame: "Nova nota perfil - Profissional" (não implementado).
// ============================================================
import Toast from '../../../components/Toast'
import CampoPerfil, { CampoImutavel } from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import { IconeEmail, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { IconeCracha } from '../../../components/IconesPerfil'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { validarPerfilBasico } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

// TODO: trocar pelos dados reais (GET /profissionais/me). Valores do Figma por enquanto.
const DADOS_INICIAIS = {
  nome: 'Carlos Eduardo Mendes',
  especialidade: 'Psicologia Clínica',
  email: 'carlos.mendes@psicologia.com.br',
  celular: '(11) 97654-3210',
  crp: '06/123456',
  cpf: '123.456.789-00',
}

function PerfilProfissional() {
  const p = usePerfilEditavel(DADOS_INICIAIS, {
    validar: validarPerfilBasico,
    mensagemSucesso: 'Perfil atualizado!',
  })
  const dados = p.editando ? p.rascunho : p.valores
  const modo = p.editando ? 'edicao' : 'leitura'

  return (
    <PaginaPerfil subtitulo="Suas informações profissionais">
      <CartaoPerfil tom="profissional" nome={p.valores.nome} selo={p.valores.especialidade} onSubmit={p.salvar}>
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
          label="Especialidade"
          icone={<IconeCracha tamanho={14} />}
          modo={modo}
          value={dados.especialidade}
          onChange={(e) => p.alterar('especialidade', e.target.value)}
          erro={p.erros.especialidade}
          ajuda={p.editando ? 'Ex.: Psicologia Clínica, Neuropsicologia, TCC' : undefined}
        />

        <CampoPerfil
          label="E-mail"
          icone={<IconeEmail tamanho={14} />}
          modo="bloqueado"
          value={dados.email}
          ajuda="Não pode ser alterado por razões de segurança."
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

        <div className="flex flex-col gap-2.5 pt-4 border-t border-borda">
          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-secundaria">Dados imutáveis</span>
          <CampoImutavel label="CRP" valor={dados.crp} />
          <CampoImutavel label="CPF" valor={dados.cpf} />
          <p className="text-[10px] text-secundaria">
            CRP e CPF não podem ser alterados. Em caso de erro, entre em contato com o suporte.
          </p>
        </div>

        <AcoesPerfil editando={p.editando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

export default PerfilProfissional
