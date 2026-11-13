// ============================================================
// hooks/useConfiguracoesNotificacao.js
// Lógica das configurações de notificação do paciente e do profissional
// (as telas só desenham). Tudo local, com dados fixos e sem API:
//   - liga e desliga cada tipo de notificação (RF366, RF371)
//   - "Desligar todas" suspende os alertas sem perder as escolhas (RF364, RF369)
//   - abre e fecha as categorias
//   - conta as notificações ativas de cada categoria (valor calculado)
//   - salva as preferências (RF127, RF134); o aviso "Preferências salvas!"
//     é exibido pela página de Notificações
//   - descarta o que não foi salvo (botão Fechar do modal)
// Uso: const config = useConfiguracoesNotificacao(CATEGORIAS_PACIENTE, ['tarefas'])
// ============================================================
import { useMemo, useState } from 'react'

// Monta o estado inicial a partir dos dados fixos: { desligarTodas, ativos: { idDoTipo: true | false } }
function criarEstado(categorias) {
  const ativos = {}
  categorias.forEach((categoria) => {
    categoria.tipos.forEach((tipo) => {
      ativos[tipo.id] = tipo.ativo
    })
  })
  return { desligarTodas: false, ativos }
}

export function useConfiguracoesNotificacao(categorias, abertasIniciais = []) {
  // Preferências da última vez que o usuário salvou
  const [salvo, setSalvo] = useState(() => criarEstado(categorias))
  // Preferências que estão sendo editadas na tela
  const [atual, setAtual] = useState(() => criarEstado(categorias))
  // Ids das categorias abertas
  const [abertas, setAbertas] = useState(() => abertasIniciais)

  // Conta as notificações ativas de cada categoria; com "Desligar todas" ativo, nenhuma conta como ativa
  const resumo = useMemo(
    () =>
      categorias.map((categoria) => ({
        ...categoria,
        total: categoria.tipos.length,
        ativas: atual.desligarTodas ? 0 : categoria.tipos.filter((tipo) => atual.ativos[tipo.id]).length,
      })),
    [categorias, atual],
  )

  // Liga ou desliga um tipo de notificação (bloqueado enquanto "Desligar todas" estiver ativo)
  function alternarTipo(idTipo) {
    setAtual((estado) => {
      if (estado.desligarTodas) return estado
      return { ...estado, ativos: { ...estado.ativos, [idTipo]: !estado.ativos[idTipo] } }
    })
  }

  // Liga ou desliga todas as notificações, mantendo as escolhas de cada tipo
  function alternarDesligarTodas() {
    setAtual((estado) => ({ ...estado, desligarTodas: !estado.desligarTodas }))
  }

  // Alterna a abertura da categoria
  function alternarCategoria(idCategoria) {
    setAbertas((lista) =>
      lista.includes(idCategoria) ? lista.filter((id) => id !== idCategoria) : [...lista, idCategoria],
    )
  }

  // Indica se a categoria está aberta
  function estaAberta(idCategoria) {
    return abertas.includes(idCategoria)
  }

  // Guarda as preferências atuais
  function salvar() {
    setSalvo(atual)
  }

  // Volta para as preferências salvas, descartando o que não foi salvo
  function descartar() {
    setAtual(salvo)
  }

  return {
    categorias: resumo,
    ativos: atual.ativos,
    desligarTodas: atual.desligarTodas,
    alternarTipo,
    alternarDesligarTodas,
    alternarCategoria,
    estaAberta,
    salvar,
    descartar,
  }
}
