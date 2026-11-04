// ============================================================
// pages/admin/Administradores
// Lista de administradores com busca, pop-up de novo administrador,
// pop-up de remoção e toasts de aviso.
// Nesta etapa uso dados fixos (services/administradoresExemplo.js):
// criar e remover só mudam a lista na memória, sem back-end.
// Tela feita para computador (Figma 1440 × 1024); o LayoutAdmin
// mostra um aviso em telas menores que 1024px.
// Rota: /admin/administradores
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import IconeBusca from '../../../components/IconeBusca'
import TextField from '../../../components/TextField'
import Toast from '../../../components/Toast'
import { ADMINISTRADORES_EXEMPLO } from '../../../services/administradoresExemplo'
import { textoParaBusca } from '../../../utils/formatadores'
import CartaoAdministrador from './components/CartaoAdministrador'
import ModalNovoAdministrador from './components/ModalNovoAdministrador'
import ModalRemoverAdministrador from './components/ModalRemoverAdministrador'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

// Monto o texto do subtítulo: "1 conta ativa" ou "2 contas ativas"
function textoContagem(quantidade) {
  return quantidade === 1 ? '1 conta ativa' : `${quantidade} contas ativas`
}

export default function AdministradoresAdmin() {
  const [administradores, setAdministradores] = useState(ADMINISTRADORES_EXEMPLO)
  const [busca, setBusca] = useState('')
  const [novoAberto, setNovoAberto] = useState(false)
  const [chaveNovo, setChaveNovo] = useState(0) // troco a key do pop-up para ele abrir sempre limpo
  const [paraRemover, setParaRemover] = useState(null) // administrador escolhido na lixeira
  const [toast, setToast] = useState(TOAST_FECHADO)

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // Filtro a lista pelo nome ou e-mail, ignorando acentos e maiúsculas.
  // Com o useMemo, só refaço o filtro quando a lista ou a busca mudam.
  const visiveis = useMemo(() => {
    const termo = textoParaBusca(busca.trim())
    if (!termo) return administradores
    return administradores.filter((a) => textoParaBusca(`${a.nome} ${a.email}`).includes(termo))
  }, [administradores, busca])

  function abrirNovo() {
    setChaveNovo((n) => n + 1)
    setNovoAberto(true)
  }

  // Dados de exemplo: coloco o novo administrador na lista só para a tela mostrar o resultado
  function criar({ nome, email }) {
    const logado = administradores.find((a) => a.voce)
    const emailLimpo = email.trim()

    setAdministradores((lista) => [
      ...lista,
      {
        id: Date.now(), // id provisório; quando houver API, uso o id que o back-end devolver
        nome: nome.trim() || 'Novo administrador',
        email: emailLimpo,
        criadoPor: logado?.nome ?? 'Sistema',
        criadoEm: new Date().toISOString(),
        voce: false,
      },
    ])
    setNovoAberto(false)
    setToast({
      aberto: true,
      tipo: 'sucesso',
      mensagem: `Administrador criado. Um e-mail de acesso foi enviado para ${emailLimpo || 'o endereço informado'}.`,
    })
  }

  // Dados de exemplo: tiro da lista e mostro o toast vermelho do Figma ("Perfil excluido - Admin")
  function confirmarRemocao() {
    setAdministradores((lista) => lista.filter((a) => a.id !== paraRemover.id))
    setParaRemover(null)
    setToast({ aberto: true, tipo: 'erro', mensagem: 'Conta de administrador removida.' })
  }

  return (
    // 896px menos 2 × 24px de padding = 848px de conteúdo, a mesma largura do Figma em 1440
    <section className="mx-auto w-full max-w-[896px] px-6 py-16">
      {/* Cabeçalho: título e contagem à esquerda, botão à direita */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-texto">Administradores</h1>
          <p className="mt-1 text-[12px] text-secundaria">{textoContagem(administradores.length)}</p>
        </div>

        <Button type="button" larguraAuto onClick={abrirNovo}>
          <span aria-hidden="true" className="text-[16px] leading-none">+</span>
          Novo administrador
        </Button>
      </header>

      {/* Reaproveito o TextField; o rótulo fica só para leitor de tela, como no Figma (sem texto visível) */}
      <div className="mt-6">
        <TextField
          label={<span className="sr-only">Buscar administrador</span>}
          type="search"
          name="busca"
          autoComplete="off"
          placeholder="Buscar por nome ou e-mail..."
          icone={<IconeBusca />}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {visiveis.length === 0 && (
        <p role="status" className="mt-6 text-[12px] text-secundaria">Nenhum administrador encontrado.</p>
      )}

      <ul className="flex flex-col gap-3 mt-5" aria-label="Lista de administradores">
        {visiveis.map((a) => (
          <CartaoAdministrador key={a.id} administrador={a} onRemover={setParaRemover} />
        ))}
      </ul>

      <ModalNovoAdministrador
        key={chaveNovo}
        aberto={novoAberto}
        onFechar={() => setNovoAberto(false)}
        onCriar={criar}
      />

      <ModalRemoverAdministrador
        administrador={paraRemover}
        onCancelar={() => setParaRemover(null)}
        onConfirmar={confirmarRemocao}
      />

      <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
    </section>
  )
}