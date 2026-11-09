// ============================================================
// pages/admin/Administradores
// Lista de administradores com busca, pop-up de novo administrador,
// pop-up de remoção e toasts de aviso.
// Tela feita para computador (Figma 1440 × 1024); o LayoutAdmin
// mostra um aviso em telas menores que 1024px.
// Rota: /admin/administradores
// A lógica (lista, busca, criar, remover e regras) fica no hook useAdministradores.
// ============================================================
import { useCallback, useState } from 'react'
import Button from '../../../components/Button'
import IconeBusca from '../../../components/IconeBusca'
import TextField from '../../../components/TextField'
import Toast from '../../../components/Toast'
import { useAdministradores } from '../../../hooks/useAdministradores'
import CartaoAdministrador from './components/CartaoAdministrador'
import ModalNovoAdministrador from './components/ModalNovoAdministrador'
import ModalRemoverAdministrador from './components/ModalRemoverAdministrador'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

// Monto o texto do subtítulo: "1 conta ativa" ou "2 contas ativas"
function textoContagem(quantidade) {
  return quantidade === 1 ? '1 conta ativa' : `${quantidade} contas ativas`
}

export default function AdministradoresAdmin() {
  const adm = useAdministradores()

  const [novoAberto, setNovoAberto] = useState(false)
  const [chaveNovo, setChaveNovo] = useState(0) // troco a key do pop-up para ele abrir sempre limpo
  const [paraRemover, setParaRemover] = useState(null) // administrador escolhido na lixeira
  const [erroRemocao, setErroRemocao] = useState('')
  const [toast, setToast] = useState(TOAST_FECHADO)

  // O Toast usa esta função dentro de um useEffect. Com o useCallback ela
  // não muda a cada render, e o tempo de 4 s do aviso não reinicia sem motivo.
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // RF05: abre o formulário de novo administrador
  function abrirNovo() {
    setChaveNovo((n) => n + 1)
    setNovoAberto(true)
  }

  // O hook cria; aqui só cuido do que a tela mostra depois.
  // Se der erro, ele chega no pop-up, que mostra a mensagem.
  async function criar(valores) {
    const novo = await adm.criar(valores)
    setNovoAberto(false)
    // RF10 e RNF02: notificação imediata de sucesso
    setToast({
      aberto: true,
      tipo: 'sucesso',
      mensagem: `Administrador criado. Um e-mail de acesso foi enviado para ${novo?.email ?? valores.email.trim().toLowerCase()}.`,
    })
  }

  // RF12: a lixeira abre a confirmação, sempre sem erro antigo
  function pedirRemocao(administrador) {
    setErroRemocao('')
    setParaRemover(administrador)
  }

  async function confirmarRemocao() {
    try {
      await adm.remover(paraRemover)
      setParaRemover(null)
      // RF16 e RNF02: uso o toast vermelho do Figma ("Perfil excluido - Admin")
      setToast({ aberto: true, tipo: 'erro', mensagem: 'Conta de administrador removida.' })
    } catch (erro) {
      setErroRemocao(erro.message) // o pop-up continua aberto para tentar de novo
    }
  }

  return (
    // 896px menos 2 × 24px de padding = 848px de conteúdo, a mesma largura do Figma em 1440
    <section className="mx-auto w-full max-w-[896px] px-6 py-16">
      {/* RF01: título e contagem à esquerda, botão à direita */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-texto">Administradores</h1>
          <p className="mt-1 text-[12px] text-secundaria">
            {adm.carregando ? 'Carregando...' : textoContagem(adm.total)}
          </p>
        </div>

        {/* Só libero depois de carregar: preciso da lista para não deixar repetir e-mail */}
        <Button type="button" larguraAuto disabled={adm.carregando || !!adm.erroLista} onClick={abrirNovo}>
          <span aria-hidden="true" className="text-[16px] leading-none">+</span>
          Novo administrador
        </Button>
      </header>

      {/* RF02. Reaproveito o TextField; o rótulo fica só para leitor de tela, como no Figma */}
      <div className="mt-6">
        <TextField
          label={<span className="sr-only">Buscar administrador</span>}
          type="search"
          name="busca"
          autoComplete="off"
          placeholder="Buscar por nome ou e-mail..."
          icone={<IconeBusca />}
          value={adm.busca}
          onChange={(e) => adm.setBusca(e.target.value)}
        />
      </div>

      {/* Estados da lista: carregando, erro com nova tentativa, vazia e com itens */}
      {adm.carregando && (
        <p role="status" className="mt-6 text-[12px] text-secundaria">Carregando administradores...</p>
      )}

      {adm.erroLista && (
        <div role="alert" className="flex flex-col items-start gap-2 mt-6">
          <p className="text-[12px] text-erro">{adm.erroLista}</p>
          <button type="button" onClick={adm.tentarNovamente} className="text-[12px] text-primaria underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {!adm.carregando && !adm.erroLista && adm.visiveis.length === 0 && (
        <p role="status" className="mt-6 text-[12px] text-secundaria">Nenhum administrador encontrado.</p>
      )}

      {/* RF03 e RF04: lista com avatar, nome, e-mail, criação e o selo "Você" */}
      <ul className="flex flex-col gap-3 mt-5" aria-label="Lista de administradores">
        {adm.visiveis.map((a) => (
          <CartaoAdministrador
            key={a.id}
            administrador={a}
            podeRemover={adm.podeRemover(a)}
            onRemover={pedirRemocao}
          />
        ))}
      </ul>

      <ModalNovoAdministrador
        key={chaveNovo}
        aberto={novoAberto}
        enviando={adm.criando}
        onFechar={() => setNovoAberto(false)}
        onValidar={adm.validarNovo}
        onCriar={criar}
      />

      <ModalRemoverAdministrador
        administrador={paraRemover}
        enviando={adm.removendo}
        erro={erroRemocao}
        onCancelar={() => setParaRemover(null)}
        onConfirmar={confirmarRemocao}
      />

      <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
    </section>
  )
}