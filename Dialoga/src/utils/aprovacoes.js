// ============================================================
// utils/aprovacoes.js
// Regras puras da lista de aprovação de profissionais (sem tela e sem API).
// ============================================================

// Divisão fixa entre os administradores: cada solicitação pendente tem um
// administrador responsável, e só ele a decide. Por isso as pendentes de outro
// administrador saem da lista; as decididas continuam visíveis como histórico.
// Devolve { visiveis, pendentesDeOutros }.
export function separarSolicitacoesDoAdmin(lista) {
  const visiveis = []
  let pendentesDeOutros = 0

  for (const solicitacao of lista) {
    const deOutroAdmin =
      solicitacao.status === 'pendente' && solicitacao.responsavel && !solicitacao.atribuidaAMim

    if (deOutroAdmin) pendentesDeOutros += 1
    else visiveis.push(solicitacao)
  }

  return { visiveis, pendentesDeOutros }
}
