// ============================================================
// hooks/usePerfilEditavel.js
// Controla o "ver / editar / salvar" das telas de Perfil.
//   const p = usePerfilEditavel(dadosIniciais, { validar, mensagemSucesso, aoEditar, aoSalvar,
//                                                 salvarNaApi, aoSalvarComSucesso, mapearErro })
// Devolve:
//   p.valores   -> dados salvos (mostrados na leitura e no cartão)
//   p.rascunho  -> o que está sendo digitado (campos na edição)
//   p.editando  -> true enquanto a tela está em modo edição
//   p.salvando  -> true enquanto a API responde (desabilita os botões)
//   p.salvo     -> true depois de salvar (some ao abrir a edição de novo)
//   p.erros     -> { campo: 'mensagem' }
//   p.fotoUrl   -> foto para mostrar no cartão (a escolhida, ainda não salva, ou a salva)
//   p.toast / p.fecharToast -> props do <Toast {...p.toast} onFechar={p.fecharToast} />
//   p.editar() p.cancelar() p.alterar(campo, valor) p.salvar(evento) p.escolherFoto(arquivo)
// Opções:
//   validar(rascunho) -> erros | aoEditar(valores) -> rascunho inicial
//   aoSalvar(dados) -> o que vira "valores" (ex.: tirar campos de senha)
//   salvarNaApi(rascunho) -> Promise com os novos valores (se lançar Error, vira toast de erro)
//   aoSalvarComSucesso(novosValores) -> chamada depois de salvar (ex.: atualizar o menu lateral)
//   mapearErro(erro) -> { campo: 'mensagem' } quando o erro pertence a um campo (senão vira toast)
//   (se o erro trouxer `limparCampos`, esses campos do rascunho são zerados antes de mostrar o erro)
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react'

const TAMANHO_MAX_FOTO = 5 * 1024 * 1024 // 5 MB

export function usePerfilEditavel(
  inicial,
  { validar, mensagemSucesso = 'Perfil atualizado!', aoEditar, aoSalvar, salvarNaApi, aoSalvarComSucesso, mapearErro } = {},
) {
  const [valores, setValores] = useState(inicial)
  const [rascunho, setRascunho] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erros, setErros] = useState({})
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
  const [fotoPreview, setFotoPreview] = useState(null)
  const previewRef = useRef(null) // URL temporária da foto escolhida (precisa ser liberada)

  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  // libera a URL temporária da foto escolhida
  const limparPreview = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
    setFotoPreview(null)
  }, [])

  // ao sair da tela, libera a URL temporária
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function mostrarToast(tipo, mensagem) {
    setToast({ aberto: true, tipo, mensagem })
  }

  function abrirEdicao(rascunhoInicial) {
    setRascunho(rascunhoInicial)
    setErros({})
    setSalvo(false)
    setEditando(true)
  }

  function editar() {
    limparPreview()
    abrirEdicao(aoEditar ? aoEditar(valores) : valores)
  }

  function cancelar() {
    limparPreview()
    setErros({})
    setEditando(false)
  }

  // escreve em um campo e limpa o erro dele
  function alterar(campo, valor) {
    setRascunho((r) => ({ ...r, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: undefined }))
  }

  // Foto nova: mostra na hora (pré-visualização) e entra no modo edição.
  // Só é enviada ao servidor quando a pessoa clicar em "Salvar alterações".
  function escolherFoto(arquivo) {
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      mostrarToast('erro', 'Escolha um arquivo de imagem (JPG, PNG ou WebP).')
      return
    }
    if (arquivo.size > TAMANHO_MAX_FOTO) {
      mostrarToast('erro', 'A foto deve ter no máximo 5 MB.')
      return
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = URL.createObjectURL(arquivo)
    setFotoPreview(previewRef.current)

    if (editando) setRascunho((r) => ({ ...r, fotoArquivo: arquivo }))
    else abrirEdicao({ ...(aoEditar ? aoEditar(valores) : valores), fotoArquivo: arquivo })
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return

    const encontrados = validar ? validar(rascunho) : {}
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados)
      return
    }

    setSalvando(true)
    try {
      const resultado = salvarNaApi ? await salvarNaApi(rascunho) : rascunho
      // `aviso`: salvou, mas algo ficou de fora (ex.: a foto não subiu). Não vira valor da tela.
      const { aviso, ...novos } = resultado
      const finais = aoSalvar ? aoSalvar(novos) : novos

      setValores(finais)
      limparPreview()
      setEditando(false)
      setSalvo(!aviso)
      mostrarToast(aviso ? 'erro' : 'sucesso', aviso ?? mensagemSucesso)
      aoSalvarComSucesso?.(finais)
    } catch (erro) {
      // o erro pode pedir para limpar campos (ex.: senha que já foi trocada no servidor)
      if (erro.limparCampos) setRascunho((r) => ({ ...r, ...erro.limparCampos }))
      const doCampo = mapearErro?.(erro)
      if (doCampo) setErros(doCampo) // continua em edição, com o erro no campo
      else mostrarToast('erro', erro.message)
    } finally {
      setSalvando(false)
    }
  }

  return {
    valores,
    rascunho,
    editando,
    salvando,
    salvo,
    erros,
    fotoUrl: fotoPreview ?? valores.fotoUrl ?? null,
    toast,
    fecharToast,
    editar,
    cancelar,
    alterar,
    salvar,
    escolherFoto,
  }
}
