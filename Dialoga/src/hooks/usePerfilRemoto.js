// ============================================================
// hooks/usePerfilRemoto.js
// Carrega os dados da tela de Perfil na API (paciente, profissional ou admin,
// conforme o nível do usuário logado).
//   const { dados, extras, carregando, erro, recarregar } = usePerfilRemoto()
//   dados      -> campos da tela (null enquanto carrega ou se der erro)
//   extras     -> o que só o formulário precisa (profissional: opcoesEspecialidades)
//   carregando -> true até a primeira resposta
//   erro       -> texto para mostrar se a busca falhar ('' se não houve erro)
//   recarregar -> tenta de novo (botão "Tentar novamente")
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { carregarPerfil } from '../services/perfilService'

const ESTADO_INICIAL = { dados: null, extras: {}, erro: '' }

export function usePerfilRemoto() {
  const { auth } = useAuth()
  const [estado, setEstado] = useState(ESTADO_INICIAL)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controle = new AbortController()

    carregarPerfil(auth, controle.signal)
      .then(({ dados, extras }) => setEstado({ dados, extras, erro: '' }))
      .catch((erro) => {
        if (controle.signal.aborted) return // saiu da tela antes da resposta
        setEstado({ dados: null, extras: {}, erro: erro.message })
      })

    // cancela se a pessoa sair da tela antes da resposta chegar
    return () => controle.abort()
  }, [auth, tentativa])

  const recarregar = useCallback(() => {
    setEstado(ESTADO_INICIAL)
    setTentativa((t) => t + 1)
  }, [])

  return { ...estado, carregando: !estado.dados && !estado.erro, recarregar }
}
