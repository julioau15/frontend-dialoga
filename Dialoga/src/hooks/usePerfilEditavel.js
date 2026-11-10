// ============================================================
// hooks/usePerfilEditavel.js
// Controla o "ver / editar / salvar" das telas de Perfil.
//   const p = usePerfilEditavel(dadosIniciais, { validar, mensagemSucesso, aoEditar, aoSalvar })
// Devolve:
//   p.valores   -> dados salvos (mostrados na leitura e no cartão)
//   p.rascunho  -> o que está sendo digitado (campos na edição)
//   p.editando  -> true enquanto a tela está em modo edição
//   p.salvo     -> true depois de salvar (some ao abrir a edição de novo)
//   p.erros     -> { campo: 'mensagem' }
//   p.toast / p.fecharToast -> props do <Toast {...p.toast} onFechar={p.fecharToast} />
//   p.editar() p.cancelar() p.alterar(campo, valor) p.salvar(evento)
// Opções:
//   validar(rascunho) -> erros | aoEditar(valores) -> rascunho inicial
//   aoSalvar(rascunho) -> o que vira "valores" (ex.: tirar campos de senha)
// ============================================================
import { useCallback, useState } from 'react'

export function usePerfilEditavel(inicial, { validar, mensagemSucesso = 'Perfil atualizado!', aoEditar, aoSalvar } = {}) {
  const [valores, setValores] = useState(inicial)
  const [rascunho, setRascunho] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erros, setErros] = useState({})
  const [toastAberto, setToastAberto] = useState(false)

  const fecharToast = useCallback(() => setToastAberto(false), [])

  function editar() {
    setRascunho(aoEditar ? aoEditar(valores) : valores)
    setErros({})
    setSalvo(false)
    setEditando(true)
  }

  function cancelar() {
    setErros({})
    setEditando(false)
  }

  // escreve em um campo e limpa o erro dele
  function alterar(campo, valor) {
    setRascunho((r) => ({ ...r, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: undefined }))
  }

  function salvar(evento) {
    evento.preventDefault()
    const encontrados = validar ? validar(rascunho) : {}
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados)
      return
    }
    // TODO: chamar a API aqui (PUT/PATCH do perfil) antes de atualizar a tela.
    setValores(aoSalvar ? aoSalvar(rascunho) : rascunho)
    setEditando(false)
    setSalvo(true)
    setToastAberto(true)
  }

  return {
    valores,
    rascunho,
    editando,
    salvo,
    erros,
    toast: { aberto: toastAberto, tipo: 'sucesso', mensagem: mensagemSucesso },
    fecharToast,
    editar,
    cancelar,
    alterar,
    salvar,
  }
}
