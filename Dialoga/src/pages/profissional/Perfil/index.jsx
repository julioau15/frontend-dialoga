// ============================================================
// pages/profissional/Perfil
// Perfil do profissional: leitura, edição e toast "Perfil atualizado!".
// CRP e CPF ficam bloqueados ("Dados imutáveis").
// Rota: /profissional/perfil
// Frames: Perfil - Profissional | Perfil - Profissional-1 (toast) | Editar perfil - Profissional
// Dados: GET /profissionais/me (+ GET /especialidades)
// Salvar: PUT /profissionais/me (multipart, com foto opcional)
// Ainda sem frame: "Nova nota perfil - Profissional" (não implementado).
//
// Especialidade: o back guarda uma lista de ids (tbl_profissional_especialidade),
// não um texto livre. Por isso, na edição, o campo é a lista de seleção múltipla
// (a mesma do cadastro). Na leitura aparece como texto, igual ao Figma.
// ============================================================
import { useId } from 'react'
import Toast from '../../../components/Toast'
import CampoPerfil, { CampoImutavel } from '../../../components/CampoPerfil'
import CartaoPerfil from '../../../components/CartaoPerfil'
import PaginaPerfil from '../../../components/PaginaPerfil'
import AcoesPerfil from '../../../components/AcoesPerfil'
import PerfilCarregando from '../../../components/PerfilCarregando'
import SelectMultiplo from '../../../components/SelectMultiplo'
import { IconeEmail, IconeTelefone, IconeUsuario } from '../../../components/Icones'
import { IconeCracha } from '../../../components/IconesPerfil'
import { useAuth } from '../../../contexts/AuthContext'
import { usePerfilEditavel } from '../../../hooks/usePerfilEditavel'
import { usePerfilRemoto } from '../../../hooks/usePerfilRemoto'
import { salvarPerfil } from '../../../services/perfilService'
import { formatarCpf } from '../../../utils/formatadores'
import { validarPerfilBasico } from '../../../utils/validarPerfil'
import { mascararCelular } from '../../../utils/validators'

const SUBTITULO = 'Suas informações profissionais'

// ids -> nomes, na ordem da lista do back
const nomesDasEspecialidades = (ids, opcoes) => opcoes.filter((o) => ids.includes(o.id)).map((o) => o.texto)

function FormularioPerfil({ dadosIniciais, opcoesEspecialidades }) {
  const { auth, atualizarPerfilLocal } = useAuth()
  const idRotuloEspecialidade = useId()
  const p = usePerfilEditavel(dadosIniciais, {
    validar: validarPerfilBasico,
    mensagemSucesso: 'Perfil atualizado!',
    salvarNaApi: (rascunho) => salvarPerfil(auth, rascunho),
    aoSalvarComSucesso: (v) => atualizarPerfilLocal({ nome: v.nome, fotoUrl: v.fotoUrl }),
  })
  const dados = p.editando ? p.rascunho : p.valores
  const modo = p.editando ? 'edicao' : 'leitura'

  const nomes = nomesDasEspecialidades(p.valores.especialidades, opcoesEspecialidades)
  // selo do cartão: primeira especialidade (+N se tiver mais)
  const selo = nomes.length > 1 ? `${nomes[0]} +${nomes.length - 1}` : (nomes[0] ?? 'Profissional')

  function alternarEspecialidade(id) {
    const atuais = p.rascunho.especialidades
    p.alterar('especialidades', atuais.includes(id) ? atuais.filter((e) => e !== id) : [...atuais, id])
  }

  return (
    <PaginaPerfil subtitulo={SUBTITULO}>
      <CartaoPerfil
        tom="profissional"
        nome={p.valores.nome}
        selo={selo}
        fotoUrl={p.fotoUrl}
        onEscolherFoto={p.escolherFoto}
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

        {p.editando ? (
          <div className="flex flex-col gap-1.5 text-left">
            <span id={idRotuloEspecialidade} className="text-[11px] font-bold uppercase tracking-[0.06em] text-secundaria">
              Especialidade
            </span>
            <SelectMultiplo
              opcoes={opcoesEspecialidades}
              selecionados={dados.especialidades}
              onAlternar={alternarEspecialidade}
              placeholder="Selecione suas especialidades"
              erro={p.erros.especialidades}
              ariaLabelledby={idRotuloEspecialidade}
            />
            {p.erros.especialidades && <span className="text-[12px] text-erro">{p.erros.especialidades}</span>}
          </div>
        ) : (
          <CampoPerfil
            label="Especialidade"
            icone={<IconeCracha tamanho={14} />}
            modo="leitura"
            value={nomes.join(', ')}
            readOnly
          />
        )}

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
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-secundaria">Dados imutáveis</span>
          <CampoImutavel label="CRP" valor={dados.crp} />
          <CampoImutavel label="CPF" valor={formatarCpf(dados.cpf)} />
          <p className="text-[12px] text-secundaria">
            CRP e CPF não podem ser alterados. Em caso de erro, entre em contato com o suporte.
          </p>
        </div>

        <AcoesPerfil editando={p.editando} salvando={p.salvando} onEditar={p.editar} onCancelar={p.cancelar} />
      </CartaoPerfil>

      <Toast {...p.toast} onFechar={p.fecharToast} />
    </PaginaPerfil>
  )
}

function PerfilProfissional() {
  const { dados, extras, erro, recarregar } = usePerfilRemoto()

  if (!dados) return <PerfilCarregando erro={erro} onTentarNovamente={recarregar} subtitulo={SUBTITULO} />
  return <FormularioPerfil dadosIniciais={dados} opcoesEspecialidades={extras.opcoesEspecialidades ?? []} />
}

export default PerfilProfissional
