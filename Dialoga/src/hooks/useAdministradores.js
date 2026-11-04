// ============================================================
// hooks/useAdministradores.js
// Toda a lógica da tela de Administradores (a página só desenha):
//   - carrego a lista pelo administradorService (RF03)
//   - marco quem está logado com "Você", comparando com a sessão (RF04)
//   - filtro pela busca, sem acento e sem maiúscula (RF02)
//   - crio e removo, com estados de carregamento (RF09, RF11, RF15, RF17)
//   - não deixo remover a própria conta (RN03)
// Uso: const adm = useAdministradores()
// ============================================================
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { criarAdministrador, listarAdministradores, removerAdministrador } from '../services/administradorService'
import { textoParaBusca } from '../utils/formatadores'
import { validarNovoAdministrador } from '../utils/validators'

export function useAdministradores() {
  const { auth } = useAuth()
  const idUsuarioLogado = auth?.id // id de tbl_usuario que veio no login
  const token = auth?.token

  const [lista, setLista] = useState([]) // como veio do service
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [removendo, setRemovendo] = useState(false)

  // "carregando" e "erro" da lista: calculo a partir do número da tentativa
  // (mesmo padrão do useCadastroForm), assim não chamo setState direto
  // dentro do useEffect, que o ESLint do projeto não aceita.
  const [tentativa, setTentativa] = useState(0) // +1 = carregar de novo
  const [carga, setCarga] = useState(null) // { tentativa, erro }

  useEffect(() => {
    let cancelado = false // ignoro a resposta se eu sair da tela antes de ela chegar
    const minhaTentativa = tentativa

    listarAdministradores(token)
      .then((resultado) => {
        if (cancelado) return
        setLista(resultado)
        setCarga({ tentativa: minhaTentativa, erro: '' })
      })
      .catch((erro) => {
        if (!cancelado) setCarga({ tentativa: minhaTentativa, erro: erro.message })
      })

    return () => {
      cancelado = true
    }
  }, [tentativa, token])

  const cargaAtual = carga?.tentativa === tentativa ? carga : null
  const carregando = !cargaAtual
  const erroLista = cargaAtual?.erro ?? ''

  // RF04: calculo o "voce" a cada render a partir da sessão, em vez de guardar no estado
  const administradores = useMemo(
    () => lista.map((a) => ({ ...a, voce: a.idUsuario === idUsuarioLogado })),
    [lista, idUsuarioLogado],
  )

  // RF02: filtro por nome ou e-mail; só refaço quando a lista ou a busca mudam
  const visiveis = useMemo(() => {
    const termo = textoParaBusca(busca.trim())
    if (!termo) return administradores
    return administradores.filter((a) => textoParaBusca(`${a.nome} ${a.email}`).includes(termo))
  }, [administradores, busca])

  // RN03: a conta logada nunca pode ser removida.
  // Com isso sempre sobra pelo menos um administrador (a própria conta logada).
  function podeRemover(administrador) {
    return !administrador.voce
  }

  // Valido o pop-up usando os e-mails que já estão na lista
  function validarNovo(valores) {
    return validarNovoAdministrador(valores, lista.map((a) => a.email))
  }

  // RF09 e RF11: crio e já coloco na lista. Se der erro, deixo o erro "subir" para o pop-up mostrar
  async function criar(valores) {
    setCriando(true)
    try {
      const novo = await criarAdministrador(token, valores)
      setLista((atual) => [novo, ...atual]) // a API lista do mais novo para o mais antigo
      return novo
    } finally {
      setCriando(false)
    }
  }

  // RF15 e RF17: removo e tiro da lista
  async function remover(administrador) {
    // Confiro a RN03 aqui também, para não depender só de a lixeira estar escondida
    if (!podeRemover(administrador)) throw new Error('Você não pode remover a sua própria conta.')

    setRemovendo(true)
    try {
      await removerAdministrador(token, administrador.id)
      setLista((atual) => atual.filter((a) => a.id !== administrador.id))
    } finally {
      setRemovendo(false)
    }
  }

  return {
    visiveis,
    total: lista.length, // RF01: a contagem atualiza sozinha ao criar ou remover
    busca,
    setBusca,
    carregando,
    erroLista,
    tentarNovamente: () => setTentativa((n) => n + 1),
    criando,
    removendo,
    podeRemover,
    validarNovo,
    criar,
    remover,
  }
}