// ============================================================
// hooks/useProfissionaisPorEspecialidade.js
// Lista os profissionais aprovados de uma especialidade (id da tabela de especialidades).
//   const lista = useProfissionaisPorEspecialidade(idEspecialidade, token)
//   lista.resultados -> [{ id, nome_completo, foto_avatar, especialidades }]
//   lista.carregando -> true enquanto a API responde
//   lista.erro       -> mensagem de erro ('' se deu certo)
// Sem especialidade escolhida (id vazio) não busca nada. O "carregando" é calculado
// (comparando o id atual com o do último resultado), sem setState direto no efeito.
// ============================================================
import { useEffect, useState } from 'react'
import { buscarProfissionaisPorEspecialidade } from '../services/pacienteService'

export function useProfissionaisPorEspecialidade(idEspecialidade, token) {
  const [resultado, setResultado] = useState(null) // { id, lista, erro }

  useEffect(() => {
    if (!idEspecialidade) return
    const controller = new AbortController()

    buscarProfissionaisPorEspecialidade(token, idEspecialidade, controller.signal)
      .then((lista) => setResultado({ id: idEspecialidade, lista, erro: '' }))
      .catch((erro) => {
        if (controller.signal.aborted) return
        setResultado({ id: idEspecialidade, lista: [], erro: erro.message })
      })

    return () => controller.abort()
  }, [idEspecialidade, token])

  const atual = idEspecialidade && resultado?.id === idEspecialidade ? resultado : null

  return {
    resultados: atual?.lista ?? [],
    carregando: Boolean(idEspecialidade) && !atual,
    erro: atual?.erro ?? '',
  }
}
