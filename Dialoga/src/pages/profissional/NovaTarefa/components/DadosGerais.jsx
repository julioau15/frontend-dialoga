// ============================================================
// DadosGerais
// Primeiro cartão da Nova tarefa (RF276): Nome da tarefa (obrigatório),
// Instruções, Paciente e Anexar arquivo (opcionais), como no Figma.
// O arquivo escolhido guarda o nome (arquivo, mostrado na tela) e o próprio File (arquivoFile, enviado à API).
// Na edição, o anexo que já existe vem só com o nome (anexoUrl guarda o endereço dele).
// Props:
//   dados      -> { titulo, instrucoes, arquivo, arquivoFile, anexoUrl, pacientes }
//   erros      -> { titulo, pacientes }
//   onMudar    -> onMudar(campo, valor)
//   pacientes  -> pacientes que podem receber tarefa: [{ id, nome }] (ver SeletorPacientes)
//   carregandoPacientes, erroPacientes -> estado da busca dessa lista
// ============================================================
import { useRef } from 'react'
import Card from '../../../../components/Card'
import { IconeX } from '../../../../components/Icones'
import BotaoIcone from './BotaoIcone'
import { CampoTexto, Rotulo } from './campos'
import SeletorPacientes from './SeletorPacientes'
import { IconeClipe } from './iconesNovaTarefa'

export default function DadosGerais({ dados, erros, onMudar, pacientes, carregandoPacientes, erroPacientes }) {
  const inputArquivo = useRef(null)

  // limpa o arquivo escolhido (e o <input>, para poder escolher o mesmo arquivo de novo)
  function removerArquivo() {
    onMudar('arquivo', null)
    onMudar('arquivoFile', null)
    onMudar('anexoUrl', null)
    if (inputArquivo.current) inputArquivo.current.value = ''
  }

  return (
    <Card as="section" aria-label="Dados gerais" className="flex flex-col gap-5 px-5 pt-6 pb-5 sm:px-[21px]">
      <CampoTexto
        rotulo="Nome da tarefa"
        obrigatorio
        placeholder="Ex: Diário de Humor Semanal"
        maxLength={200}
        value={dados.titulo}
        erro={erros.titulo}
        onChange={(e) => onMudar('titulo', e.target.value)}
      />

      <CampoTexto
        rotulo="Instruções"
        opcional
        multilinha
        placeholder="Orientações para o paciente..."
        value={dados.instrucoes}
        onChange={(e) => onMudar('instrucoes', e.target.value)}
      />

      <SeletorPacientes
        pacientes={pacientes}
        carregando={carregandoPacientes}
        erroLista={erroPacientes}
        selecionados={dados.pacientes}
        onMudar={(lista) => onMudar('pacientes', lista)}
        erro={erros.pacientes}
      />

      <div className="flex flex-col gap-2">
        <Rotulo opcional>Anexar arquivo</Rotulo>
        <input
          ref={inputArquivo}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-label="Anexar arquivo"
          onChange={(e) => {
            const arquivo = e.target.files?.[0] ?? null
            onMudar('arquivo', arquivo?.name ?? null)
            onMudar('arquivoFile', arquivo)
            onMudar('anexoUrl', null) // o arquivo novo substitui o anexo antigo
          }}
        />
        {dados.arquivo ? (
          <div className="flex h-11 items-center gap-2 rounded-xl border border-borda-forte bg-fundo-card pl-4 pr-1.5 text-[13px] text-texto">
            <IconeClipe tamanho={14} className="text-secundaria" />
            <span className="min-w-0 flex-1 truncate">{dados.arquivo}</span>
            <BotaoIcone rotulo="Remover arquivo" perigo onClick={removerArquivo}>
              <IconeX tamanho={14} />
            </BotaoIcone>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputArquivo.current?.click()}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-borda-forte bg-branco px-3 text-[13px] text-secundaria transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            + Anexar arquivo à tarefa
          </button>
        )}
      </div>
    </Card>
  )
}
